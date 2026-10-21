/**
 * Remembers the student's package code and WhatsApp number in this browser,
 * only to prefill the "already have a package?" form. The server never trusts
 * it: every package booking is checked against the database. If the browser
 * forgets it, the student just types the code again.
 */
const KEY = "azubix:private-package";

export interface SavedPackage {
  packageCode: string;
  whatsappNumber: string;
}

export function loadSavedPackage(): SavedPackage | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SavedPackage>;
    if (typeof value.packageCode !== "string" || typeof value.whatsappNumber !== "string") {
      return null;
    }
    return { packageCode: value.packageCode, whatsappNumber: value.whatsappNumber };
  } catch {
    return null;
  }
}

export function savePackage(value: SavedPackage): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode etc.): the student can type the code.
  }
}
