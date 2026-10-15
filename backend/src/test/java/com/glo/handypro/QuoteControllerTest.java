
package com.glo.handypro;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuoteControllerTest {

    @Mock
    private QuoteService quoteService;

    @InjectMocks
    private QuoteController quoteController;

    @Test
    void createQuoteShouldReturnSavedQuote() {
        QuoteRequest request = new QuoteRequest(
            "Test Customer",
            "test@example.com",
            "4161234567",
            "furniture",
            "Please assemble a desk"
        );

        Quote savedQuote = new Quote(
            "Test Customer",
            "test@example.com",
            "4161234567",
            "furniture",
            "Please assemble a desk"
        );

        when(quoteService.saveQuote(any(QuoteRequest.class)))
            .thenReturn(savedQuote);

        Quote result = quoteController.createQuote(request);

        assertEquals("Test Customer", result.getName());
        assertEquals("test@example.com", result.getEmail());

        verify(quoteService).saveQuote(request);
    }

    @Test
    void invalidServiceShouldProduceValidationError() {
        QuoteRequest request = new QuoteRequest(
            "Test Customer",
            "test@example.com",
            "4161234567",
            "x76324",
            "Please assemble a desk"
        );

        Validator validator = Validation
            .buildDefaultValidatorFactory()
            .getValidator();

        Set<ConstraintViolation<QuoteRequest>> violations =
            validator.validate(request);

        assertTrue(
            violations.stream().anyMatch(
                violation ->
                    violation.getPropertyPath().toString().equals("service")
                    && violation.getMessage()
                        .equals("Please select a valid service")
            ),
            "Invalid service should produce a validation error"
        );
    }
}
