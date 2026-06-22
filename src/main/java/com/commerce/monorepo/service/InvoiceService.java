package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderItem;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final OrderRepository orderRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
    private static final double KDV_RATE = 0.20;

    // Şirket bilgileri — production'da application.properties'e taşınabilir
    private static final String COMPANY_NAME    = "AlisverisNoktan";
    private static final String COMPANY_ADDRESS = "Izmir, Turkiye";
    private static final String COMPANY_EMAIL   = "destek@alisverisnoktan.com";
    private static final String COMPANY_PHONE   = "+90 555 000 00 00";
    private static final String COMPANY_TAX_ID  = "1234567890";
    private static final String COMPANY_TAX_OFF = "Izmir V.D.";

    @Transactional(readOnly = true)
    public byte[] generateInvoice(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        return buildPdf(order);
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoiceForUser(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(userId)) {
            throw new BaseException(ErrorCode.ORDER_FORBIDDEN);
        }
        return buildPdf(order);
    }

    private byte[] buildPdf(Order order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Fontlar (Cp1254 = Turkce karakter destegi) ─────────────────
            BaseFont bfNormal = BaseFont.createFont(BaseFont.HELVETICA,      "Cp1254", BaseFont.NOT_EMBEDDED);
            BaseFont bfBold   = BaseFont.createFont(BaseFont.HELVETICA_BOLD, "Cp1254", BaseFont.NOT_EMBEDDED);

            java.awt.Color navyClr   = new java.awt.Color(30, 27, 75);
            java.awt.Color orangeClr = new java.awt.Color(249, 115, 22);
            java.awt.Color grayClr   = new java.awt.Color(107, 114, 128);
            java.awt.Color lightGray = new java.awt.Color(243, 244, 246);
            java.awt.Color borderClr = new java.awt.Color(229, 231, 235);
            java.awt.Color whiteClr  = new java.awt.Color(255, 255, 255);

            Font fBrandOrg  = new Font(bfBold,   20, Font.NORMAL, orangeClr);
            Font fBrandNav  = new Font(bfBold,   20, Font.NORMAL, navyClr);
            Font fTitle     = new Font(bfBold,   22, Font.NORMAL, navyClr);
            Font fLabel     = new Font(bfBold,    8, Font.NORMAL, grayClr);
            Font fValue     = new Font(bfNormal, 10, Font.NORMAL, navyClr);
            Font fValueB    = new Font(bfBold,   10, Font.NORMAL, navyClr);
            Font fSmall     = new Font(bfNormal,  8, Font.NORMAL, grayClr);
            Font fTableHdr  = new Font(bfBold,    9, Font.NORMAL, whiteClr);
            Font fTableVal  = new Font(bfNormal,  9, Font.NORMAL, navyClr);
            Font fTableValB = new Font(bfBold,    9, Font.NORMAL, navyClr);
            Font fTotalLbl  = new Font(bfBold,   11, Font.NORMAL, navyClr);
            Font fTotalVal  = new Font(bfBold,   13, Font.NORMAL, orangeClr);
            Font fFooter    = new Font(bfNormal,  8, Font.NORMAL, grayClr);

            // ── Header: Logo sol, FATURA etiketi sag ─────────────────────
            PdfPTable hdrTable = new PdfPTable(2);
            hdrTable.setWidthPercentage(100);
            hdrTable.setWidths(new float[]{1.4f, 1f});
            hdrTable.setSpacingAfter(20);

            // Sol: saf metin logo — "Alisveris" turuncu + "Noktan" lacivert
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Phrase bp = new Phrase();
            bp.add(new Chunk("Alisveris", fBrandOrg));
            bp.add(new Chunk("Noktan", fBrandNav));
            logoCell.addElement(new Paragraph(bp));

            // Sag: "FATURA" + fatura no
            String invoiceNo = "FTR-" + order.getOrderNumber();
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph titlePar = new Paragraph("FATURA", fTitle);
            titlePar.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(titlePar);
            Paragraph invNoPar = new Paragraph(invoiceNo, new Font(bfBold, 9, Font.NORMAL, orangeClr));
            invNoPar.setAlignment(Element.ALIGN_RIGHT);
            invNoPar.setSpacingBefore(4);
            titleCell.addElement(invNoPar);

            hdrTable.addCell(logoCell);
            hdrTable.addCell(titleCell);
            doc.add(hdrTable);

            // ── Ayirici ────────────────────────────────────────────────────
            doc.add(separator(borderClr));

            // ── Satici + Alici bilgileri ────────────────────────────────────
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1f, 1f});
            infoTable.setSpacingAfter(20);

            // Sol: Satici (biz)
            PdfPCell sellerCell = new PdfPCell();
            sellerCell.setBorder(Rectangle.NO_BORDER);
            sellerCell.setPaddingRight(20);
            addKV(sellerCell, "SATICI", null, fLabel, fValue);
            addKV(sellerCell, null, COMPANY_NAME,    fLabel, fValueB);
            addKV(sellerCell, null, COMPANY_ADDRESS, fLabel, fValue);
            addKV(sellerCell, null, COMPANY_EMAIL,   fLabel, fValue);
            addKV(sellerCell, null, COMPANY_PHONE,   fLabel, fValue);
            addKV(sellerCell, "VKN", COMPANY_TAX_ID + " / " + COMPANY_TAX_OFF, fLabel, fValue);
            infoTable.addCell(sellerCell);

            // Sag: Alici (musteri)
            PdfPCell buyerCell = new PdfPCell();
            buyerCell.setBorder(Rectangle.NO_BORDER);
            addKV(buyerCell, "ALICI", null, fLabel, fValue);
            if (order.getBillingAddress() != null) {
                addKV(buyerCell, null, order.getBillingAddress().getFullName(), fLabel, fValueB);
                addKV(buyerCell, null, order.getBillingAddress().getPhone(),    fLabel, fValue);
                addKV(buyerCell, null, order.getBillingAddress().getAddressLine(), fLabel, fValue);
                String loc = order.getBillingAddress().getDistrict() + " / "
                        + order.getBillingAddress().getCity()
                        + (order.getBillingAddress().getPostalCode() != null
                            ? " — " + order.getBillingAddress().getPostalCode() : "");
                addKV(buyerCell, null, loc, fLabel, fValue);
            } else if (order.getShippingAddress() != null) {
                addKV(buyerCell, null, order.getShippingAddress().getFullName(), fLabel, fValueB);
                addKV(buyerCell, null, order.getShippingAddress().getPhone(),    fLabel, fValue);
                addKV(buyerCell, null, order.getShippingAddress().getAddressLine(), fLabel, fValue);
            }
            addKV(buyerCell, "FATURA TARIHi",
                    order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FMT) : "", fLabel, fValue);
            addKV(buyerCell, "SiPARiS NO", order.getOrderNumber(), fLabel, fValue);
            infoTable.addCell(buyerCell);

            doc.add(infoTable);

            // ── Urun tablosu ───────────────────────────────────────────────
            PdfPTable prodTable = new PdfPTable(new float[]{3f, 1f, 1.2f, 1.2f, 1.5f});
            prodTable.setWidthPercentage(100);
            prodTable.setSpacingAfter(16);

            // Tablo baslik satiri
            String[] headers = {"Urun", "Adet", "Birim Fiyat", "KDV (%20)", "Tutar"};
            for (String h : headers) {
                PdfPCell hc = new PdfPCell(new Phrase(h, fTableHdr));
                hc.setBackgroundColor(navyClr);
                hc.setPadding(8);
                hc.setBorder(Rectangle.NO_BORDER);
                if (!h.equals("Urun")) hc.setHorizontalAlignment(Element.ALIGN_RIGHT);
                prodTable.addCell(hc);
            }

            // Urun satirlari
            boolean altRow = false;
            for (OrderItem item : order.getItems()) {
                java.awt.Color rowBg = altRow ? lightGray : whiteClr;
                altRow = !altRow;

                double unitPrice = item.getUnitPrice().doubleValue();
                double lineTotal = item.getTotalPrice().doubleValue();
                double kdvBase   = round(lineTotal / (1 + KDV_RATE));
                double kdvAmount = round(lineTotal - kdvBase);

                String productName = item.getProduct().getName();
                tableCell(prodTable, productName, fTableVal, Element.ALIGN_LEFT, rowBg);
                tableCell(prodTable, item.getQuantity() + " adet", fTableVal, Element.ALIGN_RIGHT, rowBg);
                tableCell(prodTable, formatMoney(unitPrice), fTableVal, Element.ALIGN_RIGHT, rowBg);
                tableCell(prodTable, formatMoney(kdvAmount), fTableVal, Element.ALIGN_RIGHT, rowBg);
                tableCell(prodTable, formatMoney(lineTotal), fTableValB, Element.ALIGN_RIGHT, rowBg);
            }
            doc.add(prodTable);

            // ── Toplam ozeti ───────────────────────────────────────────────
            double subtotal   = order.getSubtotal().doubleValue();
            double shipping   = order.getShippingCost().doubleValue();
            double discount   = order.getDiscountAmount() != null ? order.getDiscountAmount().doubleValue() : 0;
            double total      = order.getTotal().doubleValue();
            double kdvBase    = round(subtotal / (1 + KDV_RATE));
            double kdvAmount  = round(subtotal - kdvBase);

            // ── QR + Toplam yan yana ──────────────────────────────────────
            PdfPTable bottomRow = new PdfPTable(2);
            bottomRow.setWidthPercentage(100);
            bottomRow.setWidths(new float[]{1f, 1.1f});
            bottomRow.setSpacingAfter(20);

            // Sol: QR kod (fatura no iceriyor)
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            qrCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            qrCell.setPaddingRight(20);
            try {
                byte[] qrBytes = generateQr(invoiceNo, 120);
                Image qrImg = Image.getInstance(qrBytes);
                qrImg.scaleToFit(100, 100);
                Paragraph qrLabel = new Paragraph("Fatura Dogrulama", fSmall);
                qrLabel.setSpacingAfter(4);
                qrCell.addElement(qrLabel);
                qrCell.addElement(qrImg);
                Paragraph qrNo = new Paragraph(invoiceNo, new Font(bfBold, 7, Font.NORMAL, grayClr));
                qrNo.setSpacingBefore(4);
                qrCell.addElement(qrNo);
            } catch (Exception e) {
                log.warn("QR kod olusturulamadi: {}", e.getMessage());
            }
            bottomRow.addCell(qrCell);

            // Sag: toplam ozeti
            PdfPCell sumCell = new PdfPCell();
            sumCell.setBorder(Rectangle.NO_BORDER);

            PdfPTable sumTable = new PdfPTable(2);
            summaryRow(sumTable, "Ara Toplam (KDV Haric)",  formatMoney(kdvBase),    fSmall,  new Font(bfNormal, 9, Font.NORMAL, navyClr));
            summaryRow(sumTable, "KDV (%20)",               formatMoney(kdvAmount),  fSmall,  new Font(bfNormal, 9, Font.NORMAL, navyClr));
            summaryRow(sumTable, "Kargo",                   formatMoney(shipping),   fSmall,  new Font(bfNormal, 9, Font.NORMAL, navyClr));
            if (discount > 0) {
                summaryRow(sumTable, "indirim", "-" + formatMoney(discount), fSmall,
                        new Font(bfNormal, 9, Font.NORMAL, new java.awt.Color(16, 185, 129)));
            }
            PdfPCell tLblCell = new PdfPCell(new Phrase("GENEL TOPLAM", fTotalLbl));
            tLblCell.setBorder(Rectangle.TOP);
            tLblCell.setBorderColor(borderClr);
            tLblCell.setPadding(8);
            tLblCell.setPaddingTop(12);
            PdfPCell tValCell = new PdfPCell(new Phrase(formatMoney(total), fTotalVal));
            tValCell.setBorder(Rectangle.TOP);
            tValCell.setBorderColor(borderClr);
            tValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            tValCell.setPadding(8);
            tValCell.setPaddingTop(12);
            sumTable.addCell(tLblCell);
            sumTable.addCell(tValCell);
            sumCell.addElement(sumTable);
            bottomRow.addCell(sumCell);
            doc.add(bottomRow);

            // ── Ayirici ────────────────────────────────────────────────────
            doc.add(separator(borderClr));

            // ── Alt bilgi ──────────────────────────────────────────────────
            Paragraph footer = new Paragraph(
                "Bu belge " + (order.getCreatedAt() != null ? order.getCreatedAt().format(DATETIME_FMT) : "")
                + " tarihinde olusturulmustur.  |  " + COMPANY_EMAIL,
                fFooter);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(10);
            doc.add(footer);

            doc.close();
            return out.toByteArray();

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Invoice generation failed for order {}: {}", e.getMessage(), e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // ── Yardimci metodlar ──────────────────────────────────────────────────

    private byte[] generateQr(String content, int size) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size);
        BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }

    private PdfPTable separator(java.awt.Color color) {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setSpacingAfter(16);
        PdfPCell c = new PdfPCell(new Phrase(" "));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(color);
        c.setPadding(2);
        t.addCell(c);
        return t;
    }

    private void addKV(PdfPCell cell, String label, String value, Font labelFont, Font valueFont) {
        if (label != null) {
            Paragraph lp = new Paragraph(label, labelFont);
            lp.setSpacingBefore(6);
            cell.addElement(lp);
        }
        if (value != null && !value.isBlank()) {
            cell.addElement(new Paragraph(value, valueFont));
        }
    }

    private void tableCell(PdfPTable table, String text, Font font, int align, java.awt.Color bg) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(new java.awt.Color(229, 231, 235));
        c.setBackgroundColor(bg);
        c.setPadding(8);
        c.setHorizontalAlignment(align);
        table.addCell(c);
    }

    private void summaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell lc = new PdfPCell(new Phrase(label, labelFont));
        lc.setBorder(Rectangle.NO_BORDER);
        lc.setPadding(4);
        PdfPCell vc = new PdfPCell(new Phrase(value, valueFont));
        vc.setBorder(Rectangle.NO_BORDER);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setPadding(4);
        table.addCell(lc);
        table.addCell(vc);
    }

    private double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String formatMoney(double amount) {
        return String.format("%,.2f TL", amount).replace(',', '.').replace('.', ',').replaceFirst(",", ".");
    }
}
