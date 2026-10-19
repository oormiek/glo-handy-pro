
package com.glo.handypro;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailSender implements EnvironmentAware {

    private final String apiKey;
    private final String fromEmail;
    private final String gmailUsername;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    private Environment environment;
    private volatile Resend resendClient;

    public ResendEmailSender(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String fromEmail,
            @Value("${spring.mail.username:}") String gmailUsername,
            ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.gmailUsername = gmailUsername;
        this.mailSenderProvider = mailSenderProvider;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public void sendHtml(
            String recipient,
            String subject,
            String html) throws ResendException {

        if (recipient == null || recipient.isBlank()) {
            throw new IllegalArgumentException(
                    "Email recipient is required.");
        }

        if (environment.acceptsProfiles(Profiles.of("local"))) {
            sendWithGmail(recipient, subject, html);
        } else {
            sendWithResend(recipient, subject, html);
        }
    }

    private void sendWithGmail(
            String recipient,
            String subject,
            String html) {

        if (gmailUsername == null || gmailUsername.isBlank()) {
            throw new IllegalStateException(
                    "GMAIL_USERNAME is not configured.");
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            throw new IllegalStateException(
                    "Gmail SMTP is not configured for the local profile.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(gmailUsername);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException | MailException ex) {
            throw new IllegalStateException(
                    "Failed to send email through Gmail SMTP.", ex);
        }
    }

    private void sendWithResend(
            String recipient,
            String subject,
            String html) throws ResendException {

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException(
                    "RESEND_FROM_EMAIL is not configured.");
        }

        CreateEmailOptions email = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(recipient)
                .subject(subject)
                .html(html)
                .build();

        getClient().emails().send(email);
    }

    private Resend getClient() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "RESEND_API_KEY is not configured.");
        }

        Resend client = resendClient;

        if (client == null) {
            synchronized (this) {
                client = resendClient;

                if (client == null) {
                    client = new Resend(apiKey);
                    resendClient = client;
                }
            }
        }

        return client;
    }
}
