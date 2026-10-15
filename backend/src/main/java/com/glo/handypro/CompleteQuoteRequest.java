
package com.glo.handypro;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public class CompleteQuoteRequest {

    @NotNull(message = "Hours worked is required.")
    @DecimalMin(
        value = "0.01",
        message = "Hours worked must be greater than zero."
    )
    @Digits(
        integer = 5,
        fraction = 2,
        message = "Hours worked can have up to two decimal places."
    )
    private BigDecimal hoursWorked;

    @NotNull(message = "Hourly rate is required.")
    @DecimalMin(
        value = "0.00",
        message = "Hourly rate cannot be negative."
    )
    @Digits(
        integer = 8,
        fraction = 2,
        message = "Hourly rate can have up to two decimal places."
    )
    private BigDecimal hourlyRate;

    public BigDecimal getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(BigDecimal hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}
