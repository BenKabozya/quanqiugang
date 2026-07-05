"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Shipment = {
  id: string;
  trackingCode: string;
  status: string;
  origin: string | null;
  destination: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const steps = [
  "processing",
  "purchased",
  "shipped",
  "in_transit",
  "arrived",
  "delivered",
];

const stepLabels: Record<string, string> = {
  processing: "Processing",
  purchased: "Purchased",
  shipped: "Shipped",
  in_transit: "In transit",
  arrived: "Arrived",
  delivered: "Delivered",
};

export default function MyShipmentsPage() {
  const { data: session, status } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        setShipments(data);
        setLoading(false);
      });
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4">
        <div className="bg-panel border border-line rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-white text-xl font-bold mb-2">Sign in required</h1>
          <Link
            href="/login"
            className="inline-block mt-4 bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-white/40 text-xs hover:text-white transition mb-2 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold text-white mb-8">My shipments</h1>

        {shipments.length === 0 ? (
          <div className="bg-panel border border-line rounded-2xl p-10 text-center">
            <p className="text-white/40 text-sm">
              No shipments yet. Once our team creates one for you, it'll
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {shipments.map((s) => {
              const currentIndex = steps.indexOf(s.status);
              return (
                <div
                  key={s.id}
                  className="bg-panel border border-line rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-mono font-semibold">
                      {s.trackingCode}
                    </p>
                  </div>
                  {(s.origin || s.destination) && (
                    <p className="text-white/40 text-xs mb-5">
                      {s.origin || "?"} → {s.destination || "?"}
                    </p>
                  )}

                  {/* Progress tracker */}
                  <div className="flex items-center mb-5">
                    {steps.map((step, i) => (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                              i <= currentIndex
                                ? "bg-gradient-to-r from-teal to-lime"
                                : "bg-field border border-line"
                            }`}
                          />
                          <p
                            className={`text-[9px] mt-1.5 text-center hidden sm:block ${
                              i <= currentIndex ? "text-white/70" : "text-white/25"
                            }`}
                          >
                            {stepLabels[step]}
                          </p>
                        </div>
                        {i < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-1 ${
                              i < currentIndex ? "bg-teal" : "bg-line"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-teal text-sm font-semibold sm:hidden mb-2">
                    Status: {stepLabels[s.status]}
                  </p>

                  {s.notes && (
                    <p className="text-white/60 text-sm leading-relaxed border-t border-line pt-4">
                      {s.notes}
                    </p>
                  )}

                  <p className="text-white/30 text-xs mt-3">
                    Last updated{" "}
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}