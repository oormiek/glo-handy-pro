
package com.glo.handypro;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class UpdateAppointmentRequest {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate preferredDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime preferredTime;

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
