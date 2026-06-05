import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class TestToken {
    public static void main(String[] args) {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isEmpty()) {
            secret = "NexTradeX-Default-Secret-Key-For-Development-256-Bits-Minimum";
        }
        
        long expiration = 86400000L;
        String expEnv = System.getenv("JWT_EXPIRATION");
        if (expEnv != null && !expEnv.isEmpty()) {
            try {
                expiration = Long.parseLong(expEnv);
            } catch (NumberFormatException e) {
                // Keep default
            }
        }
        
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        
        // Generate
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 2L);
        
        String token = Jwts.builder()
                .claims(claims)
                .subject("tester67pitchsap")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
                
        System.out.println("Generated Token: " + token);
        
        // Verify
        try {
            Claims parsedClaims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            System.out.println("SUCCESS! Subject: " + parsedClaims.getSubject());
            System.out.println("UserId: " + parsedClaims.get("userId"));
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
