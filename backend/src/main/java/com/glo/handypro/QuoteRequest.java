
package com.glo.handypro;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class QuoteRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
    @Pattern(
        regexp = "^[\\p{L}][\\p{L}\\p{M} .'-]*$",
        message = "Name can contain letters, spaces, apostrophes and hyphens only"
    )
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Pattern(
        regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$",
        message = "Email must include a valid domain, such as example.com"
    )
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(
        regexp = "^(?:\\+?1[ .-]?)?(?:\\([2-9]\\d{2}\\)|[2-9]\\d{2})[ .-]?[2-9]\\d{2}[ .-]?\\d{4}$",
        message = "Enter a valid 10-digit North American phone number"
    )
    private String phone;

    @NotBlank(message = "Service is required")
    @Pattern(
        regexp = "^(furniture|tv-mounting|faucet|repairs|hanging|drywall|carpentry|doors|moving|others)$",
        message = "Please select a valid service"
    )
    private String service;

    @NotBlank(message = "Message is required")
    @Size(
        min = 10,
        max = 1000,
        message = "Project description must be between 10 and 1000 characters"
    )
    private String message;

    private LocalDate preferredDate;

    private LocalTime preferredTime;

    public QuoteRequest() {
    }

    public QuoteRequest(
            String name,
            String email,
            String phone,
            String service,
            String message) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.service = service;
        this.message = message;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(LocalDate preferredDate) {
        this.preferredDate = preferredDate;
    }

    public LocalTime getPreferredTime() {
        return preferredTime;
    }

    public void setPreferredTime(LocalTime preferredTime) {
        this.preferredTime = preferredTime;
    }
}
