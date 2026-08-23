import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const CART_COOKIE = "cart_session";

/** Read-only guest token lookup — safe to call during page render (Server
 * Components can't set cookies, only read them). Returns undefined if the
 * visitor has no cart cookie yet (i.e. an empty cart). */
async function readGuestToken() {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value;
}

/** Creates the guest token cookie if missing. Only callable from a Server
 * Action or Route Handler, per Next.js's cookie-write restriction. */
async function getOrCreateGuestToken() {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  jar.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return token;
}

/** Read-only cart lookup for rendering (header badge, cart page). Never
 * creates a cart or writes cookies — an unknown guest simply has no cart. */
async function findCart() {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  if (customerId) {
    return prisma.cart.findFirst({ where: { customerId, status: "active" } });
  }

  const sessionToken = await readGuestToken();
  if (!sessionToken) return null;
  return prisma.cart.findFirst({ where: { sessionToken, status: "active" } });
}

/** Finds (or creates) the active cart for the current visitor — logged-in
 * customer or anonymous guest (tracked via an httpOnly cookie). Only call
 * from a Server Action or Route Handler (it may write the guest cookie). */
export async function getOrCreateCart() {
  const session = await auth();
  const customerId = session?.user?.id ? Number(session.user.id) : null;

  if (customerId) {
    let cart = await prisma.cart.findFirst({
      where: { customerId, status: "active" },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId, status: "active" } });
    }
    return cart;
  }

  const sessionToken = await getOrCreateGuestToken();
  let cart = await prisma.cart.findFirst({ where: { sessionToken, status: "active" } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { sessionToken, status: "active" } });
  }
  return cart;
}

/** Safe to call during render — returns an empty cart shape if the visitor
 * has no cart yet, without writing any cookie. */
export async function getCartWithItems() {
  const cart = await findCart();

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart?.id ?? -1 },
    include: {
      variant: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { id: cart?.id ?? null, items };
}

export async function getCartItemCount() {
  const cart = await findCart();
  if (!cart) return 0;
  const result = await prisma.cartItem.aggregate({
    where: { cartId: cart.id },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

/** Called right after a successful customer sign-in to fold any guest cart
 * built up pre-login into that customer's persistent cart. */
export async function mergeGuestCartIntoCustomer(customerId: number) {
  const jar = await cookies();
  const guestToken = jar.get(CART_COOKIE)?.value;
  if (!guestToken) return;

  const guestCart = await prisma.cart.findFirst({
    where: { sessionToken: guestToken, status: "active" },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) return;

  let customerCart = await prisma.cart.findFirst({ where: { customerId, status: "active" } });
  if (!customerCart) {
    customerCart = await prisma.cart.create({ data: { customerId, status: "active" } });
  }

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: customerCart.id, variantId: item.variantId } },
      update: { quantity: { increment: item.quantity } },
      create: {
        cartId: customerCart.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
      },
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
  await prisma.cart.update({ where: { id: guestCart.id }, data: { status: "converted" } });
}
