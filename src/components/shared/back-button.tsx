"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallbackHref = "/",
  label = "← Back",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-white/40 text-xs hover:text-white transition mb-2 inline-block"
    >
      {label}
    </button>
  );
}