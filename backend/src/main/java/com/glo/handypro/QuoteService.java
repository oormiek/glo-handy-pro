
package com.glo.handypro;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class QuoteService {

    private static final Logger logger =
            LoggerFactory.getLogger(QuoteService.class);

    private final QuoteRepository quoteRepository;
    private final EmailService emailService;

    public QuoteService(
            QuoteRepository quoteRepository,
            EmailService emailService) {
        this.quoteRepository = quoteRepository;
        this.emailService = emailService;
    }

    public Quote saveQuote(QuoteRequest quoteRequest) {

        Quote quote = new Quote(
                quoteRequest.getName(),
                quoteRequest.getEmail(),
                quoteRequest.getPhone(),
                quoteRequest.getService(),
                quoteRequest.getMessage()
        );

        quote.setPreferredDate(quoteRequest.getPreferredDate());
        quote.setPreferredTime(quoteRequest.getPreferredTime());

        // Save the quote before attempting to send emails.
        Quote savedQuote = quoteRepository.save(quote);

        // Email failures must not undo the saved quote.
        try {
            emailService.sendQuoteNotifications(savedQuote);
        } catch (Exception ex) {
            logger.error(
                    "Unexpected error sending notifications for quote ID {}",
                    savedQuote.getId(),
                    ex
            );
        }

        return savedQuote;
    }
}
