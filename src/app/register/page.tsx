"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/login");
  }

  const inputClass =
    "mt-2 w-full bg-field border border-line rounded-lg px-4 py-3 text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";

  const labelClass = "text-sm font-semibold text-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4 py-16">
      <div className="w-full max-w-[460px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-field border border-line flex items-center justify-center mb-3">
            <span className="text-teal font-bold text-lg">QG</span>
          </div>
          <p className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase">
            Quanqiugang International
          </p>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-8 sm:p-10">
          <h1 className="text-[28px] font-bold text-white mb-2">
            Create account
          </h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Registration is required to chat with our team and request quotes.
          </p>

          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className={inputClass}
              />
              <p className="text-xs text-white/35 mt-1.5">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal to-lime text-slate-bg font-bold rounded-lg py-3.5 text-[15px] hover:opacity-90 transition disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-7">
            Already have an account?{" "}
            <a href="/login" className="text-lime font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}