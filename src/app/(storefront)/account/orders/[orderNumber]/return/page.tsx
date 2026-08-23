import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { submitReturnAction } from "./actions";

const REASONS = [
  "Item damaged or defective",
  "Wrong item received",
  "Item not as described",
  "No longer needed",
  "Other",
];

export default async function ReturnRequestPage({
  params,
  searchParams,
}: PageProps<"/account/orders/[orderNumber]/return">) {
  const { orderNumber } = await params;
  const search = await searchParams;
  const itemId = typeof search.item === "string" ? Number(search.item) : undefined;

  const session = await auth();
  const customerId = Number(session!.user.id);

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
    include: { items: true },
  });
  if (!order) notFound();

  const targetItem = order.items.find((i) => i.id === itemId) ?? order.items[0];
  if (!targetItem) notFound();

  return (
    <div className="py-lg max-w-xl">
      <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">Request a Return</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
        Order #{order.orderNumber} — {targetItem.productName} ({targetItem.variantName})
      </p>

      <form
        action={submitReturnAction}
        className="bg-surface-container-lowest rounded-xl p-xl shadow-warm-1 border border-outline-variant/30 flex flex-col gap-lg"
      >
        <input type="hidden" name="orderId" value={order.id} />
        <input type="hidden" name="orderItemId" value={targetItem.id} />
        <input type="hidden" name="orderNumber" value={order.orderNumber} />

        <label className="block">
          <span className="font-label-sm text-label-sm text-on-surface mb-xs block">
            Reason for Return
          </span>
          <select
            name="reasonCategory"
            defaultValue=""
            required
            className="w-full bg-[#F9F7F0] border border-outline-variant rounded-lg p-sm font-body-md text-body-md"
          >
            <option disabled value="">
              Select a reason
            </option>
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-label-sm text-label-sm text-on-surface mb-xs block">
            Additional Details
          </span>
          <textarea
            name="reason"
            rows={4}
            required
            placeholder="Tell us more about the issue..."
            className="w-full bg-[#F9F7F0] border border-outline-variant rounded-lg p-sm font-body-md text-body-md"
          />
        </label>

        <button
          type="submit"
          className="px-gutter py-sm rounded-lg font-label-md text-label-md bg-[#D84315] text-white hover:opacity-90 transition-opacity self-start"
        >
          Submit Return Request
        </button>
      </form>
    </div>
  );
}
