"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCarrierTrackingUrl } from "@/lib/logistics";

export interface SerializedOrderItem {
  id: number;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string | null;
}

export interface SerializedOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  grandTotal: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingTotal: number;
  courierPartner: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  isB2b: boolean;
  companyName: string | null;
  gstin: string | null;
  createdAt: string;
  customer: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: SerializedOrderItem[];
}

interface FilterTab {
  label: string;
  value: string;
  count: number;
}

const STATUS_BADGE_STYLE: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  pending: { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200", dot: "bg-neutral-400" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" },
  processing: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", dot: "bg-amber-500" },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-600" },
  cancelled: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", dot: "bg-red-500" },
  returned: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" },
};

export function OrdersAccordionClient({
  orders,
  filterTabs,
  activeFulfillmentCount,
}: {
  orders: SerializedOrder[];
  filterTabs: FilterTab[];
  activeFulfillmentCount: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(text);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  // Filtered orders by search and status pill
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatus !== "all" && o.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesOrderNum = o.orderNumber.toLowerCase().includes(q);
        const matchesCustomer =
          (o.customer.name && o.customer.name.toLowerCase().includes(q)) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.customer.phone && o.customer.phone.includes(q));
        const matchesCity =
          o.shippingAddress &&
          (o.shippingAddress.city.toLowerCase().includes(q) ||
            o.shippingAddress.state.toLowerCase().includes(q) ||
            o.shippingAddress.pincode.includes(q));
        const matchesAwb = o.trackingNumber && o.trackingNumber.toLowerCase().includes(q);
        const matchesCompany = o.companyName && o.companyName.toLowerCase().includes(q);

        return matchesOrderNum || matchesCustomer || matchesCity || matchesAwb || matchesCompany;
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ── Top Header & Actions ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Orders &amp; Dispatch Hub
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time fulfillment list: View customer orders, items breakdown, and print 4x6 packaging labels.
          </p>
        </div>

        <Link
          href="/admin/fulfillment"
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl font-extrabold text-xs tracking-wide text-white transition-all cursor-pointer whitespace-nowrap shrink-0 group shadow-xs ${
            activeFulfillmentCount > 0
              ? "bg-[#D84315] hover:bg-[#BF360C]"
              : "bg-neutral-900 hover:bg-neutral-800"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-sm">📦</span>
            <span>Fulfillment Queue</span>
          </span>
          {activeFulfillmentCount > 0 && (
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-normal leading-tight">
              {activeFulfillmentCount} To Pack
            </span>
          )}
          <span className="text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs font-black">
            ↗
          </span>
        </Link>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────────── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
        {/* Full-width clean search bar (Expand/Collapse buttons removed) */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by Order # (e.g. MG-8004), Customer Name, Phone, City, or AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF6EE]/50 text-xs sm:text-sm text-neutral-800 font-medium placeholder-neutral-400 focus:outline-none focus:border-[#D84315] focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#1C150C] text-[#FAF6EE] shadow-xs"
                    : "bg-[#FAF6EE]/60 border border-neutral-200/80 text-neutral-700 hover:border-amber-400"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders Accordion List ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        {/* Clean Table Header (Tablet & Desktop View >= 768px) */}
        <div className="hidden md:grid grid-cols-12 gap-2.5 lg:gap-3 px-4 lg:px-5 py-3 bg-neutral-50 border-b border-neutral-200/80 text-[11px] font-black text-neutral-500 uppercase tracking-wider items-center">
          <div className="col-span-3">Order Details</div>
          <div className="col-span-3">Customer &amp; Items</div>
          <div className="col-span-2">Amount &amp; Payment</div>
          <div className="col-span-2">Fulfillment Status</div>
          <div className="col-span-2 text-right">Quick Actions</div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-sm font-bold text-neutral-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-neutral-300 block">
              inbox
            </span>
            <p>No orders found matching your filters.</p>
            {(searchQuery || selectedStatus !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
                className="text-xs text-[#D84315] hover:underline font-bold cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Clean Accordion Rows */}
        <div className="divide-y divide-neutral-100">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const statusStyle =
              STATUS_BADGE_STYLE[order.status] || STATUS_BADGE_STYLE.pending;

            return (
              <div key={order.id} className="transition-colors">
                {/* ── Collapsed Clean Row (Click to toggle dropdown) ────────── */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className={`w-full p-3 sm:px-4 lg:px-5 sm:py-3 transition-colors cursor-pointer select-none ${
                    isExpanded
                      ? "bg-amber-50/60"
                      : "bg-white hover:bg-neutral-50/80"
                  }`}
                >
                  {/* ── 1. Mobile Compact Card (< 768px) ── */}
                  <div className="md:hidden space-y-2.5">
                    {/* Top Row: Order # + Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-black text-[#D84315] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        {order.isB2b && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 border border-emerald-300 text-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                            B2B
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span>{order.status}</span>
                      </span>
                    </div>

                    {/* Bottom Row: Customer & Total Amount + Quick Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100/80">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {order.customer.name || order.customer.email}
                        </p>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <strong className="text-neutral-800">₹{order.grandTotal.toFixed(0)}</strong>
                          <span>•</span>
                          <span>{totalItemsCount} {totalItemsCount === 1 ? "pack" : "packs"}</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] font-bold text-neutral-600">
                            {order.paymentReference ? "Prepaid" : order.paymentStatus === "paid" ? "Prepaid" : "COD"}
                          </span>
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/api/shipping-label/${order.orderNumber}`}
                          target="_blank"
                          title="Print 4x6 Barcode Shipping Label"
                          className="px-2 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-amber-50 text-neutral-800 text-[11px] font-bold"
                        >
                          🏷️
                        </Link>
                        <Link
                          href={`/api/invoice/${order.orderNumber}`}
                          target="_blank"
                          title="Print GST Invoice"
                          className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold"
                        >
                          🧾
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleOrder(order.id)}
                          className="w-7 h-7 rounded-lg hover:bg-neutral-200/60 flex items-center justify-center text-neutral-500"
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-[#D84315]" : "rotate-0"
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── 2. Tablet & Desktop 12-Col Table (>= 768px) ── */}
                  <div className="hidden md:grid md:grid-cols-12 gap-2 lg:gap-3 items-center">
                    {/* Col 1-3: Order #, Date & B2B Badge */}
                    <div className="md:col-span-3 flex items-center gap-2.5 lg:gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-amber-900/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#D84315] text-[17px]">
                          receipt
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/admin/orders/${order.orderNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs lg:text-[13px] font-black text-[#D84315] hover:underline truncate"
                          >
                            {order.orderNumber}
                          </Link>
                          {order.isB2b && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 border border-emerald-300 text-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                              B2B
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium truncate">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Col 4-6: Customer Name & Items Summary */}
                    <div className="md:col-span-3 text-xs min-w-0">
                      <div className="font-extrabold text-neutral-900 truncate">
                        {order.customer.name || order.customer.email}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 truncate">
                        <span>{totalItemsCount} {totalItemsCount === 1 ? "pack" : "packs"}</span>
                        <span>•</span>
                        <span>{order.items.length} {order.items.length === 1 ? "SKU" : "SKUs"}</span>
                      </div>
                    </div>

                    {/* Col 7-8: Amount & Payment Tag */}
                    <div className="md:col-span-2 text-xs min-w-0">
                      <div className="text-xs lg:text-sm font-black text-neutral-900">
                        ₹{order.grandTotal.toFixed(0)}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 truncate">
                          {order.paymentReference
                            ? "Prepaid"
                            : order.paymentStatus === "paid"
                            ? "Prepaid"
                            : "COD"}
                        </span>
                      </div>
                    </div>

                    {/* Col 9-10: Status Badge Only (Clean, No AWB here!) */}
                    <div className="md:col-span-2 flex items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span>{order.status}</span>
                      </span>
                    </div>

                    {/* Col 11-12: Quick Actions (Label, Invoice) & Dropdown Arrow */}
                    <div
                      className="md:col-span-2 flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {/* 4x6 Shipping Label */}
                        <Link
                          href={`/api/shipping-label/${order.orderNumber}`}
                          target="_blank"
                          title="Print 4x6 Barcode Shipping Label"
                          className="px-2 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-amber-50 hover:border-amber-400 text-neutral-800 text-[11px] font-bold transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>🏷️</span>
                          <span className="hidden xl:inline">Label</span>
                        </Link>

                        {/* GST Tax Invoice */}
                        <Link
                          href={`/api/invoice/${order.orderNumber}`}
                          target="_blank"
                          title="Print Official GST Tax Invoice"
                          className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>🧾</span>
                          <span className="hidden xl:inline">Invoice</span>
                        </Link>
                      </div>

                      {/* Dropdown Chevron Button */}
                      <button
                        type="button"
                        onClick={() => toggleOrder(order.id)}
                        className="w-7 h-7 rounded-lg hover:bg-neutral-200/60 flex items-center justify-center text-neutral-500 transition-transform cursor-pointer ml-0.5"
                        title={isExpanded ? "Hide Details" : "View Full Details"}
                      >
                        <span
                          className={`material-symbols-outlined text-[19px] transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-[#D84315]" : "rotate-0"
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Expanded Accordion Drawer (Dropdown Content) ──────────── */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#FAF6EE]/40 border-t border-neutral-200/80 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
                      {/* Left 7 Cols: Ordered Products Breakdown */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-amber-800 text-[16px]">
                              inventory_2
                            </span>
                            <span>
                              Package Contents ({order.items.length} unique SKUs, {totalItemsCount} packs)
                            </span>
                          </h4>
                          <span className="text-[11px] font-bold text-neutral-500">
                            Subtotal: ₹{order.subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#FAF6EE] shrink-0 border border-neutral-200">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.productName}
                                      fill
                                      className="object-cover"
                                      sizes="44px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">
                                      MG
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-neutral-900 truncate">
                                    {item.productName}
                                  </p>
                                  <p className="text-[11px] text-neutral-500">
                                    Pack: <strong className="text-neutral-700">{item.variantName}</strong> • Qty:{" "}
                                    <strong className="text-neutral-900">{item.quantity}</strong> × ₹
                                    {item.unitPrice.toFixed(0)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-neutral-900 ml-2">
                                ₹{item.lineTotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Small Financial Breakdown */}
                        <div className="p-3 rounded-xl bg-white border border-neutral-200/70 text-[11px] space-y-1.5 text-neutral-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                          </div>
                          {order.discountTotal > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold">
                              <span>Discounts Applied</span>
                              <span>-₹{order.discountTotal.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{order.shippingTotal === 0 ? "FREE" : `₹${order.shippingTotal.toFixed(2)}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST (5%)</span>
                            <span>₹{order.taxTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-1.5 border-t border-neutral-200 font-extrabold text-xs text-neutral-900">
                            <span>Grand Total</span>
                            <span className="text-[#D84315]">₹{order.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right 5 Cols: Destination & Logistics Card */}
                      <div className="md:col-span-5 space-y-3">
                        {/* Delivery Address Card */}
                        <div className="p-3.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs space-y-1.5">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-[#D84315]">
                              location_on
                            </span>
                            <span>Shipping Address</span>
                          </h4>
                          <p className="text-xs font-extrabold text-neutral-900">
                            {order.customer.name || "Customer"}
                          </p>
                          {order.shippingAddress ? (
                            <div className="text-xs text-neutral-600 leading-relaxed">
                              <p>{order.shippingAddress.line1}</p>
                              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                              <p>
                                <strong>{order.shippingAddress.city}</strong>,{" "}
                                {order.shippingAddress.state} —{" "}
                                <strong className="font-mono">{order.shippingAddress.pincode}</strong>
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 italic">No delivery address provided.</p>
                          )}
                          <div className="pt-1 text-[11px] text-neutral-500 border-t border-neutral-100 flex flex-wrap gap-x-3">
                            {order.customer.phone && <span>📞 {order.customer.phone}</span>}
                            <span>✉️ {order.customer.email}</span>
                          </div>
                        </div>

                        {/* B2B GST Card (if applicable) */}
                        {order.isB2b && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                                B2B TAX INVOICE
                              </span>
                              <span className="font-bold text-[11px]">{order.companyName}</span>
                            </div>
                            <p className="text-[11px] font-mono font-bold text-emerald-800">
                              GSTIN: {order.gstin || "N/A"}
                            </p>
                          </div>
                        )}

                        {/* Logistics & Live AWB Tracking */}
                        <div className="p-3.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs space-y-2">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-blue-600">
                              local_shipping
                            </span>
                            <span>Courier &amp; Tracking</span>
                          </h4>

                          {order.trackingNumber ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800">
                                  {order.courierPartner || "Delhivery Express"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(order.trackingNumber!)}
                                  className="text-[10px] text-[#D84315] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span>{copiedAwb === order.trackingNumber ? "✓ Copied" : "Copy AWB"}</span>
                                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                                </button>
                              </div>

                              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-amber-900/10 font-mono text-xs font-extrabold text-neutral-900 flex justify-between items-center">
                                <span>{order.trackingNumber}</span>
                                <span className="text-[10px] text-emerald-700 font-sans font-bold">
                                  Active In-Transit
                                </span>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <a
                                  href={
                                    order.trackingUrl ||
                                    getCarrierTrackingUrl(
                                      order.courierPartner || "Delhivery",
                                      order.trackingNumber
                                    )
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-3 rounded-lg border border-neutral-300 hover:border-neutral-800 bg-white text-neutral-900 text-[11px] font-bold text-center transition-all"
                                >
                                  Carrier Site ↗
                                </a>
                                <Link
                                  href={`/track?order=${order.orderNumber}`}
                                  target="_blank"
                                  className="flex-1 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold text-center transition-all shadow-2xs"
                                >
                                  Live /track ↗
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1.5">
                              <p className="font-semibold">
                                Parcel not yet dispatched with courier.
                              </p>
                              <Link
                                href={`/admin/orders/${order.orderNumber}`}
                                className="inline-block text-[11px] font-extrabold text-[#D84315] hover:underline"
                              >
                                🚀 Open Fulfillment Station to Dispatch →
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Direct Order Manage Link */}
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-[#D84315] text-white text-xs font-extrabold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span>Manage Full Order &amp; Logistics</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
