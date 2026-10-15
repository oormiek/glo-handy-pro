package com.glo.handypro;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

   @PostMapping("/api/quotes")
    public Quote createQuote(
        @Valid @RequestBody QuoteRequest quoteRequest) {
        return quoteService.saveQuote(quoteRequest);
    }
}