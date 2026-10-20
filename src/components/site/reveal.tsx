"use client";

import * as React from "react";

/**
 * Fades its section in the first time it scrolls into view, like the Stitch
 * design's `.reveal` sections. The element is only hidden after hydration
 * (`data-reveal="pending"`), so the content is always visible without JS.
 */
export function Reveal({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Already on screen at load: leave it visible rather than flashing it out.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
}
