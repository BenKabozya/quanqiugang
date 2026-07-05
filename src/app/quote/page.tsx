"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/admin/file-upload";
import BackButton from "@/components/shared/back-button";

export default function QuotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
  productName: "",
  quantity: "",
  budget: "",
  details: "",
  attachmentUrl: "",
});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setSubmitted(true);
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-sm font-semibold text-white";

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session || (session.user as any).role !== "user") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4">
        <div className="bg-panel border border-line rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-white text-xl font-bold mb-2">
            Sign in required
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Create an account or sign in to request a quotation.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg px-4 py-16">
      <div className="max-w-xl mx-auto">
       <BackButton
  fallbackHref={
    typeof window !== "undefined" && window.location.search.includes("from=chat")
      ? "/chat"
      : "/"
  }
  label={
    typeof window !== "undefined" && window.location.search.includes("from=chat")
      ? "← Back to chat"
      : "← Back to home"
  }
/>

        <div className="bg-panel border border-line rounded-2xl p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-teal text-2xl">✓</span>
              </div>
              <h1 className="text-white text-xl font-bold mb-2">
                Quotation request sent
              </h1>
              <p className="text-white/50 text-sm mb-6">
                Our team will review your request and respond soon. You can
                track its status from your quotations page.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/my-quotations"
                  className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg"
                >
                  View my quotations
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
setForm({
  productName: "",
  quantity: "",
  budget: "",
  details: "",
  attachmentUrl: "",
});
                  }}
                  className="border border-line text-white/60 text-sm px-5 py-2.5 rounded-lg hover:text-white transition"
                >
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Request a quotation
              </h1>
              <p className="text-white/50 text-sm mb-7 leading-relaxed">
                Tell us what you're looking for and our sourcing team will
                get back to you with pricing and options.
              </p>

              {error && (
                <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Product or service name</label>
                  <input
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Stainless steel water bottles"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 500 units"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Budget (optional)</label>
                    <input
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="e.g. $2,000 - $3,000"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
  <label className={labelClass}>Details</label>
  <textarea
    name="details"
    value={form.details}
    onChange={handleChange}
    required
    rows={5}
    placeholder="Describe specifications, materials, target price, delivery timeline, or any other requirements..."
    className={inputClass}
  />
</div>

<FileUpload
  label="Attach a photo, video, or reference file (optional)"
  accept="image/*,video/*,application/pdf"
  onUploaded={(url) => setForm({ ...form, attachmentUrl: url })}
/>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal to-lime text-slate-bg font-bold rounded-lg py-3.5 text-sm hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send quotation request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}