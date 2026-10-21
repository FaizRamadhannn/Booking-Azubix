import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Formats whole rupiah, e.g. `Rp 50.000`. */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Chat link for a normalised WhatsApp number such as `6281234567890`. */
export function whatsappUrl(number: string): string {
  return `https://wa.me/${number}`;
}

/** `6281234567890` -> `+6281234567890`, for display. */
export function formatWhatsappNumber(number: string): string {
  return `+${number}`;
}
