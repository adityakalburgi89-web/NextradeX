# ⚡ Quick Verification - OAuth 401 Fix

## What Was Fixed?

| Issue | Fix | Status |
|-------|-----|--------|
| CORS blocking Authorization header | Explicitly allow `Authorization` in CORS headers | ✅ |
| Frontend not sending credentials | Added `credentials: "include"` to all requests | ✅ |
| JWT not in Security Context | Enhanced JwtFilter with proper logging | ✅ |
| Manual header parsing | Use Spring Security `Authentication` object | ✅ |

---

## 🚀 Quick Test (2 minutes)

### Test 1: Check Token Storage
Open **browser console** and run:
```javascript
// After OAuth redirect to /auth?token=...
console.log("Token stored:", localStorage.getItem("nextradex_token"));

// Should show: 
// Token stored: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test 2: Check Headers
```javascript
// In browser console
const token = localStorage.getItem("nextradex_token");
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};
console.log("Headers to send:", headers);
```

### Test 3: Make Test Request
```javascript
fetch('http://localhost:8080/api/oauth2/complete-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('nextradex_token')}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include',  // ← This is critical
  body: JSON.stringify({
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User'
  })
})
.then(r => {
  console.log("Response Status:", r.status);
  return r.json();
})
.then(data => console.log("Response:", data))
.catch(err => console.error("Error:", err));

// Expected:
// Response Status: 200
// Response: {code: 200, message: "Profile completed successfully", data: {...}}
```

---

## 🔍 Network Tab Checklist

1. **Click Google Login**
2. **Complete OAuth flow**
3. **Open DevTools → Network tab**
4. **Look for**: `POST /api/oauth2/complete-profile`

### Check Request Headers
```
✅ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
✅ Content-Type: application/json
✅ Origin: http://localhost:3000
```

### Check Response Headers
```
✅ Access-Control-Allow-Credentials: true
✅ Access-Control-Allow-Origin: http://localhost:3000
✅ Status: 200 OK (not 401)
```

---

## 📊 Backend Logs to Expect

**After you trigger POST /oauth2/complete-profile:**

```
[JwtFilter] Token found in request for path: /api/oauth2/complete-profile
[JwtFilter] Extracted username: google-user@example.com, userId: 123 from token
[JwtFilter] ✅ JWT Token valid. Authentication set for user: google-user@example.com (ID: 123)
[OAuthController] complete-profile: Processing profile setup for userId: 123
[OAuthController] complete-profile: Profile setup completed for user: john_doe
```

**If you see this instead (❌ PROBLEM):**
```
❌ [JwtFilter] No token found for path: /api/oauth2/complete-profile
   → Issue: Authorization header not sent
   → Fix: Check credentials: "include" in api.js

❌ [OAuthController] complete-profile: Authentication is null
   → Issue: JwtFilter didn't populate SecurityContextHolder
   → Fix: Check JwtFilter is registered before UsernamePasswordAuthenticationFilter

❌ [JwtFilter] JWT Token validation failed
   → Issue: Token is expired or tampered
   → Fix: Check token generation and expiration time
```

---

## 📱 Testing Endpoints

### 1. Test JWT Generation (Regular Login)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Should return:
# {"code":200,"message":"Login successful","data":{"token":"eyJ...","username":"...","expiresIn":86400000}}
```

### 2. Test CORS Preflight
```bash
curl -X OPTIONS http://localhost:8080/api/oauth2/complete-profile \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v

# Should return 200 OK with:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Headers: ...,Authorization,...
# Access-Control-Allow-Credentials: true
```

### 3. Test Profile Endpoint (Needs Valid Token)
```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:3000"

# Should return 200 with user profile
```

---

## ❌ Common Issues & Solutions

### Issue: Still Getting 401

**Check 1:** Token in localStorage?
```javascript
localStorage.getItem("nextradex_token") !== null
```

**Check 2:** CORS headers present in response?
```
Response Headers → Access-Control-Allow-Credentials: true
```

**Check 3:** Authorization header sent?
```
Request Headers → Authorization: Bearer ...
```

**Check 4:** Session policy is STATELESS?
```java
// SecurityConfig.java should have:
.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

### Issue: CORS Error in Browser Console

**Error:** `Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Check:**
1. `cors.allowed.origins` in `application.properties` includes `http://localhost:3000`
2. No wildcard + credentials issue: Must use explicit origins when `setAllowCredentials(true)`

**Fix:**
```properties
# application.properties
cors.allowed.origins=http://localhost:3000,http://localhost:8080
```

### Issue: JWT Token Expired

**Error:** `Invalid token: expired`

**Fix:**
1. Extend expiration in `application.properties`:
   ```properties
   jwt.expiration=604800000  # 7 days instead of 1
   ```
2. Or generate new token: Clear localStorage and login again

---

## ✅ All Working Indicator

**You'll know it's fixed when:**

1. ✅ Browser console shows no CORS errors
2. ✅ Token is stored after OAuth redirect
3. ✅ Network tab shows 200 OK for POST `/oauth2/complete-profile`
4. ✅ Backend logs show `[JwtFilter] ✅ JWT Token valid`
5. ✅ Profile setup form submits successfully
6. ✅ Redirected to dashboard after profile setup
7. ✅ Subsequent API calls work (GET `/user/profile`, etc.)

---

## 📋 Files Changed

1. **SecurityConfig.java**
   - Fixed CORS configuration
   - Added explicit Authorization header
   - Added import statements

2. **JwtFilter.java**
   - Added comprehensive debug logging
   - Better error handling

3. **OAuthController.java**
   - Changed from header parsing to Spring Security Authentication
   - Better error messages

4. **UserController.java**
   - Added HttpStatus import
   - Added debug logging to profile endpoint

5. **frontend/src/api.js**
   - Added `credentials: "include"` to all requests
   - Added debug logging
   - Created `createFetchOptions()` helper

---

## 🎯 Next Steps

1. **Rebuild backend:**
   ```bash
   cd C:\Users\adity\OneDrive\Desktop\NexTradeX
   mvn clean install -DskipTests
   ```

2. **Clear browser data:**
   - DevTools → Application → Storage → Clear all

3. **Test OAuth flow:**
   - Click Google Login
   - Complete OAuth
   - Fill profile setup
   - Submit
   - Should redirect to dashboard

4. **Monitor logs:**
   - Open backend console
   - Watch for `[JwtFilter] ✅ JWT Token valid` message

5. **Verify API calls:**
   - Open DevTools Network tab
   - Every authenticated request should have `Authorization` header
   - Every response should be 200 (or appropriate status), not 401

---

## 🚨 Rollback (If Needed)

All changes are backward compatible. If issues arise:

```bash
# Revert api.js to send credentials by default
git checkout frontend/src/api.js

# Revert backend config
git checkout src/main/java/com/NexTradeX/config/SecurityConfig.java
```

But the fixes should work! Test and let me know if you hit any snags.

---

## 📞 Debug Commands

**Show current token:**
```javascript
// Browser console
const token = localStorage.getItem("nextradex_token");
console.log(token ? `Token exists (${token.length} chars)` : "No token");
```

**Decode JWT (online only, don't use sensitive tokens):**
```javascript
const parts = token.split('.');
const decoded = JSON.parse(atob(parts[1]));
console.log("JWT Payload:", decoded);
// Should show: {username: "...", userId: 123, exp: ..., iat: ...}
```

**Check if token expired:**
```javascript
const token = localStorage.getItem("nextradex_token");
const parts = token.split('.');
const decoded = JSON.parse(atob(parts[1]));
const now = Date.now() / 1000;
console.log(`Token expires in ${decoded.exp - now} seconds`);
console.log(`Expired: ${decoded.exp < now}`);
```

**Make authenticated request from console:**
```javascript
const token = localStorage.getItem("nextradex_token");
fetch('http://localhost:8080/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

---

That's it! Your OAuth2 401 issue should be resolved. 🎉

