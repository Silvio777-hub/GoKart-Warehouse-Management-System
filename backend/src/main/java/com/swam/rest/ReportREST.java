package com.swam.rest;

import com.swam.model.Kart;
import com.swam.repository.KartRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * REST Endpoint for generating system reports.
 */
@RestController
@RequestMapping("/api/reports")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Reports", description = "System reporting and data export (CSV, PDF)")
public class ReportREST {
    private static final Logger log = LoggerFactory.getLogger(ReportREST.class);
    private final KartRepository kartRepo;
    private final com.swam.repository.MaintenanceRepository maintenanceRepo;
    private final com.swam.repository.PartRepository partRepo;

    public ReportREST(KartRepository kartRepo, com.swam.repository.MaintenanceRepository maintenanceRepo,
            com.swam.repository.PartRepository partRepo) {
        this.kartRepo = kartRepo;
        this.maintenanceRepo = maintenanceRepo;
        this.partRepo = partRepo;
    }

    // --- KARTS ---
    @GetMapping(value = "/karts.csv", produces = "text/csv")
    @io.swagger.v3.oas.annotations.Operation(summary = "Export karts to CSV", description = "Generates a CSV report of the current kart fleet. Accessible by ADMIN and MANAGER.")
    public ResponseEntity<byte[]> kartsCsv(org.springframework.security.core.Authentication auth) {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        List<Kart> k = kartRepo.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,code,status,hoursRun,statusNote\n");
        for (Kart t : k) {
            sb.append(String.format("%d,%s,%s,%d,%s\n", t.getId(), t.getCode(), t.getStatus(), t.getHoursRun(),
                    t.getStatusNote() != null ? t.getStatusNote().replace(",", ";") : ""));
        }
        return createResponse(sb.toString().getBytes(StandardCharsets.UTF_8), "karts.csv", "text/csv");
    }

    @GetMapping(value = "/karts.pdf", produces = "application/pdf")
    @io.swagger.v3.oas.annotations.Operation(summary = "Export karts to PDF", description = "Generates a PDF report of the current kart fleet. Accessible by ADMIN and MANAGER.")
    public ResponseEntity<byte[]> kartsPdf(org.springframework.security.core.Authentication auth) throws Exception {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        return createPdf("Karts Report", doc -> {
            try (PDPageContentStream cs = new PDPageContentStream(doc, doc.getPage(0),
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                setupFont(cs);
                float y = 660;
                for (Kart t : kartRepo.findAll()) {
                    if (y < 50) {
                        break;
                    }
                    cs.beginText();
                    cs.newLineAtOffset(50, y);
                    cs.showText(
                            sanitize(String.format("%s - %s (%d hrs)", t.getCode(), t.getStatus(), t.getHoursRun())));
                    cs.endText();
                    y -= 15;
                }
            } catch (java.io.IOException e) {
                log.error("Error generating karts PDF content: {}", e.getMessage(), e);
            }
        }, "karts.pdf");
    }

    // --- MAINTENANCE ---

    @GetMapping(value = "/maintenance.csv", produces = "text/csv")
    public ResponseEntity<byte[]> maintenanceCsv(org.springframework.security.core.Authentication auth) {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        StringBuilder sb = new StringBuilder();
        sb.append("id,kart,description,performedBy,performedAt\n");
        for (com.swam.model.Maintenance m : maintenanceRepo.findAll()) {
            String kartCode = (m.getKart() != null) ? m.getKart().getCode() : "N/A";
            String date = (m.getPerformedAt() != null) ? m.getPerformedAt().toString() : "N/A";
            sb.append(String.format("%d,%s,%s,%s,%s\n",
                    m.getId(),
                    kartCode,
                    m.getDescription() != null ? m.getDescription().replace(",", ";") : "",
                    m.getPerformedBy() != null ? m.getPerformedBy() : "System",
                    date));
        }
        return createResponse(sb.toString().getBytes(StandardCharsets.UTF_8), "maintenance.csv", "text/csv");
    }

    @GetMapping(value = "/maintenance.pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> maintenancePdf(org.springframework.security.core.Authentication auth)
            throws Exception {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        return createPdf("Maintenance Report", doc -> {
            try (PDPageContentStream cs = new PDPageContentStream(doc, doc.getPage(0),
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                setupFont(cs);
                float y = 660;
                for (com.swam.model.Maintenance m : maintenanceRepo.findAll()) {
                    if (y < 50)
                        break;
                    cs.beginText();
                    cs.newLineAtOffset(50, y);
                    String date = (m.getPerformedAt() != null) ? m.getPerformedAt().toLocalDate().toString() : "N/A";
                    String kartCode = (m.getKart() != null) ? m.getKart().getCode() : "N/A";
                    cs.showText(sanitize(String.format("[%s] %s: %s", date, kartCode,
                            m.getDescription() != null ? m.getDescription() : "No Description")));
                    cs.endText();
                    y -= 15;
                }
            } catch (java.io.IOException e) {
                log.error("Error generating maintenance PDF content: {}", e.getMessage(), e);
            }
        }, "maintenance.pdf");
    }

    // --- PARTS ---

    @GetMapping(value = "/parts.csv", produces = "text/csv")
    public ResponseEntity<byte[]> partsCsv(org.springframework.security.core.Authentication auth) {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        StringBuilder sb = new StringBuilder();
        sb.append("id,name,sku,quantity,minStock\n");
        for (com.swam.model.Part p : partRepo.findAll()) {
            sb.append(String.format("%d,%s,%s,%d,%d\n", p.getId(), p.getName(), p.getSku(), p.getQuantity(),
                    p.getMinStock()));
        }
        return createResponse(sb.toString().getBytes(StandardCharsets.UTF_8), "parts.csv", "text/csv");
    }

    @GetMapping(value = "/parts.pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> partsPdf(org.springframework.security.core.Authentication auth) throws Exception {
        if (!isAuthorized(auth))
            return ResponseEntity.status(403).build();
        return createPdf("Inventory Report", doc -> {
            try (PDPageContentStream cs = new PDPageContentStream(doc, doc.getPage(0),
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                setupFont(cs);
                float y = 660;
                for (com.swam.model.Part p : partRepo.findAll()) {
                    if (y < 50)
                        break;
                    cs.beginText();
                    cs.newLineAtOffset(50, y);
                    String status = p.getQuantity() < p.getMinStock() ? "LOW STOCK" : "OK";
                    cs.showText(
                            sanitize(String.format("%s (%s): %d units [%s]", p.getName(), p.getSku(), p.getQuantity(),
                                    status)));
                    cs.endText();
                    y -= 15;
                }
            } catch (java.io.IOException e) {
                log.error("Error generating parts PDF content: {}", e.getMessage(), e);
            }
        }, "parts.pdf");
    }

    // --- UTILS ---

    private boolean isAuthorized(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
    }

    // --- UTILS ---

    private ResponseEntity<byte[]> createResponse(byte[] body, String filename, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .body(body);
    }

    private void setupFont(PDPageContentStream cs) throws java.io.IOException {
        cs.setFont(PDType1Font.HELVETICA, 10);
    }

    private String sanitize(String text) {
        if (text == null)
            return "";
        // Replace newlines and tabs with spaces, remove other control chars
        return text.replaceAll("[\\n\\r\\t]", " ").replaceAll("[\\p{Cntrl}]", "");
    }

    private ResponseEntity<byte[]> createPdf(String title, java.util.function.Consumer<PDDocument> contentWriter,
            String filename) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.beginText();
                cs.newLineAtOffset(50, 700);
                cs.showText(sanitize(title));
                cs.endText();
            }

            contentWriter.accept(doc);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(java.util.Objects.requireNonNull(MediaType.APPLICATION_PDF))
                    .body(baos.toByteArray());
        }
    }
}
