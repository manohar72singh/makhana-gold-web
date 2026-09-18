import {
  isShiprocketConfigured,
  checkPincodeServiceability,
  pushOrderToShiprocket,
  assignShiprocketAwb,
  CreateShiprocketOrderParams,
  ServiceabilityResult,
} from "./shiprocket";

export {
  isShiprocketConfigured,
  checkPincodeServiceability,
  pushOrderToShiprocket,
  assignShiprocketAwb,
};
export type { CreateShiprocketOrderParams, ServiceabilityResult };

export interface TrackingStep {
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
}

export const POPULAR_INDIAN_COURIERS = [
  { value: "Delhivery Express Surface", label: "Delhivery (Express Surface / Air)" },
  { value: "Shiprocket Express", label: "Shiprocket (Multi-Carrier Auto)" },
  { value: "Blue Dart Air Priority", label: "Blue Dart (Express Air)" },
  { value: "DTDC Premium", label: "DTDC (Domestic Priority)" },
  { value: "India Post Speed Post", label: "India Post (Speed Post)" },
  { value: "Shadowfax Express", label: "Shadowfax (E-commerce Express)" },
  { value: "Xpressbees Logistics", label: "Xpressbees (Fast Delivery)" },
] as const;

export function getCarrierTrackingUrl(courier: string, trackingNumber: string): string {
  const c = courier.toLowerCase();
  if (c.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${trackingNumber}`;
  }
  if (c.includes("shiprocket")) {
    return `https://shiprocket.co/tracking/${trackingNumber}`;
  }
  if (c.includes("blue")) {
    return `https://www.bluedart.com/tracking`;
  }
  if (c.includes("dtdc")) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  }
  if (c.includes("india post") || c.includes("speed post")) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  }
  return `https://trackcourier.in/track/${trackingNumber}`;
}

export function generateAwbTrackingDetails(
  orderNumber: string,
  courier: string = "Delhivery Express Surface",
  customAwb?: string
) {
  let trackingNumber = (customAwb || "").trim();

  if (!trackingNumber) {
    const prefix = courier.toLowerCase().includes("delhivery")
      ? "DEL"
      : courier.toLowerCase().includes("shiprocket")
      ? "SR"
      : courier.toLowerCase().includes("blue")
      ? "BD"
      : courier.toLowerCase().includes("dtdc")
      ? "DTDC"
      : courier.toLowerCase().includes("india post") || courier.toLowerCase().includes("speed post")
      ? "SP"
      : "MG";

    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    trackingNumber = `${prefix}-${randomDigits}`;
  }

  const trackingUrl = getCarrierTrackingUrl(courier, trackingNumber);

  return {
    trackingNumber,
    courierPartner: courier,
    trackingUrl,
  };
}

export function getOrderTrackingTimeline({
  status,
  createdAt,
  updatedAt,
  trackingNumber,
  courierPartner,
}: {
  status: string;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string | null;
  courierPartner?: string | null;
}): TrackingStep[] {
  const createdDateStr = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDateStr = new Date(updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const stepsHierarchy = ["confirmed", "processing", "shipped", "delivered"];
  const currentStatusIndex = stepsHierarchy.indexOf(status.toLowerCase());

  return [
    {
      step: 1,
      title: "Order Placed & Confirmed",
      subtitle: "Received at central order processing queue",
      icon: "task_alt",
      isCompleted: currentStatusIndex >= 0,
      isCurrent: status === "confirmed" || status === "pending",
      timestamp: createdDateStr,
    },
    {
      step: 2,
      title: "Slow-Roasted & Freshly Packed",
      subtitle: "Hand-graded & sealed at Mithila Processing Facility",
      icon: "inventory_2",
      isCompleted: currentStatusIndex >= 1,
      isCurrent: status === "processing",
      timestamp: currentStatusIndex >= 1 ? updatedDateStr : undefined,
    },
    {
      step: 3,
      title: `Dispatched via ${courierPartner || "Delhivery Express"}`,
      subtitle: trackingNumber
        ? `AWB: ${trackingNumber} • In transit to local delivery hub`
        : "AWB generation and courier handover in progress",
      icon: "local_shipping",
      isCompleted: currentStatusIndex >= 2,
      isCurrent: status === "shipped",
      timestamp: currentStatusIndex >= 2 ? updatedDateStr : undefined,
    },
    {
      step: 4,
      title: "Out For Doorstep Delivery",
      subtitle: "Courier delivery specialist assigned to your route",
      icon: "delivery_dining",
      isCompleted: currentStatusIndex >= 3,
      isCurrent: false,
      timestamp: status === "delivered" ? updatedDateStr : undefined,
    },
    {
      step: 5,
      title: "Safely Delivered",
      subtitle: "Package handed over. Enjoy your golden crunch!",
      icon: "home_pin",
      isCompleted: status === "delivered",
      isCurrent: status === "delivered",
      timestamp: status === "delivered" ? updatedDateStr : undefined,
    },
  ];
}
