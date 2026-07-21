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

        String subject = "🔑 Reset Your NexTradeX Password";
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
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 40px 20px; }
                .container { max-width: 560px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
                .logo { font-size: 24px; font-weight: bold; color: #38bdf8; margin-bottom: 24px; text-align: center; }
                h2 { color: #f0f6fc; font-size: 20px; margin-top: 0; }
                p { line-height: 1.6; color: #8b949e; font-size: 14px; }
                .btn-container { text-align: center; margin: 32px 0; }
                .btn { background-color: #0284c7; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; display: inline-block; transition: background-color 0.2s; }
                .link-box { background-color: #0d1117; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all; margin-top: 16px; border: 1px solid #21262d; }
                .footer { margin-top: 32px; pt: 16px; border-top: 1px solid #21262d; font-size: 12px; color: #484f58; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">⚡ NexTradeX</div>
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your NexTradeX account (<strong>%s</strong>). Click the button below to set a new password:</p>
                <div class="btn-container">
                  <a href="%s" class="btn" target="_blank">Reset Password</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your web browser:</p>
                <div class="link-box">%s</div>
                <p>This password reset link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                <div class="footer">
                  &copy; 2026 NexTradeX Inc. All rights reserved. Secure Trading Platform.
                </div>
              </div>
            </body>
            </html>
            """.formatted(userEmail, resetUrl, resetUrl);
    }
}
