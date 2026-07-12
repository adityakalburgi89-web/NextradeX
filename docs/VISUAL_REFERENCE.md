#  OAuth 401 Fix - Visual Reference

## The Problem: Request Flow (Before Fix)

```
┌─────────────┐                              ┌──────────────┐
│   Frontend  │                              │   Backend    │
│ (React 3000)│                              │ (Spring 8080)│
└─────────────┘                              └──────────────┘
      │                                             │
      │                                             │
      │──── 1. Google OAuth Login ─────────────────>│
      │                                             │
      │<──── 2. Token in URL /auth?token=JWT ─────  │
      │       (OAuth2AuthenticationSuccessHandler)  │
      │                                             │
      │ 3. Store Token in localStorage             │
      │    localStorage.setItem("token", jwt)      │
      │                                             │
      │    4. POST /oauth2/complete-profile        │
      │        CORS blocks Authorization header  │
      │        credentials: "include" missing    │
      │<──── 5. 401 Unauthorized ─────────────────  │
      │       (No Authorization header received)    │
      │                                             │
```

## The Solution: Enhanced Request Flow (After Fix)

```
┌─────────────┐                              ┌──────────────┐
│   Frontend  │                              │   Backend    │
│ (React 3000)│                              │ (Spring 8080)│
└─────────────┘                              └──────────────┘
      │                                             │
      │                                             │
      │──── 1. Google OAuth Login ─────────────────>│
      │                                             │
      │<──── 2. Token in URL ──────────────────────  │
      │       OAuth2AuthenticationSuccessHandler    │
      │                                             │
      │ 3. Store Token in localStorage             │
      │     Token stored successfully            │
      │                                             │
      │    4. POST /oauth2/complete-profile        │
      │        Header: Authorization: Bearer JWT │
      │        credentials: "include" set        │
      │        CORS preflight with Auth header   │
      │                                             │
      │────────────────────────────────────────────>│
      │       Content-Type: application/json        │
      │       Authorization: Bearer <JWT>           │
      │       (OPTIONS preflight first)             │
      │                                             │
      │                                        JwtFilter
      │                                       Extracts JWT
      │                                       Validates
      │                                       Sets SecurityContext
      │                                             │
      │                                        OAuthController
      │                                       Gets @Authentication
      │                                       Updates profile
      │                                             │
      │<──── 5. 200 OK Response ──────────────────  │
      │       New JWT token, updated user data     │
      │                                             │
      │ 6. Update localStorage with new token      │
      │    Redirect to dashboard                   │
      │                                             │
      │    7. All subsequent requests work!      │
      │       Authorization header sent correctly   │
      │                                             │
```

---

## CORS Configuration Comparison

###  BEFORE (Broken)

```java
CorsConfiguration configuration = new CorsConfiguration();

// PROBLEM: Wildcard + credentials = CORS violation
configuration.addAllowedOriginPattern("*");
configuration.setAllowCredentials(true);

// PROBLEM: Authorization header not explicitly allowed
configuration.addAllowedHeader(CorsConfiguration.ALL);
configuration.addAllowedMethod(CorsConfiguration.ALL);

// RESULT: 
// - Browser blocks preflight for Authorization header
// - No Authorization header sent in request
// - Backend gets 401 because no token
```

###  AFTER (Fixed)

```java
CorsConfiguration configuration = new CorsConfiguration();

// FIX 1: Explicit origins list
List<String> allowedOrigins = Arrays.asList("http://localhost:3000");
configuration.setAllowedOrigins(allowedOrigins);

// FIX 2: Explicitly list allowed headers
configuration.setAllowedHeaders(Arrays.asList(
    "Content-Type", 
    "Authorization",    // ← NOW ALLOWED
    "Accept",
    "X-Requested-With"
));

// FIX 3: Explicit HTTP methods
configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
));

// FIX 4: Now safe to enable credentials
configuration.setAllowCredentials(true);
configuration.setMaxAge(3600L);

// FIX 5: Expose Authorization in response
configuration.setExposedHeaders(Arrays.asList(
    "Authorization", "Content-Type"
));

// RESULT:
//  Preflight succeeds with Authorization
//  Actual request includes Authorization header
//  Backend authenticates with JWT
//  200 OK response
```

---

## JWT Token Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Google OAuth Success (OAuth2AuthenticationSuccessHandler)  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Extract OAuth2 User Info            │
         │ - email                             │
         │ - first_name                        │
         │ - last_name                         │
         │ - picture                           │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ JwtService.generateTokenWithUserId  │
         │ - Subject: username                 │
         │ - Claim: userId (from DB)           │
         │ - Signed with secret                │
         │ - Expires: 24 hours                 │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Token in URL:                       │
         │ /auth?token=<JWT>&setup=true        │
         │ (sent to frontend)                  │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Frontend Receives Token (AuthPage.jsx)                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ localStorage.setItem(                │
         │   "nextradex_token",                │
         │   token                             │
         │ )                                   │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Show Profile Setup Form             │
         │ (if setup=true param)               │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. Frontend Sends Complete Profile Request                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ POST /oauth2/complete-profile       │
         │ Headers:                            │
         │ {                                   │
         │   "Authorization":                  │
         │   "Bearer <JWT>",  ← FROM TOKEN    │
         │   "Content-Type":                   │
         │   "application/json"                │
         │ }                                   │
         │ Body: {username, firstName, ...}   │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Backend Processes Request (JwtFilter)                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Extract from Authorization header   │
         │ "Bearer <JWT>"                      │
         │ ↓                                   │
         │ token = JWT (without "Bearer ")     │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ JwtService.extractUsername(token)   │
         │ ↓                                   │
         │ "google_user@example.com"           │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ JwtService.extractUserId(token)     │
         │ ↓                                   │
         │ 123 (from JWT claim)                │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ JwtService.isTokenValid(token, user)│
         │ - Check signature                │
         │ - Check expiration               │
         │ - Check username matches         │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Create JwtAuthenticationToken       │
         │ - username: "google_user@..."       │
         │ - userId: 123                       │
         │ - token: <JWT>                      │
         │ - authorities: [ROLE_USER]          │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ SecurityContextHolder.getContext()   │
         │ .setAuthentication(authToken)        │
         │                                     │
         │  Authentication now available!    │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. OAuthController Receives Request                           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ @PostMapping("/complete-profile")   │
         │ public ResponseEntity completeProfile│
         │ (Authentication authentication,     │
         │  Map<String,String> profileData)    │
         │                                     │
         │ ← Spring injects from              │
         │   SecurityContextHolder!            │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Check: authentication != null?   │
         │ Check: authenticated?            │
         │ Extract: userId from JWT         │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ UserService.updateProfileSetup(     │
         │   userId,                           │
         │   newUsername,                      │
         │   firstName,                        │
         │   lastName                          │
         │ )                                   │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Generate new JWT with updated info  │
         │ jwtService.generateTokenWithUserId( │
         │   newUsername,                      │
         │   userId                            │
         │ )                                   │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ Return 200 OK with:                 │
         │ {                                   │
         │   "code": 200,                      │
         │   "message": "Profile ...",         │
         │   "data": {                         │
         │     "token": <NEW_JWT>,             │
         │     "username": "new_username",     │
         │     "email": "...",                 │
         │     "expiresIn": 86400000           │
         │   }                                 │
         │ }                                   │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Frontend Updates and Redirects                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ localStorage.setItem(                │
         │   "nextradex_token",                │
         │   newToken  ← Updated with new user │
         │ )                                   │
         └─────────────────────────────────────┘
                              │
                              ↓
         ┌─────────────────────────────────────┐
         │ window.location.href = "/"          │
         │ (Redirect to dashboard)             │
         └─────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. All Subsequent API Calls Work!                             │
└──────────────────────────────────────────────────────────────┘
    
    GET /api/user/profile
    POST /api/orders/spot
    GET /api/wallets
    etc.
    
    All have: Authorization: Bearer <TOKEN> 
    All return: 200 OK 
```

---

## Summary Table: What Each Fix Does

| Fix | Where | What | Why | Result |
|-----|-------|------|-----|--------|
| Explicit Origins | SecurityConfig | Replace wildcard with explicit list | CORS spec compliance | Preflight succeeds |
| Auth in Headers | SecurityConfig | Add "Authorization" to allowed headers | Tells browser it's allowed | Browser sends header |
| credentials mode | api.js | Add `credentials: "include"` | Tells browser to send cross-origin credentials | Authorization header sent |
| Debug Logging | JwtFilter | Add console.log statements | Troubleshooting | See what's happening |
| Auth Injection | OAuthController | Accept `@Authentication` parameter | Spring Security integration | No manual header parsing |

---

## Execution Timeline

```
Time  │ Event
─────┼──────────────────────────────────────────────────────
 0ms  │ User clicks "Login with Google"
      │ Browser → Google OAuth consent screen
      │
100ms │ User authenticates with Google
      │
200ms │ Browser redirected to:
      │ http://localhost:8080/api/login/oauth2/code/google?code=...
      │
300ms │ Backend processes Google callback
      │ OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess()
      │
310ms │ Backend generates JWT token
      │ jwtService.generateTokenWithUserId()
      │
320ms │ Backend redirects to:
      │ http://localhost:3000/auth?token=<JWT>&setup=true
      │
330ms │ Frontend receives URL with token
      │ AuthPage.jsx useEffect hook
      │
340ms │ Frontend stores token in localStorage
      │ setAuthToken(token)
      │
350ms │ Frontend shows profile setup form
      │ needsSetup = true
      │
2000  │ User fills form and clicks "Complete Setup"
ms    │
      │
2010  │ Frontend reads token from localStorage
ms    │ token = localStorage.getItem("nextradex_token")
      │
2020  │ Frontend sends POST /oauth2/complete-profile
ms    │ Headers: Authorization: Bearer <TOKEN>
      │ Body: {username, firstName, lastName}
      │
2025  │ Browser sends CORS preflight (OPTIONS)
ms    │  Now includes Authorization header (thanks to CORS fix)
      │
2030  │ Backend responds to preflight with 200 OK
ms    │ Headers: Access-Control-Allow-Headers: Authorization...
      │
2035  │ Browser sends actual POST request
ms    │  With Authorization header (credentials: "include" fix)
      │
2040  │ JwtFilter intercepts request
ms    │ Extracts token from Authorization header
      │ Creates JwtAuthenticationToken
      │ Sets in SecurityContextHolder
      │
2045  │ OAuthController.completeProfile() called
ms    │  Authentication parameter injected by Spring
      │
2050  │ Controller validates token and userId
ms    │  Both successful (Authentication was populated)
      │
2055  │ Controller updates user profile in DB
ms    │
2060  │ Controller generates new JWT with updated username
ms    │
2065  │ Controller returns 200 OK with new token
ms    │
2070  │ Frontend receives response
ms    │  Status 200 (not 401!)
      │
2075  │ Frontend updates localStorage with new token
ms    │ setAuthToken(newToken)
      │
2080  │ Frontend redirects to dashboard
ms    │ window.location.href = "/"
      │
2100  │ Dashboard loads
ms    │ All API calls work! 
      │
```

---

## Architecture Diagram: Request Processing

```
┌─ CORS Layer ────────────────────────────────────────────┐
│                                                          │
│  Preflight Check:                                       │
│  - Origin matches allowed list?                       │
│  - Authorization in allowed headers?                  │
│  - Method in allowed methods?                         │
│  - Credentials mode?                                  │
│                                                          │
│  Response: 200 OK (preflight passes)                   │
└──────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─ Actual Request ────────────────────────────────────────┐
│                                                          │
│  POST /oauth2/complete-profile                          │
│  Header: Authorization: Bearer <JWT>                   │
│  Body: {username, firstName, lastName}                 │
└──────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─ Filter Chain ──────────────────────────────────────────┐
│                                                          │
│  1. CorsFilter                                          │
│     ├─ Validates CORS headers                          │
│     ├─ Sets Access-Control-* response headers          │
│     └─ Continue
│                                                          │
│  2. JwtFilter ← ← ← KEY FILTER                         │
│     ├─ Extract Authorization header                    │
│     ├─ Parse JWT token                                 │
│     ├─ Validate token signature & expiration           │
│     ├─ Load UserDetails from database                  │
│     ├─ Create JwtAuthenticationToken                   │
│     ├─ Set in SecurityContextHolder ← CRITICAL         │
│     └─ Continue
│                                                          │
│  3. RequestMappingHandlerMapping                       │
│     ├─ Route to controller method                      │
│     ├─ Resolve @Authentication parameter               │
│     │   └─ From SecurityContextHolder ← WORKS NOW      │
│     └─ Continue
│                                                          │
└──────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─ OAuthController ───────────────────────────────────────┐
│                                                          │
│  @PostMapping("/complete-profile")                      │
│  public ResponseEntity<...> completeProfile(            │
│    Authentication authentication,  ← INJECTED           │
│    Map<String,String> profileData                       │
│  ) {                                                    │
│    // authentication != null                          │
│    // authentication.isAuthenticated() == true        │
│    Long userId = auth.getUserId() ← FROM JWT         │
│                                                          │
│    // Update profile                                    │
│    // Generate new token                               │
│    // Return 200 OK                                   │
│  }                                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         │
                         ↓
                    Response: 200 OK
                    {token: new_jwt, ...}
```

---

This visual reference should help you understand exactly what was broken and how the fix works!

