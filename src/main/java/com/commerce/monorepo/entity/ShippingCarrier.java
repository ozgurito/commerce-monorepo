package com.commerce.monorepo.entity;

import lombok.Getter;

@Getter
public enum ShippingCarrier {
    YURTICI("Yurtiçi Kargo",  "https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code="),
    ARAS   ("Aras Kargo",     "https://kargotakip.araskargo.com.tr/?trackingNumber="),
    MNG    ("MNG Kargo",      "https://www.mngkargo.com.tr/tracing?no="),
    PTT    ("PTT Kargo",      "https://gonderitakip.ptt.gov.tr/Track/Lookup?q=");

    private final String displayName;
    private final String trackingUrlPrefix;

    ShippingCarrier(String displayName, String trackingUrlPrefix) {
        this.displayName = displayName;
        this.trackingUrlPrefix = trackingUrlPrefix;
    }

    public String buildTrackingUrl(String trackingNumber) {
        return trackingUrlPrefix + trackingNumber;
    }
}
