# 🔧 OAuth2 401 Unauthorized - Complete Debug & Fix Guide

## ⚡ WHAT WAS THE ISSUE?

The `POST /api/oauth2/complete-profile` endpoint was returning **401 Unauthorized** after successful OAuth login because:

1. **CORS Wildcard Conflict**: The original config used `addAllowedOriginPattern("*")` with `setAllowCredentials(true)`, which violates CORS spec
2. **Missing Authorization Header in CORS Preflight**: The Authorization header wasn't explicitly allowed in CORS configuration
3. **Frontend Not Sending Credentials**: The fetch API wasn't using `credentials: "include"` for cross-origin requests
4. **JWT Filter Not Extracting Token**: The security context wasn't properly populated with the JWT authentication

---

## ✅ COMPLETE FIXES IMPLEMENTED

### 1️⃣ **Backend: SecurityConfig.java** (CORS Configuration)

**What Changed:**
- ❌ **Before**: `addAllowedOriginPattern("*")` - Wildcard origin with credentials
- ✅ **After**: Explicit list of allowed origins from `cors.allowed.origins` property

```java
// FIX #1: Use explicit origins instead of wildcard
String[] allowedOriginArray = corsAllowedOrigins.split(",");
List<String> allowedOrigins = Arrays.stream(allowedOriginArray)
    .map(String::trim)
    .toList();
configuration.setAllowedOrigins(allowedOrigins);

// FIX #2: Explicitly allow Authorization header
configuration.setAllowedHeaders(Arrays.asList(
    "Content-Type", 
    "Authorization",  // ← This was missing!
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

// FIX #4: Enable credentials (can now use with explicit origins)
configuration.setAllowCredentials(true);

// FIX #5: Expose Authorization header in response
configuration.setExposedHeaders(Arrays.asList(
    "Authorization",
    "Content-Type"
));
```

**Why This Fixes 401:**
- CORS preflight now includes `Authorization` in allowed headers
- Browser sends the `Authorization: Bearer <token>` header
- Spring Security's JwtFilter receives and processes the token

---

### 2️⃣ **Backend: JwtFilter.java** (Enhanced Debugging)

**Added Comprehensive Logging:**

```java
if (jwt != null) {
    log.debug("[JwtFilter] Token found in request for path: {}", requestPath);
}

// Extract and validate
String username = jwtService.extractUsername(jwt);
Long userId = jwtService.extractUserId(jwt);
log.debug("[JwtFilter] Extracted username: {}, userId: {} from token", username, userId);

// Validate token
if (jwtService.isTokenValid(jwt, userDetails)) {
    JwtAuthenticationToken authToken = 
        new JwtAuthenticationToken(username, userId, jwt, userDetails.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authToken);
    log.debug("[JwtFilter] ✅ JWT Token valid. Authentication set for user: {} (ID: {})", 
        username, userId);
}
```

**Check Logs In Console:**
```
[JwtFilter] Token found in request for path: /api/oauth2/complete-profile
[JwtFilter] Extracted username: google-user@example.com, userId: 1 from token
[JwtFilter] ✅ JWT Token valid. Authentication set for user: google-user@example.com (ID: 1)
```

---

### 3️⃣ **Backend: OAuthController.java** (Authentication Handling)

**Changed from manual header parsing to Spring Security Authentication:**

```java
// ❌ OLD: Manual header parsing
@PostMapping("/complete-profile")
public ResponseEntity<ApiResponse<AuthResponse>> completeProfile(
        @RequestHeader(value = "Authorization", required = false) String bearerToken,
        @RequestBody Map<String, String> profileData) {
    if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)...
    }
}

// ✅ NEW: Spring Security Authentication object (populated by JwtFilter)
@PostMapping("/complete-profile")
public ResponseEntity<ApiResponse<AuthResponse>> completeProfile(
        Authentication authentication,  // ← Spring injects this
        @RequestBody Map<String, String> profileData) {
    
    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(401, "User is not authenticated", null));
    }
    
    // Extract userId from JWT token in Authentication
    Long userId = null;
    if (authentication instanceof JwtAuthenticationToken) {
        userId = ((JwtAuthenticationToken) authentication).getUserId();
    }
}
```

**Why This Works:**
1. JwtFilter extracts token from `Authorization` header
2. Creates `JwtAuthenticationToken` with userId
3. Stores in `SecurityContextHolder`
4. Spring injects into controller parameter
5. No manual header parsing needed!

---

### 4️⃣ **Frontend: api.js** (CORS Credentials & Logging)

**Added credentials and debugging:**

```javascript
// ✅ FIX #1: Create fetch options with credentials for CORS
function createFetchOptions(method = "GET", body = null, headers = {}) {
  const options = {
    method,
    headers,
    credentials: "include",  // ← Send Authorization header with CORS
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

// ✅ FIX #2: Log token and headers
function authHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("[API] 🔐 Authorization header set");
  } else {
    console.log("[API] ⚠️ No token found!");
  }
  return headers;
}

// ✅ FIX #3: Use credentials in all authenticated requests
export async function completeProfile(payload) {
  console.log("[API] POST /oauth2/complete-profile");
  const headers = authHeaders();
  
  const res = await fetch(`${API_BASE_URL}/oauth2/complete-profile`, 
    createFetchOptions("POST", payload, headers)  // ← includes credentials
  );
  const data = await handleResponse(res);
  if (data?.data?.token) setAuthToken(data.data.token);
  return data;
}
```

**Browser Console Output:**
```
[API] 📝 Token stored in localStorage
[API] 🔐 Authorization header set for request
[API] POST /oauth2/complete-profile
[API] ✅ Response received successfully
```

---

## 🐛 HOW TO DEBUG IF STILL GETTING 401

### Step 1: Check Browser Network Tab

1. Open Chrome DevTools → Network tab
2. Trigger OAuth login → complete profile
3. Look at `POST /api/oauth2/complete-profile` request

**Check Headers (Request):**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Expected Response Headers (Response):**
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With
```

### Step 2: Check Browser Console

```javascript
// In React component after OAuth redirect
const token = localStorage.getItem("nextradex_token");
console.log("[DEBUG] Token in localStorage:", token);

const headers = new Headers({
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
});
console.log("[DEBUG] Request headers:", Object.fromEntries(headers));
```

### Step 3: Check Backend Logs

**Look for these logs:**

```
[JwtFilter] Token found in request for path: /api/oauth2/complete-profile
[JwtFilter] Extracted username: user@example.com, userId: 1 from token
[JwtFilter] ✅ JWT Token valid. Authentication set for user: user@example.com (ID: 1)

complete-profile: Processing profile setup for userId: 1
complete-profile: Profile setup completed for user: new-username
```

**If you see these errors:**
```
❌ [JwtFilter] No token found for path: /api/oauth2/complete-profile
   → Authorization header not being sent (check credentials in fetch)

❌ [JwtFilter] JWT Token validation failed
   → Token is expired or invalid (check expiration time in JWT)

❌ complete-profile: Authentication is null or not authenticated
   → JwtFilter didn't populate SecurityContextHolder
```

### Step 4: Add Debug Endpoint

**Call this endpoint to check authentication:**

```javascript
// In React console
fetch('http://localhost:8080/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('nextradex_token')}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log("Profile response:", data))
.catch(err => console.error("Error:", err));
```

**Console Output If Working:**
```
[DEBUG] /user/profile - Authentication type: JwtAuthenticationToken
[DEBUG] /user/profile - Is authenticated: true
[DEBUG] /user/profile - JWT Principal: user@example.com, UserId: 1
Profile response: {code: 200, message: "Profile retrieved", data: {...}}
```

---

## 🔍 VERIFICATION CHECKLIST

✅ **Backend Checks:**
- [ ] `cors.allowed.origins` in `application.properties` includes `http://localhost:3000`
- [ ] `JwtFilter` is registered before `UsernamePasswordAuthenticationFilter`
- [ ] `SessionCreationPolicy.STATELESS` is configured
- [ ] `Authorization` header is in `allowedHeaders`
- [ ] `setAllowCredentials(true)` is set

✅ **Frontend Checks:**
- [ ] Token is stored in `localStorage` after OAuth redirect
- [ ] `Authorization` header includes `Bearer <token>`
- [ ] `credentials: "include"` in fetch options
- [ ] No browser console errors about CORS

✅ **Testing Sequence:**
1. Start fresh (clear localStorage): `localStorage.clear()`
2. Click Google Login
3. Check that `/auth?token=<JWT>` redirects to profile setup
4. Token is stored: `console.log(localStorage.getItem("nextradex_token"))`
5. Submit profile form (complete-profile endpoint called)
6. Check response status is 200 (not 401)

---

## 📝 QUICK REFERENCE: What Each File Does

| File | Role | Why It Matters |
|------|------|---|
| **SecurityConfig.java** | CORS + JWT Filter registration | Allows cross-origin requests with Authorization header |
| **JwtFilter.java** | Extracts JWT from Authorization header | Populates SecurityContextHolder so @Authentication works |
| **OAuthController.java** | Receives Authentication object | Uses Spring Security instead of manual header parsing |
| **api.js** | Sends Authorization header with credentials | Browser actually sends the token to backend |

---

## 🚀 PRODUCTION CHECKLIST

Before deploying to production:

```bash
# 1. Update application.properties for production
cors.allowed.origins=https://yourdomain.com
jwt.secret=<GENERATE_STRONG_256_BIT_KEY>
jwt.expiration=86400000  # 24 hours

# 2. Verify OAuth redirect URI
spring.security.oauth2.client.registration.google.redirect-uri=https://yourdomain.com/api/login/oauth2/code/google
oauth.frontend.callback-url=https://yourdomain.com/auth

# 3. Enable HTTPS only
server.ssl.enabled=true
server.ssl.key-store=<PATH_TO_KEYSTORE>

# 4. Disable debug logging in production
logging.level.com.NexTradeX=INFO
logging.level.org.springframework.security=WARN
```

---

## 📞 STILL HAVING ISSUES?

**Most Common Causes:**

1. **Token not in localStorage after OAuth**
   - Check: URL after redirect includes `?token=...`
   - Check: `setAuthToken(token)` is called in AuthPage.jsx

2. **CORS error in browser console**
   - Check: No wildcard + credentials issue
   - Check: `cors.allowed.origins` matches `window.location.origin`

3. **401 with "Invalid token: missing userId"**
   - Check: Token was generated with `jwtService.generateTokenWithUserId()`
   - Check: Token hasn't expired

4. **401 with "User is not authenticated"**
   - Check: JwtFilter log shows token found and valid
   - Check: Authentication object is being created
   - Check: `SessionCreationPolicy.STATELESS` is configured

