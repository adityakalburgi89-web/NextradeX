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

    @Value("${app.logo.url:https://raw.githubusercontent.com/adityakalburgi89-web/NextradeX/main/frontend/src/assets/images/Logo.png}")
    private String logoUrl;

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
            <body style="margin:0; padding:48px 16px; background-color:#fafafa; font-family:'OpenRunde', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing:antialiased;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px; margin:0 auto;">
                <tr>
                  <td style="background-color:#ffffff; border:1px solid #e8e8e8; border-radius:16px; padding:40px 32px; box-shadow:rgba(0, 0, 0, 0.06) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 8px 16px 0px;">
                    
                    <!-- Header / Direct Public Image Logo -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                      <tr>
                        <td align="center">
                          <img src="{{LOGO_URL}}" alt="NexTradeX" height="48" style="height:48px; width:auto; display:inline-block; vertical-align:middle; border:0;" />
                        </td>
                      </tr>
                    </table>

                    <!-- Title -->
                    <h1 style="color:#181925; font-size:24px; font-weight:600; margin:0 0 16px 0; letter-spacing:-0.31px; text-align:left;">Reset Your Password</h1>
                    
                    <!-- Body Text -->
                    <p style="color:#666666; font-size:15px; line-height:1.5; letter-spacing:-0.32px; margin:0 0 28px 0; text-align:left;">
                      Hello,<br><br>
                      We received a password reset request for your NexTradeX account (<strong style="color:#181925; font-weight:600;">{{USER_EMAIL}}</strong>). Click the pill button below to set your new password:
                    </p>

                    <!-- Primary Pill Button (Lavender #918df6 CTA) -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
                      <tr>
                        <td align="center">
                          <a href="{{RESET_URL}}" target="_blank" style="background-color:#918df6; color:#ffffff !important; font-size:15px; font-weight:500; text-decoration:none; padding:14px 32px; border-radius:9999px; display:inline-block; letter-spacing:-0.32px; box-shadow:rgba(0, 0, 0, 0.08) 0px 1px 1px 1px, rgba(0, 0, 0, 0.06) 0px 0px 0px 0.5px;">Reset Password</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry Note -->
                    <p style="color:#999999; font-size:13px; margin-top:28px; margin-bottom:0; text-align:center; line-height:1.4; letter-spacing:-0.32px;">
                      ⏱️ This link expires in <strong style="color:#666666;">15 minutes</strong>.<br>If you did not request this reset, you can safely ignore this email.
                    </p>

                    <!-- Footer -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px; border-top:1px solid #e8e8e8;">
                      <tr>
                        <td style="padding-top:20px; font-size:12px; color:#999999; text-align:center; line-height:1.5; letter-spacing:-0.32px;">
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

        return html.replace("{{LOGO_URL}}", logoUrl)
                   .replace("{{USER_EMAIL}}", userEmail)
                   .replace("{{RESET_URL}}", resetUrl);
    }
}
