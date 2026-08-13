"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

export default function AdBanner() {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT || process.env.NODE_ENV !== "production") return;
    try {
      // @ts-expect-error AdSense global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may be blocked or unavailable; keep the app usable.
    }
  }, []);

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white p-3" aria-label="広告">
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
