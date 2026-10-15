
package com.glo.handypro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateQuoteStatusRequest {

    @NotBlank
    @Pattern(regexp = "NEW|IN_PROGRESS|COMPLETED")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
