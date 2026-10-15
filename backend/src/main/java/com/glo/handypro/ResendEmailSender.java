
package com.glo.handypro;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailSender {

    private final String apiKey;
    private final String fromEmail;
    private volatile Resend resendClient;

    public ResendEmailSender(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String fromEmail) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    private Resend getClient() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "RESEND_API_KEY is not configured."
            );
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

    public void sendHtml(
            String recipient,
            String subject,
            String html) throws ResendException {

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException(
                "RESEND_FROM_EMAIL is not configured."
            );
        }

        if (recipient == null || recipient.isBlank()) {
            throw new IllegalArgumentException(
                "Email recipient is required."
            );
        }

        CreateEmailOptions email = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(recipient)
                .subject(subject)
                .html(html)
                .build();

        getClient().emails().send(email);
    }
}
