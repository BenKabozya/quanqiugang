"use client";

import { useEffect, useState } from "react";

type Quotation = {
  id: string;
  productName: string;
  quantity: string;
  budget: string | null;
  details: string;
  attachmentUrl: string | null;
  status: string;
  createdAt: string;
  user: { name: string; email: string; country: string };
  respondedBy: { name: string } | null;
};

const statusStyles: Record<string, string> = {
  new: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  responded: "bg-teal/10 text-teal border-teal/30",
  closed: "bg-white/5 text-white/40 border-line",
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadQuotations() {
    const res = await fetch("/api/quotations");
    const data = await res.json();
    setQuotations(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuotations();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadQuotations();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Quotations</h1>
      <p className="text-white/50 text-sm mb-8">
        Requests submitted by users through the quote form or chat.
      </p>

      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : quotations.length === 0 ? (
        <p className="text-white/40 text-sm">No quotation requests yet.</p>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div
              key={q.id}
              className="bg-panel border border-line rounded-2xl p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-white font-semibold">
                    {q.productName}
                  </h2>
                  <p className="text-white/40 text-xs mt-1">
                    {q.user.name} · {q.user.email} · {q.user.country}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
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

              <p className="text-white/60 text-sm leading-relaxed mb-3">
                {q.details}
              </p>

              {q.attachmentUrl && (
                
                  <a href={q.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal text-xs inline-block hover:underline mb-3"
                >
                  📎 View attachment
                </a>
              )}

              <div className="flex gap-2 mt-2">
                {q.status !== "responded" && (
                  <button
                    onClick={() => updateStatus(q.id, "responded")}
                    className="text-teal text-xs font-medium border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/10 transition"
                  >
                    Mark responded
                  </button>
                )}
                {q.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(q.id, "closed")}
                    className="text-white/50 text-xs font-medium border border-line rounded-lg px-3 py-1.5 hover:text-white transition"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}