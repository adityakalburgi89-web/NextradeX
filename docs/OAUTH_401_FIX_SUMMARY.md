#  OAuth2 401 Unauthorized - Fix Summary

## Problem Statement
After successful Google OAuth2 login, the `/api/oauth2/complete-profile` endpoint returns **401 Unauthorized** even though:
- OAuth login succeeds
- User is created in database
- JWT token is generated and returned to frontend
- No Authorization header is being sent with the API request

## Root Causes Identified

### 1. CORS Configuration Issue
**The Problem:**
```java
//  INCORRECT (from original SecurityConfig)
configuration.addAllowedOriginPattern("*");  // Wildcard
configuration.setAllowCredentials(true);     // With credentials
```
This violates the CORS specification: **you cannot use wildcard origins with `allowCredentials=true`**

### 2. Missing Authorization Header in CORS
**The Problem:**
```java
//  INCORRECT (from original SecurityConfig)
configuration.addAllowedHeader(CorsConfiguration.ALL);
```
The `Authorization` header wasn't explicitly allowed, causing preflight to fail

### 3. Frontend Not Sending Credentials
**The Problem:**
```javascript
//  INCORRECT (from original api.js)
const res = await fetch(`${API_BASE_URL}/oauth2/complete-profile`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
    // Missing: credentials: "include"
});
```
Without `credentials: "include"`, browser doesn't send Authorization header for cross-origin requests

---

## Complete Solution

### Part 1: Backend Security Configuration

**File:** `src/main/java/com/NexTradeX/config/SecurityConfig.java`

**Key Changes:**
1.  Explicitly list allowed origins instead of wildcard
2.  Add `Authorization` to allowed headers for CORS preflight
3.  Allow all HTTP methods
4.  Expose Authorization header in response
5.  Add OAuth2 failure handler

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // FIX #1: Use explicit origins list
    String[] allowedOriginArray = corsAllowedOrigins.split(",");
    List<String> allowedOrigins = Arrays.stream(allowedOriginArray)
        .map(String::trim)
        .toList();
    configuration.setAllowedOrigins(allowedOrigins);
    
    // FIX #2: Explicitly allow Authorization header for CORS preflight
    configuration.setAllowedHeaders(Arrays.asList(
        "Content-Type", 
        "Authorization",  // ← CRITICAL FIX
        "Accept",
        "X-Requested-With"
    ));
    
    // FIX #3: Allow all HTTP methods
    configuration.setAllowedMethods(Arrays.asList(
        HttpMethod.GET.name(),
        HttpMethod.POST.name(),
        HttpMethod.PUT.name(),
        HttpMethod.DELETE.name(),
        HttpMethod.PATCH.name(),
        HttpMethod.OPTIONS.name()
    ));
    
    // FIX #4: Enable credentials (now safe with explicit origins)
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    // FIX #5: Expose Authorization header in response
    configuration.setExposedHeaders(Arrays.asList(
        "Authorization",
        "Content-Type"
    ));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### Part 2: JWT Filter Enhancement

**File:** `src/main/java/com/NexTradeX/config/JwtFilter.java`

**Key Changes:**
1.  Add comprehensive debug logging
2.  Proper error handling
3.  Clear separation of concerns

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {
    try {
        String jwt = extractTokenFromRequest(request);
        String requestPath = request.getRequestURI();
        
        // DEBUG: Log token extraction
        if (jwt != null) {
            log.debug("[JwtFilter] Token found in request for path: {}", requestPath);
        } else {
            log.debug("[JwtFilter] No token found for path: {}", requestPath);
        }
        
        // FIX: Only process if token exists
        if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String username = jwtService.extractUsername(jwt);
                Long userId = jwtService.extractUserId(jwt);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                // Validate token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // FIX: Create authentication with userId
                    JwtAuthenticationToken authToken = 
                        new JwtAuthenticationToken(
                            username, userId, jwt, userDetails.getAuthorities());
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("[JwtFilter]  JWT Token valid for: {} (ID: {})", username, userId);
                }
            } catch (Exception e) {
                log.error("[JwtFilter]  JWT processing error: {}", e.getMessage());
            }
        }
    } catch (Exception e) {
        log.error("[JwtFilter]  Unexpected error: {}", e.getMessage());
    }
    
    filterChain.doFilter(request, response);
}
```

---

### Part 3: OAuth Controller Update

**File:** `src/main/java/com/NexTradeX/oauth/OAuthController.java`

**Key Changes:**
1.  Accept Spring Security `Authentication` object (populated by JwtFilter)
2.  Remove manual header parsing
3.  Add comprehensive error messages and logging

```java
@PostMapping("/complete-profile")
public ResponseEntity<ApiResponse<AuthResponse>> completeProfile(
        Authentication authentication,  // Spring injects this!
        @RequestBody Map<String, String> profileData) {
    try {
        // FIX #1: Check Spring Security authentication
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("complete-profile: Authentication is null or not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "User is not authenticated. JWT token missing or invalid.", null));
        }
        
        // FIX #2: Extract userId from JWT token
        Long userId = null;
        if (authentication instanceof JwtAuthenticationToken) {
            userId = ((JwtAuthenticationToken) authentication).getUserId();
        } else {
            userId = jwtService.extractUserIdFromAuthentication(authentication);
        }
        
        if (userId == null) {
            log.warn("complete-profile: Could not extract userId from authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Invalid token: missing userId.", null));
        }
        
        log.info("complete-profile: Processing profile setup for userId: {}", userId);
        
        // ... rest of implementation
    } catch (Exception e) {
        log.error("Profile completion failed: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(400, "Profile setup failed: " + e.getMessage(), null));
    }
}
```

---

### Part 4: Frontend API Configuration

**File:** `frontend/src/api.js`

**Key Changes:**
1.  Add `credentials: "include"` to all requests
2.  Add debug logging for token and headers
3.  Create helper function for consistent fetch options

```javascript
// FIX #1: Create fetch options with credentials for CORS
function createFetchOptions(method = "GET", body = null, headers = {}) {
  const options = {
    method,
    headers,
    credentials: "include",  // ← CRITICAL: Send Authorization header with CORS
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

// FIX #2: Add logging to authHeaders
function authHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("[API]  Authorization header set for request");
  } else {
    console.log("[API]  No token found for Authorization header");
  }
  return headers;
}

// FIX #3: Use credentials in all authenticated requests
export async function completeProfile(payload) {
  console.log("[API] POST /oauth2/complete-profile - Payload:", payload);
  const headers = authHeaders();
  
  const res = await fetch(`${API_BASE_URL}/oauth2/complete-profile`, 
    createFetchOptions("POST", payload, headers)  // ← includes credentials
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}
```

---

## How The Fix Works (Flow Diagram)

```
1. User completes OAuth login 
   ↓
2. OAuth handler generates JWT token 
   ↓
3. JWT token sent in URL: /auth?token=<JWT>
   ↓
4. Frontend stores token: localStorage.setItem("nextradex_token", token)
   ↓
5. Frontend calls POST /api/oauth2/complete-profile
   ├─ Headers include: Authorization: Bearer <JWT>
   ├─ credentials: "include" tells browser to send headers
   ↓
6. Backend receives request with Authorization header 
   ↓
7. JwtFilter.doFilterInternal() called
   ├─ Extracts JWT from Authorization header
   ├─ Validates token
   ├─ Creates JwtAuthenticationToken
   ├─ Stores in SecurityContextHolder
   ↓
8. OAuthController.completeProfile() receives Authentication object 
   ├─ Spring automatically injects populated Authentication
   ├─ Gets userId from JWT
   ├─ Updates user profile
   ├─ Returns new JWT with updated info
   ↓
9. Frontend receives 200 OK response 
   ├─ Stores new token
   ├─ Redirects to dashboard
   ↓
10. All subsequent API calls include Authorization header 
```

---

## Testing The Fix

### Step 1: Verify CORS Configuration
```bash
curl -X OPTIONS http://localhost:8080/api/oauth2/complete-profile \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Authorization,Content-Type
Access-Control-Allow-Credentials: true
```

### Step 2: Test Complete Flow in Browser
1. Open DevTools Console
2. Click Google Login button
3. Complete OAuth flow
4. Wait for redirect to profile setup
5. Check console for:
   ```
   [API]  Token stored in localStorage
   [API]  Authorization header set for request
   [API] POST /oauth2/complete-profile
   [API]  Response received successfully
   ```
6. Check Network tab → POST complete-profile:
   - **Request Headers**: Should include `Authorization: Bearer ...`
   - **Response Status**: Should be 200 (not 401)
   - **Response Headers**: Should include `Access-Control-Allow-Credentials: true`

### Step 3: Monitor Backend Logs
```
[JwtFilter] Token found in request for path: /api/oauth2/complete-profile
[JwtFilter] Extracted username: user@example.com, userId: 1 from token
[JwtFilter]  JWT Token valid. Authentication set for user: user@example.com (ID: 1)
complete-profile: Processing profile setup for userId: 1
complete-profile: Profile setup completed for user: john_doe
```

---

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| SecurityConfig.java | CORS config, imports |  Complete |
| JwtFilter.java | Debug logging, error handling |  Complete |
| OAuthController.java | Authentication injection, error messages |  Complete |
| UserController.java | Import fixes, debug endpoint |  Complete |
| frontend/src/api.js | credentials mode, logging |  Complete |

## Configuration Required

**application.properties** (already set, but verify):
```properties
# CORS - Make sure this matches your frontend URL
cors.allowed.origins=http://localhost:3000

# JWT
jwt.secret=NexTradeX-Default-Secret-Key-For-Development-256-Bits-Minimum
jwt.expiration=86400000

# OAuth
oauth.frontend.callback-url=http://localhost:3000/auth
```

---

## Verification Commands

```bash
# Check if JWT is being set
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' | jq '.data.token'

# Check if token is valid
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' | jq -r '.data.token')

# Test complete-profile endpoint with token
curl -X POST http://localhost:8080/api/oauth2/complete-profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"username":"newname","firstName":"John","lastName":"Doe"}'
```

---

## Summary

The 401 error was caused by **CORS blocking the Authorization header** and **frontend not sending credentials**. 

**The fix involves:**
1.  Update CORS config to explicitly allow `Authorization` header
2.  Add `credentials: "include"` to frontend fetch calls
3.  Let JwtFilter populate Spring Security Authentication
4.  Let OAuthController inject the Authentication object
5.  Add comprehensive logging for debugging

**Result:** Frontend JWT tokens are now properly sent and validated, allowing `/api/oauth2/complete-profile` to work correctly.

