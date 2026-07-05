"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/components/shared/back-button";

type Quotation = {
  id: string;
  productName: string;
  quantity: string;
  budget: string | null;
  details: string;
  attachmentUrl: string | null;
  status: string;
  createdAt: string;
  respondedBy: { name: string } | null;
};

const statusStyles: Record<string, string> = {
  new: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  responded: "bg-teal/10 text-teal border-teal/30",
  closed: "bg-white/5 text-white/40 border-line",
};

export default function MyQuotationsPage() {
  const { data: session, status } = useSession();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/quotations")
      .then((res) => res.json())
      .then((data) => {
        setQuotations(data);
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
          <h1 className="text-white text-xl font-bold mb-2">
            Sign in required
          </h1>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-white/40 text-xs hover:text-white transition">
  ← Back to home
</Link>
            <h1 className="text-2xl font-bold text-white">My quotations</h1>
          </div>
          <Link
            href="/quote"
            className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-4 py-2.5 rounded-lg"
          >
            + New request
          </Link>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-panel border border-line rounded-2xl p-10 text-center">
            <p className="text-white/40 text-sm">
              You haven't requested any quotations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="bg-panel border border-line rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-white font-semibold">
                      {q.productName}
                    </h2>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(q.createdAt).toLocaleDateString()} · Qty:{" "}
                      {q.quantity}
                      {q.budget ? ` · Budget: ${q.budget}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                      statusStyles[q.status] || statusStyles.new
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  {q.details}
                </p>
                {q.respondedBy && (
                  <p className="text-teal text-xs mt-3">
                    Responded by {q.respondedBy.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}