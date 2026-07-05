"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn(mode === "user" ? "user-login" : "admin-login", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(mode === "admin" ? "/admin" : "/");
  }

  const inputClass =
    "mt-2 w-full bg-field border border-line rounded-lg px-4 py-3 text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";

  const labelClass = "text-sm font-semibold text-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-field border border-line flex items-center justify-center mb-3">
            <span className="text-teal font-bold text-lg">QG</span>
          </div>
          <p className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase">
            Quanqiugang International
          </p>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-8 sm:p-10">
          {/* Mode toggle */}
          <div className="flex bg-field border border-line rounded-lg p-1 mb-7">
            <button
              type="button"
              onClick={() => setMode("user")}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition ${
                mode === "user"
                  ? "bg-gradient-to-r from-teal to-lime text-slate-bg"
                  : "text-white/50"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setMode("admin")}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition ${
                mode === "admin"
                  ? "bg-gradient-to-r from-teal to-lime text-slate-bg"
                  : "text-white/50"
              }`}
            >
              Admin
            </button>
          </div>

          <h1 className="text-[28px] font-bold text-white mb-2">
            {mode === "admin" ? "Admin sign in" : "Welcome back"}
          </h1>
          <p className="text-white/50 text-sm mb-7 leading-relaxed">
            {mode === "admin"
              ? "Sign in to manage the platform."
              : "Sign in to continue sourcing and tracking your shipments."}
          </p>

          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal to-lime text-slate-bg font-bold rounded-lg py-3.5 text-[15px] hover:opacity-90 transition disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {mode === "user" && (
            <p className="text-center text-sm text-white/50 mt-7">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-lime font-semibold hover:underline">
                Create one
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}