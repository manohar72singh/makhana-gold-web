const PHONE_EMAIL_DOMAIN = "phone.makhanagold.com";

/** Synthetic placeholder email assigned to a customer who signed up via
 * phone OTP without providing a real email. */
export function makePhoneEmail(clean10DigitPhone: string): string {
  return `${clean10DigitPhone}@${PHONE_EMAIL_DOMAIN}`;
}

/** True if the given email is one of our auto-generated phone placeholders
 * rather than a real address the customer can receive mail at. */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${PHONE_EMAIL_DOMAIN}`);
}
