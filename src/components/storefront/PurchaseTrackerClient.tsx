"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent, trackGAEvent } from "./AnalyticsTracker";

export function PurchaseTrackerClient({
  orderNumber,
  grandTotal,
  itemCount,
}: {
  orderNumber: string;
  grandTotal: number;
  itemCount: number;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;

      // 1. Fire Meta (Facebook/Instagram Ads) Purchase Event
      trackMetaEvent("Purchase", {
        value: grandTotal,
        currency: "INR",
        content_type: "product",
        num_items: itemCount,
        order_id: orderNumber,
      });

      // 2. Fire Google Analytics 4 Purchase Event
      trackGAEvent("purchase", {
        transaction_id: orderNumber,
        value: grandTotal,
        currency: "INR",
        items_count: itemCount,
      });
    }
  }, [orderNumber, grandTotal, itemCount]);

  return null;
}
