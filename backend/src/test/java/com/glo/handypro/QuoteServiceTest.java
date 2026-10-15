
package com.glo.handypro;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuoteServiceTest {

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private QuoteService quoteService;

    private QuoteRequest quoteRequest;

    @BeforeEach
    void setUp() {
        quoteRequest = new QuoteRequest(
            "Test Customer",
            "test@example.com",
            "4161234567",
            "furniture",
            "Please assemble a desk"
        );
    }

    @Test
    void saveQuoteShouldSaveAndReturnQuote() {
        when(quoteRepository.save(any(Quote.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Quote savedQuote = quoteService.saveQuote(quoteRequest);

        assertEquals("Test Customer", savedQuote.getName());
        assertEquals("test@example.com", savedQuote.getEmail());
        assertEquals("4161234567", savedQuote.getPhone());
        assertEquals("furniture", savedQuote.getService());
        assertEquals("Please assemble a desk", savedQuote.getMessage());

        verify(quoteRepository).save(any(Quote.class));
    }
}
