package com.glo.handypro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.resend.core.exception.ResendException;

@Service
public class EmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailService.class);

    private static final String NAVY = "#062846";
    private static final String YELLOW = "#ffc400";

    private static final Map<String, String> SERVICE_LABELS =
            Map.ofEntries(
                    Map.entry("furniture", "Furniture Assembly"),
                    Map.entry("tv-mounting", "TV & Wall Mounting"),
                    Map.entry("faucet", "Faucet Installation"),
                    Map.entry("repairs", "Minor Repairs"),
                    Map.entry("hanging", "Hanging and Installing"),
                    Map.entry("drywall", "Drywall Patching"),
                    Map.entry("carpentry", "Light Carpentry"),
                    Map.entry("doors", "Door & Cabinet Adjustments"),
                    Map.entry("moving", "Loading & Unloading"),
                    Map.entry("others", "Other Services")
            );

    private final ResendEmailSender emailSender;
    private final String businessEmail;
    private final String googleReviewUrl;

    public EmailService(
                ResendEmailSender emailSender,
                @Value("${glo.business-email:}") String businessEmail,
                @Value("${glo.review-url:}") String googleReviewUrl) {
        this.emailSender = emailSender;
        this.businessEmail = businessEmail;
        this.googleReviewUrl = googleReviewUrl;
    }

    public void sendQuoteNotifications(Quote quote) {
        sendCustomerConfirmation(quote);
        sendBusinessNotification(quote);
    }

    public void sendTaskCompletionEmail(Quote quote) {
        if (quote.getEmail() == null || quote.getEmail().isBlank()) {
            logger.warn(
                    "Cannot send completion email for quote ID {}: "
                    + "customer email is missing",
                    quote.getId());
            return;
        }

        String serviceName = getServiceLabel(quote.getService());

        StringBuilder content = new StringBuilder();

        content.append("<p>Thank you for choosing GLO Handy Pro!</p>")
                .append("<p>We're pleased to let you know that your task "
                        + "has been marked as completed.</p>")
                .append("<h3 style='color:")
                .append(NAVY)
                .append(";margin-top:26px;'>TASK DETAILS</h3>")
                .append("<table role='presentation' width='100%' "
                        + "cellpadding='0' cellspacing='0' "
                        + "style='border-collapse:collapse;"
                        + "background:#f1f5f9;border-radius:8px;'>")
                .append(detailRow("Request number",
                        "#" + quote.getId()))
                .append(detailRow("Service", serviceName))
                .append(detailRow("Task date",
                        formatDate(quote.getPreferredDate())))
                .append(detailRow("Task time",
                        formatTime(quote.getPreferredTime())))
                .append(detailRow("Hours worked",
                        formatHours(quote.getHoursWorked())))
                .append("</table>")
                .append("<table role='presentation' width='100%' "
                        + "cellpadding='0' cellspacing='0' "
                        + "style='margin-top:16px;background:")
                .append(YELLOW)
                .append(";border-radius:8px;'><tr><td "
                        + "style='padding:20px;'>")
                .append("<div style='font-size:14px;color:")
                .append(NAVY)
                .append(";'>TOTAL AMOUNT (CAD)</div>")
                .append("<div style='font-size:30px;font-weight:bold;"
                        + "color:")
                .append(NAVY)
                .append(";margin-top:6px;'>")
                .append(escapeHtml(formatAmount(quote.getTotalEarned())))
                .append("</div></td></tr></table>")
                .append("<h3 style='color:")
                .append(NAVY)
                .append(";margin-top:28px;'>Need help again?</h3>")
                .append("<p>We appreciate the opportunity to help you. "
                        + "If you need handyman services again, "
                        + "please contact us. We'd be happy to help!</p>")
                .append("<p>We'd also appreciate a moment of your time "
                        + "to leave us a review. Your feedback helps us "
                        + "improve and helps other customers discover "
                        + "our services.</p>");

        if (googleReviewUrl != null && !googleReviewUrl.isBlank()) {
            content.append("<p style='margin:24px 0;'>")
                    .append("<a href='")
                    .append(escapeHtml(googleReviewUrl.trim()))
                    .append("' style='display:inline-block;background:")
                    .append(YELLOW)
                    .append(";color:")
                    .append(NAVY)
                    .append(";padding:13px 22px;border-radius:6px;"
                            + "text-decoration:none;font-weight:bold;'>")
                    .append("★ Share Your Feedback")
                    .append("</a></p>");
        }

        content.append("<p>Thank you again for supporting GLO Handy Pro!</p>")
                .append("<p>Best regards,<br><strong>GLO Handy Pro</strong>"
                        + "<br>Handyman Services</p>");

        sendHtmlSafely(
                quote.getEmail(),
                "Your task is complete - Request #"
                        + quote.getId() + " | GLO Handy Pro",
                buildEmailHtml(
                        "Your task is complete!",
                        "Thank you for choosing us. We appreciate your trust.",
                        content.toString()),
                "task completion email",
                quote.getId());
    }

    private void sendCustomerConfirmation(Quote quote) {
        if (quote.getEmail() == null || quote.getEmail().isBlank()) {
            logger.warn(
                    "Cannot send customer confirmation for quote ID {}: "
                    + "customer email is missing",
                    quote.getId());
            return;
        }

        String content =
                "<p>Thank you for contacting GLO Handy Pro!</p>"
                + "<p>We have received your quote request.</p>"
                + "<h3 style='color:" + NAVY
                + ";margin-top:26px;'>YOUR REQUEST DETAILS</h3>"
                + "<table role='presentation' width='100%' "
                + "cellpadding='0' cellspacing='0' "
                + "style='border-collapse:collapse;"
                + "background:#f1f5f9;border-radius:8px;'>"
                + detailRow("Request number", "#" + quote.getId())
                + detailRow("Service", getServiceLabel(quote.getService()))
                + "</table>"
                + "<h3 style='color:" + NAVY
                + ";margin-top:28px;'>What happens next?</h3>"
                + "<p>Our team will review your request and contact you "
                + "to discuss your requirements, pricing, and availability.</p>"
                + "<table role='presentation' width='100%' "
                + "cellpadding='0' cellspacing='0' "
                + "style='background:#fff4c2;border-radius:8px;"
                + "margin-top:18px;'><tr><td style='padding:16px;'>"
                + "<strong style='color:" + NAVY
                + ";'>Appointment not confirmed yet</strong>"
                + "<p style='margin-bottom:0;color:" + NAVY
                + ";'>We'll agree on a suitable date and time with you "
                + "before confirming your booking.</p>"
                + "</td></tr></table>"
                + "<p style='margin-top:26px;'>Thank you for considering "
                + "GLO Handy Pro!</p>"
                + "<p>Best regards,<br><strong>GLO Handy Pro</strong>"
                + "<br>Handyman Services</p>";

        sendHtmlSafely(
                quote.getEmail(),
                "We received your quote request #"
                        + quote.getId() + " - GLO Handy Pro",
                buildEmailHtml(
                        "Thanks for reaching out!",
                        "We've received your quote request.",
                        content),
                "customer confirmation",
                quote.getId());
    }

    private void sendBusinessNotification(Quote quote) {
        String serviceName = getServiceLabel(quote.getService());

        String content =
                "<p>A new quote request has been submitted through "
                + "your GLO Handy Pro website.</p>"

                + "<table role='presentation' width='100%' "
                + "cellpadding='0' cellspacing='0' "
                + "style='border-collapse:collapse;"
                + "background:#f1f5f9;border-radius:8px;'>"

                + detailRow("Request ID", "#" + quote.getId())
                + detailRow("Customer name", quote.getName())
                + detailRow("Email", quote.getEmail())
                + detailRow("Phone", quote.getPhone())
                + detailRow("Service", serviceName)
                + detailRow("Preferred date",
                        formatDate(quote.getPreferredDate()))
                + detailRow("Preferred time",
                        formatTime(quote.getPreferredTime()))

                + "</table>"

                + "<h3 style='color:" + NAVY
                + ";margin-top:26px;'>CUSTOMER MESSAGE</h3>"

                + "<div style='background:#fff4c2;padding:16px;"
                + "border-radius:8px;border-left:4px solid " + YELLOW + ";'>"
                + "<p style='margin:0;color:" + NAVY + ";'>"
                + escapeHtml(
                        quote.getMessage() == null
                                || quote.getMessage().isBlank()
                                ? "No message provided"
                                : quote.getMessage())
                + "</p></div>"

                + "<p style='margin-top:24px;'>"
                + "Please contact the customer to discuss their "
                + "requirements, pricing, and availability.</p>"

                + "<p style='color:" + NAVY + ";font-weight:bold;'>"
                + "GLO Handy Pro — New Lead</p>";

        sendHtmlSafely(
                businessEmail,
                "New Quote Request #" + quote.getId()
                        + " - GLO Handy Pro",
                buildEmailHtml(
                        "New quote request!",
                        "A potential customer is waiting to hear from you.",
                        content),
                "business notification",
                quote.getId());
    }

    private String buildEmailHtml(String heading, String subtitle,
                                  String content) {
        return "<!DOCTYPE html>"
                + "<html><body style='margin:0;padding:0;"
                + "background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;"
                + "color:#263238;'>"
                + "<table role='presentation' width='100%' "
                + "cellpadding='0' cellspacing='0' "
                + "style='background:#f1f5f9;padding:24px 10px;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' width='600' "
                + "cellpadding='0' cellspacing='0' "
                + "style='width:100%;max-width:600px;background:#ffffff;"
                + "border-radius:12px;overflow:hidden;'>"
                + "<tr><td style='background:" + NAVY
                + ";padding:28px 26px;border-bottom:5px solid "
                + YELLOW + ";'>"
                + "<div style='font-size:23px;font-weight:bold;"
                + "letter-spacing:1px;color:#ffffff;'>"
                + "GLO HANDY PRO</div>"
                + "<div style='font-size:13px;color:#ffffff;"
                + "margin-top:5px;'>Handyman Services</div>"
                + "<h1 style='font-size:26px;line-height:1.3;"
                + "color:#ffffff;margin:26px 0 8px;'>"
                + escapeHtml(heading) + "</h1>"
                + "<p style='font-size:15px;line-height:1.6;"
                + "color:#ffffff;margin:0;'>"
                + escapeHtml(subtitle) + "</p>"
                + "</td></tr>"
                + "<tr><td style='padding:26px;line-height:1.7;"
                + "font-size:15px;'>"
                + content
                + "</td></tr>"
                + "<tr><td style='background:#f1f5f9;padding:20px 26px;"
                + "text-align:center;border-top:1px solid #e2e8f0;'>"
                + "<div style='font-size:14px;font-weight:bold;color:"
                + NAVY + ";'>GLO Handy Pro</div>"
                + "<div style='font-size:12px;color:#64748b;"
                + "margin-top:4px;'>Handyman Services</div>"
                + "</td></tr></table>"
                + "</td></tr></table></body></html>";
    }

    private String detailRow(String label, String value) {
        return "<tr><td style='padding:11px 14px;"
                + "border-bottom:1px solid #e2e8f0;color:#475569;'>"
                + escapeHtml(label)
                + "</td><td align='right' style='padding:11px 14px;"
                + "border-bottom:1px solid #e2e8f0;font-weight:bold;"
                + "color:" + NAVY + ";'>"
                + escapeHtml(value)
                + "</td></tr>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String getServiceLabel(String serviceId) {
        if (serviceId == null || serviceId.isBlank()) {
            return "Not specified";
        }

        return SERVICE_LABELS.getOrDefault(
                serviceId,
                serviceId.replace("-", " "));
    }

    private String formatDate(LocalDate date) {
        if (date == null) {
            return "Not provided";
        }

        return date.format(
                DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"));
    }

    private String formatTime(LocalTime time) {
        if (time == null) {
            return "Not provided";
        }

        return time.format(DateTimeFormatter.ofPattern("h:mm a"));
    }

    private String formatHours(Object hours) {
        if (hours == null) {
            return "Not provided";
        }

        return hours + (hours.toString().equals("1")
                ? " hour"
                : " hours");
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "Not available";
        }

        return String.format(
                java.util.Locale.CANADA,
                "$%,.2f",
                amount);
    }

    
        private void sendHtmlSafely(
                        String recipient,
                        String subject,
                        String html,
                        String emailType,
                        Long quoteId) {

                try {
                        emailSender.sendHtml(recipient, subject, html);

                        logger.info(    
                        "Sent {} for quote ID {}",
                        emailType,
                        quoteId);

                } catch (ResendException | RuntimeException ex) {
                        logger.error(
                        "Failed to send {} for quote ID {}",
                        emailType,
                        quoteId,
                        ex);
                 }
        }


}
