package com.commerce.monorepo.service;

import com.commerce.monorepo.entity.Order;
import com.commerce.monorepo.entity.OrderItem;
import com.commerce.monorepo.entity.ShippingCarrier;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.OrderRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingLabelService {

    private final OrderRepository orderRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    @Transactional(readOnly = true)
    public byte[] generateLabel(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BaseException(ErrorCode.ORDER_NOT_FOUND));
        return buildPdf(order);
    }

    private byte[] buildPdf(Order order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Fontlar (Cp1254 = Windows Turkish — ş ğ ı ü ö ç İ Ş Ğ desteği) ──
            BaseFont bfNormal = BaseFont.createFont(BaseFont.HELVETICA,       "Cp1254", BaseFont.NOT_EMBEDDED);
            BaseFont bfBold   = BaseFont.createFont(BaseFont.HELVETICA_BOLD,  "Cp1254", BaseFont.NOT_EMBEDDED);

            Font fontBrand  = new Font(bfBold,   20, Font.NORMAL, new java.awt.Color(249, 115, 22));
            Font fontBrand2 = new Font(bfBold,   20, Font.NORMAL, new java.awt.Color(30,  27, 75));
            Font fontHeader = new Font(bfBold,   11, Font.NORMAL, new java.awt.Color(30,  27, 75));
            Font fontLabel  = new Font(bfBold,    8, Font.NORMAL, new java.awt.Color(107, 114, 128));
            Font fontValue  = new Font(bfNormal, 10, Font.NORMAL, new java.awt.Color(30,  27, 75));
            Font fontValueB = new Font(bfBold,   10, Font.NORMAL, new java.awt.Color(30,  27, 75));
            Font fontSmall  = new Font(bfNormal,  8, Font.NORMAL, new java.awt.Color(107, 114, 128));
            Font fontItem   = new Font(bfBold,    9, Font.NORMAL, new java.awt.Color(30,  27, 75));
            Font fontItemSub= new Font(bfNormal,  8, Font.NORMAL, new java.awt.Color(107, 114, 128));

            // ── Header: lacivert şerit — logo + marka adı sol, kargo firması sağ ──
            java.awt.Color navyBg    = new java.awt.Color(30, 27, 75);
            java.awt.Color orangeClr = new java.awt.Color(249, 115, 22);
            java.awt.Color whiteClr  = new java.awt.Color(255, 255, 255);

            Font fontBrandHdr  = new Font(bfBold,   18, Font.NORMAL, orangeClr);
            Font fontBrandHdr2 = new Font(bfBold,   18, Font.NORMAL, whiteClr);
            Font fontCarrierHdr= new Font(bfBold,   11, Font.NORMAL, whiteClr);

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1.5f, 1f});
            headerTable.setSpacingAfter(14);

            // Sol hücre: logo ikonu + marka adı
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setBackgroundColor(navyBg);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logoCell.setPadding(10);

            // Logo ikonunu yükle, beyaz arka plan üzerine koy
            boolean logoLoaded = false;
            try (InputStream logoStream = getClass().getResourceAsStream("/images/logo.webp")) {
                if (logoStream != null) {
                    BufferedImage logoBuffered = ImageIO.read(logoStream);
                    if (logoBuffered != null) {
                        // Şeffaf pikselleri lacivert arka planla doldur
                        BufferedImage flat = new BufferedImage(
                                logoBuffered.getWidth(), logoBuffered.getHeight(),
                                BufferedImage.TYPE_INT_RGB);
                        Graphics2D g2 = flat.createGraphics();
                        g2.setColor(new java.awt.Color(30, 27, 75));
                        g2.fillRect(0, 0, flat.getWidth(), flat.getHeight());
                        g2.drawImage(logoBuffered, 0, 0, null);
                        g2.dispose();
                        ByteArrayOutputStream logoPng = new ByteArrayOutputStream();
                        ImageIO.write(flat, "PNG", logoPng);
                        Image logoImg = Image.getInstance(logoPng.toByteArray());
                        logoImg.scaleToFit(34, 34);

                        PdfPTable logoRow = new PdfPTable(2);
                        logoRow.setWidths(new float[]{0.55f, 2f});
                        PdfPCell imgCell = new PdfPCell(logoImg, false);
                        imgCell.setBorder(Rectangle.NO_BORDER);
                        imgCell.setBackgroundColor(navyBg);
                        imgCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        imgCell.setPaddingRight(8);

                        Phrase brandPh = new Phrase();
                        brandPh.add(new Chunk("Alisveris", fontBrandHdr));
                        brandPh.add(new Chunk("Noktan", fontBrandHdr2));
                        PdfPCell brandCell = new PdfPCell(brandPh);
                        brandCell.setBorder(Rectangle.NO_BORDER);
                        brandCell.setBackgroundColor(navyBg);
                        brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

                        logoRow.addCell(imgCell);
                        logoRow.addCell(brandCell);
                        logoCell.addElement(logoRow);
                        logoLoaded = true;
                    }
                }
            } catch (Exception e) {
                log.warn("Logo yuklenemedi: {}", e.getMessage());
            }
            if (!logoLoaded) {
                Phrase logoPh = new Phrase();
                logoPh.add(new Chunk("Alisveris", fontBrandHdr));
                logoPh.add(new Chunk("Noktan", fontBrandHdr2));
                logoCell.addElement(new Paragraph(logoPh));
            }

            // Sağ hücre: kargo firması
            String carrierName = resolveCarrierName(order.getShippingCarrier());
            PdfPCell carrierCell = new PdfPCell(new Phrase(carrierName, fontCarrierHdr));
            carrierCell.setBorder(Rectangle.NO_BORDER);
            carrierCell.setBackgroundColor(navyBg);
            carrierCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            carrierCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            carrierCell.setPadding(10);

            headerTable.addCell(logoCell);
            headerTable.addCell(carrierCell);
            doc.add(headerTable);

            // ── Ayırıcı çizgi ────────────────────────────────────────────
            PdfPTable sepTable = new PdfPTable(1);
            sepTable.setWidthPercentage(100);
            sepTable.setSpacingAfter(8);
            PdfPCell sepCell = new PdfPCell(new Phrase(" "));
            sepCell.setBorder(Rectangle.BOTTOM);
            sepCell.setBorderColor(new java.awt.Color(229, 231, 235));
            sepCell.setPadding(2);
            sepTable.addCell(sepCell);
            doc.add(sepTable);

            // ── Barkod içeriği: trackingNumber varsa onu, yoksa orderNumber ──
            String barcodeContent = (order.getTrackingNumber() != null && !order.getTrackingNumber().isBlank())
                    ? order.getTrackingNumber()
                    : order.getOrderNumber();

            // ── Orta bölüm: Alıcı Bilgileri | Kargo Barkodu ─────────────
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.setWidthPercentage(100);
            mainTable.setWidths(new float[]{1f, 1f});
            mainTable.setSpacingAfter(12);

            // Sol — Alıcı Bilgileri
            PdfPCell recipientCell = new PdfPCell();
            recipientCell.setBorder(Rectangle.BOX);
            recipientCell.setBorderColor(new java.awt.Color(229, 231, 235));
            recipientCell.setPadding(12);

            Paragraph recipientTitle = new Paragraph("Alıcı Bilgileri", fontHeader);
            recipientTitle.setSpacingAfter(8);
            recipientCell.addElement(recipientTitle);

            addLabelValue(recipientCell, "Sipariş No", order.getOrderNumber(), fontLabel, fontValueB);
            if (order.getShippingAddress() != null) {
                addLabelValue(recipientCell, "Ad-Soyad",
                        order.getShippingAddress().getFullName(), fontLabel, fontValue);
                addLabelValue(recipientCell, "Telefon",
                        order.getShippingAddress().getPhone(), fontLabel, fontValue);

                String addressLine = order.getShippingAddress().getAddressLine();
                String district    = order.getShippingAddress().getDistrict();
                String city        = order.getShippingAddress().getCity();
                String postal      = order.getShippingAddress().getPostalCode();

                addLabelValue(recipientCell, "Adres", addressLine, fontLabel, fontValue);
                String cityLine = (district != null ? district + " / " : "") + (city != null ? city : "");
                if (postal != null && !postal.isBlank()) cityLine += " — " + postal;
                recipientCell.addElement(new Paragraph(cityLine, fontValueB));
            }

            // Sağ — Kargo Barkodu
            PdfPCell barcodeCell = new PdfPCell();
            barcodeCell.setBorder(Rectangle.BOX);
            barcodeCell.setBorderColor(new java.awt.Color(229, 231, 235));
            barcodeCell.setPadding(12);
            barcodeCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph barcodeTitle = new Paragraph("Kargo Barkodu", fontHeader);
            barcodeTitle.setSpacingAfter(8);
            barcodeCell.addElement(barcodeTitle);

            try {
                byte[] barcodeBytes = generateBarcode(barcodeContent);
                Image barcodeImg = Image.getInstance(barcodeBytes);
                barcodeImg.scaleToFit(200, 60);
                barcodeImg.setAlignment(Image.ALIGN_CENTER);
                barcodeCell.addElement(barcodeImg);
                Paragraph barcodeNum = new Paragraph(barcodeContent, fontSmall);
                barcodeNum.setAlignment(Element.ALIGN_CENTER);
                barcodeNum.setSpacingBefore(4);
                barcodeCell.addElement(barcodeNum);
            } catch (Exception e) {
                log.warn("Barcode generation failed for {}: {}", barcodeContent, e.getMessage());
                barcodeCell.addElement(new Paragraph(barcodeContent, fontValueB));
            }

            mainTable.addCell(recipientCell);
            mainTable.addCell(barcodeCell);
            doc.add(mainTable);

            // ── Ürün Bilgileri bölümü ─────────────────────────────────────
            PdfPTable productSection = new PdfPTable(1);
            productSection.setWidthPercentage(100);

            PdfPCell productTitleCell = new PdfPCell(new Phrase("Ürün Bilgileri", fontHeader));
            productTitleCell.setBorder(Rectangle.BOX);
            productTitleCell.setBorderColor(new java.awt.Color(229, 231, 235));
            productTitleCell.setPadding(10);
            productTitleCell.setBackgroundColor(new java.awt.Color(249, 250, 251));
            productSection.addCell(productTitleCell);

            int index = 1;
            for (OrderItem item : order.getItems()) {
                PdfPTable itemRow = new PdfPTable(new float[]{0.5f, 4f, 1.5f, 1.5f, 2f});
                itemRow.setWidthPercentage(100);

                // Sıra no
                PdfPCell numCell = new PdfPCell(new Phrase(String.valueOf(index++), fontItem));
                numCell.setBorder(Rectangle.NO_BORDER);
                numCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                numCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                numCell.setPadding(8);

                // Ürün adı
                PdfPCell nameCell = new PdfPCell(new Phrase(item.getProduct().getName(), fontItem));
                nameCell.setBorder(Rectangle.NO_BORDER);
                nameCell.setPadding(8);

                // Adet
                PdfPCell qtyCell = new PdfPCell();
                qtyCell.setBorder(Rectangle.NO_BORDER);
                qtyCell.setPadding(8);
                qtyCell.addElement(new Paragraph("Adet", fontItemSub));
                qtyCell.addElement(new Paragraph(item.getQuantity() + " Adet", fontItem));

                // Beden/Renk
                String variant = buildVariantText(item);
                PdfPCell varCell = new PdfPCell();
                varCell.setBorder(Rectangle.NO_BORDER);
                varCell.setPadding(8);
                varCell.addElement(new Paragraph("Beden/Renk", fontItemSub));
                varCell.addElement(new Paragraph(variant, fontItem));

                // SKU
                String sku = item.getProduct().getSku() != null ? item.getProduct().getSku() : "—";
                PdfPCell skuCell = new PdfPCell();
                skuCell.setBorder(Rectangle.NO_BORDER);
                skuCell.setPadding(8);
                skuCell.addElement(new Paragraph("Stok Kodu", fontItemSub));
                skuCell.addElement(new Paragraph(sku, fontItem));

                itemRow.addCell(numCell);
                itemRow.addCell(nameCell);
                itemRow.addCell(qtyCell);
                itemRow.addCell(varCell);
                itemRow.addCell(skuCell);

                PdfPCell wrapperCell = new PdfPCell(itemRow);
                wrapperCell.setBorder(Rectangle.BOX);
                wrapperCell.setBorderColor(new java.awt.Color(229, 231, 235));
                wrapperCell.setPadding(0);
                productSection.addCell(wrapperCell);
            }

            doc.add(productSection);

            // ── Alt bilgi ──────────────────────────────────────────────────
            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                "Oluşturulma tarihi: " + (order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FMT) : ""),
                fontSmall);
            footer.setAlignment(Element.ALIGN_RIGHT);
            doc.add(footer);

            doc.close();
            return out.toByteArray();

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Shipping label generation failed for order {}: {}", order.getId(), e.getMessage(), e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private byte[] generateBarcode(String content) throws Exception {
        Code128Writer writer = new Code128Writer();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.CODE_128, 350, 80);
        BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }

    private void addLabelValue(PdfPCell cell, String label, String value, Font labelFont, Font valueFont) {
        if (value == null || value.isBlank()) return;
        cell.addElement(new Paragraph(label, labelFont));
        Paragraph p = new Paragraph(value, valueFont);
        p.setSpacingAfter(6);
        cell.addElement(p);
    }

    private String buildVariantText(OrderItem item) {
        StringBuilder sb = new StringBuilder();
        // OrderItem'da variant bilgisini product üzerinden doğrudan okuyamıyoruz,
        // ancak gelecekte variant join eklenebilir. Şimdilik "—" dönüyoruz.
        return sb.length() > 0 ? sb.toString() : "—";
    }

    private String resolveCarrierName(String carrier) {
        if (carrier == null) return "—";
        try {
            return ShippingCarrier.valueOf(carrier).getDisplayName();
        } catch (IllegalArgumentException e) {
            return carrier;
        }
    }
}
