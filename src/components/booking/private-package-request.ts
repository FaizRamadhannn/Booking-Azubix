import type { ClassLevel } from "@/lib/booking/types";

/**
 * The landing page's private pricing cards live outside the booking flow's
 * React tree, so picking a package there is relayed to the flow as a DOM event.
 */
const EVENT = "azubix:select-private-package";

export function requestPrivatePackage(level: ClassLevel) {
  // The flow scrolls itself into view once it has switched to the package.
  window.dispatchEvent(new CustomEvent<ClassLevel>(EVENT, { detail: level }));
}

export function onPrivatePackageRequest(listener: (level: ClassLevel) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<ClassLevel>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
