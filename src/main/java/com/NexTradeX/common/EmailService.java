package com.NexTradeX.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String resendFromEmail;

    @Value("${cors.allowed.origins:http://localhost:3000}")
    private String corsAllowedOrigins;

    private final JavaMailSender javaMailSender;
    private final RestClient restClient = RestClient.builder().build();

    public boolean sendPasswordResetEmail(String toEmail, String resetToken) {
        String baseUrl = corsAllowedOrigins.split(",")[0].trim();
        String resetUrl = baseUrl + "/auth?resetToken=" + resetToken;

        String subject = "Reset Your NexTradeX Password";
        String htmlContent = buildResetEmailHtml(toEmail, resetUrl);

        // 1. Try Primary: Resend API (Fast HTTP REST)
        try {
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                log.info("[EmailService] Attempting to send password reset email via Resend API to {}", toEmail);
                boolean resendSuccess = sendViaResend(toEmail, subject, htmlContent);
                if (resendSuccess) {
                    log.info("[EmailService] Password reset email successfully sent via Resend API to {}", toEmail);
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("[EmailService] Resend API failed for {}: {}. Triggering Brevo SMTP fallback.", toEmail, e.getMessage());
        }

        // 2. Fallback: Brevo SMTP
        try {
            log.info("[EmailService] Executing Fallback: Sending password reset email via Brevo SMTP to {}", toEmail);
            sendViaBrevo(toEmail, subject, htmlContent);
            log.info("[EmailService] Password reset email successfully sent via Brevo SMTP fallback to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("[EmailService] CRITICAL: Both Resend and Brevo email providers failed to send reset email to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendViaResend(String toEmail, String subject, String htmlContent) {
        Map<String, Object> body = new HashMap<>();
        body.put("from", "NexTradeX <" + resendFromEmail + ">");
        body.put("to", new String[]{toEmail});
        body.put("subject", subject);
        body.put("html", htmlContent);

        Map<?, ?> response = restClient.post()
                .uri("https://api.resend.com/emails")
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

        return response != null && response.containsKey("id");
    }

    private void sendViaBrevo(String toEmail, String subject, String htmlContent) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        javaMailSender.send(message);
    }

    private String buildResetEmailHtml(String userEmail, String resetUrl) {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password - NexTradeX</title>
            </head>
            <body style="margin:0; padding:40px 16px; background-color:#00191c; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing:antialiased;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:540px; margin:0 auto;">
                <tr>
                  <td style="background-color:#032125; border:1px solid #0b363b; border-radius:6px; padding:40px 32px;">
                    
                    <!-- Header / Logo -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                      <tr>
                        <td align="center">
                          <span style="font-size:26px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Nex<span style="color:#abffae;">TradeX</span></span>
                        </td>
                      </tr>
                    </table>

                    <!-- Title -->
                    <h1 style="color:#ffffff; font-size:22px; font-weight:600; margin:0 0 16px 0; letter-spacing:-0.3px; text-align:left;">Reset Your Password</h1>
                    
                    <!-- Body Text -->
                    <p style="color:#a1c2c6; font-size:15px; line-height:1.6; margin:0 0 28px 0; text-align:left;">
                      Hello,<br><br>
                      We received a request to reset the password for your NexTradeX account (<strong style="color:#ffffff;">{{USER_EMAIL}}</strong>). Click the pill button below to set a new password:
                    </p>

                    <!-- Primary Pill Button (Verdant 300 Glow CTA) -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
                      <tr>
                        <td align="center">
                          <a href="{{RESET_URL}}" target="_blank" style="background-color:#abffae; color:#032125 !important; font-size:15px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:9999px; display:inline-block; letter-spacing:0.2px;">Reset Password</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Direct Link Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#00191c; border:1px solid #0b363b; border-radius:4px; margin-top:24px;">
                      <tr>
                        <td style="padding:16px;">
                          <div style="font-size:11px; font-weight:600; color:#437278; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;">Direct Reset Link</div>
                          <a href="{{RESET_URL}}" target="_blank" style="color:#abffae !important; font-family:'SFMono-Regular', Consolas, monospace; font-size:12px; word-break:break-all; text-decoration:underline;">{{RESET_URL}}</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry Note -->
                    <p style="color:#437278; font-size:13px; margin-top:28px; margin-bottom:0; text-align:center; line-height:1.5;">
                      ⏱️ This link expires in <strong style="color:#a1c2c6;">15 minutes</strong>.<br>If you did not request this reset, you can safely ignore this email.
                    </p>

                    <!-- Footer -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px; border-top:1px solid #0b363b;">
                      <tr>
                        <td style="padding-top:20px; font-size:12px; color:#437278; text-align:center; line-height:1.5;">
                          &copy; 2026 NexTradeX Inc. All rights reserved.<br>
                          Next-Generation Algorithmic Trading Platform.
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        return html.replace("{{USER_EMAIL}}", userEmail)
                   .replace("{{RESET_URL}}", resetUrl);
    }
}
