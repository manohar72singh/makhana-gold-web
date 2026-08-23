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

export function generateAwbTrackingDetails(
  orderNumber: string,
  courier: string = "Delhivery Express"
) {
  const prefix = courier.toLowerCase().includes("delhivery")
    ? "DEL"
    : courier.toLowerCase().includes("shiprocket")
      ? "SR"
      : courier.toLowerCase().includes("blue")
        ? "BD"
        : "EXP";

  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  const trackingNumber = `${prefix}-${randomDigits}`;

  const trackingUrl = courier.toLowerCase().includes("delhivery")
    ? `https://www.delhivery.com/track/package/${trackingNumber}`
    : courier.toLowerCase().includes("shiprocket")
      ? `https://shiprocket.co/tracking/${trackingNumber}`
      : `https://trackcourier.in/track/${trackingNumber}`;

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
