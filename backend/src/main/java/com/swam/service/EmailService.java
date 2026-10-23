package com.swam.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service to handle automated email notifications.
 * Supports both real SMTP delivery and console simulation for development.
 */
@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(
            @org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a simple text email.
     * If SMTP is not configured, it fails gracefully and logs to console.
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@gokart-warehouse.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            if (mailSender != null) {
                mailSender.send(message);
            } else {
                logger.info("SIMULATING EMAIL to {}: [{}] {}", to, subject, text);
            }

        } catch (org.springframework.mail.MailException e) {
            logger.error("Mail sending failed (MailException): {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error sending email: {}", e.getMessage(), e);
        }
    }

    public void sendLowStockAlert(String partName, int currentQty, int minQty) {
        String subject = "LOW STOCK ALERT: " + partName;
        String text = String.format(
                "The part '%s' has reached low stock count.\nCurrent: %d | Minimum Required: %d\nPlease reorder soon.",
                partName, currentQty, minQty);
        sendSimpleEmail("admin@gokart-warehouse.com", subject, text);
    }

    public void sendPasswordResetLink(String to, String token) {
        String subject = "Password Reset Request";
        String link = "http://localhost:4200/reset-password?token=" + token;
        String text = "You requested a password reset. Click the link below to set a new password:\n\n" + link +
                "\n\nIf you did not request this, please ignore this email.";
        sendSimpleEmail(to, subject, text);
    }
}
