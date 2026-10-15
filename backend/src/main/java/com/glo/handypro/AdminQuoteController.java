package com.glo.handypro;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/admin/quotes")
public class AdminQuoteController {

    private final QuoteRepository quoteRepository;
    private final EmailService emailService;

    public AdminQuoteController(
            QuoteRepository quoteRepository,
            EmailService emailService) {
        this.quoteRepository = quoteRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    @PatchMapping("/{id}/status")
    public Quote updateQuoteStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuoteStatusRequest request) {

        Quote quote = findQuote(id);
        quote.setStatus(request.getStatus());

        return quoteRepository.save(quote);
    }

    @PatchMapping("/{id}/complete")
    public Quote completeQuote(
            @PathVariable Long id,
            @Valid @RequestBody CompleteQuoteRequest request) {

        Quote quote = findQuote(id);

        // Remember whether the task was already completed.
        // Editing earnings later must not send another email.
        boolean wasAlreadyCompleted =
                "COMPLETED".equals(quote.getStatus());

        BigDecimal hours = request.getHoursWorked();
        BigDecimal rate = request.getHourlyRate();

        BigDecimal total = hours.multiply(rate)
                .setScale(2, RoundingMode.HALF_UP);

        quote.setHoursWorked(hours);
        quote.setHourlyRate(rate);
        quote.setTotalEarned(total);
        quote.setStatus("COMPLETED");

        // Save the completed task and its earnings first.
        Quote savedQuote = quoteRepository.save(quote);

        // Notify the customer only on the first completion.
        if (!wasAlreadyCompleted) {
            emailService.sendTaskCompletionEmail(savedQuote);
        }

        return savedQuote;
    }

    @PatchMapping("/{id}/appointment")
    public Quote updateAppointment(
            @PathVariable Long id,
            @RequestBody UpdateAppointmentRequest request) {

        Quote quote = findQuote(id);

        if ("COMPLETED".equals(quote.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Appointments cannot be edited after a task is completed."
            );
        }

        quote.setPreferredDate(request.getPreferredDate());
        quote.setPreferredTime(request.getPreferredTime());

        return quoteRepository.save(quote);
    }

    private Quote findQuote(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Quote not found"));
    }
}
