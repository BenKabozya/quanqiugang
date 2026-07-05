"use client";

import { useEffect, useState } from "react";

type ShipmentUser = { name: string; email: string; country: string };

type Shipment = {
  id: string;
  trackingCode: string;
  status: string;
  origin: string | null;
  destination: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: ShipmentUser;
  updatedBy: { name: string } | null;
};

type UserOption = { id: string; name: string; email: string };

const statuses = [
  "processing",
  "purchased",
  "shipped",
  "in_transit",
  "arrived",
  "delivered",
];

const statusLabels: Record<string, string> = {
  processing: "Processing",
  purchased: "Purchased",
  shipped: "Shipped",
  in_transit: "In transit",
  arrived: "Arrived",
  delivered: "Delivered",
};

const statusColors: Record<string, string> = {
  processing: "bg-white/5 text-white/50 border-line",
  purchased: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  in_transit: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  arrived: "bg-teal/10 text-teal border-teal/30",
  delivered: "bg-lime/10 text-lime border-lime/30",
};

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    trackingCode: "",
    origin: "",
    destination: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadShipments() {
    const res = await fetch("/api/shipments");
    const data = await res.json();
    setShipments(data);
    setLoading(false);
  }

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadShipments();
    loadUsers();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setShowForm(false);
    setForm({
      userId: "",
      trackingCode: "",
      origin: "",
      destination: "",
      notes: "",
    });
    loadShipments();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/shipments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadShipments();
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-xs font-semibold text-white/70";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Shipments</h1>
          <p className="text-white/50 text-sm">
            Create tracking codes and update shipment status for users.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition shrink-0"
        >
          {showForm ? "Cancel" : "+ New shipment"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-line rounded-xl p-5 sm:p-6 mb-8 space-y-4"
        >
          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>User</label>
            <select
              name="userId"
              value={form.userId}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tracking code</label>
            <input
              name="trackingCode"
              value={form.trackingCode}
              onChange={handleChange}
              required
              placeholder="e.g. QG-2026-00123"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Origin</label>
              <input
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="Shanghai, China"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Destination</label>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="Lagos, Nigeria"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create shipment"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : shipments.length === 0 ? (
        <p className="text-white/40 text-sm">No shipments yet.</p>
      ) : (
        <div className="space-y-4">
          {shipments.map((s) => (
            <div
              key={s.id}
              className="bg-panel border border-line rounded-2xl p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-semibold font-mono">
                    {s.trackingCode}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {s.user.name} · {s.user.email} · {s.user.country}
                  </p>
                  {(s.origin || s.destination) && (
                    <p className="text-white/40 text-xs mt-0.5">
                      {s.origin || "?"} → {s.destination || "?"}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                    statusColors[s.status]
                  }`}
                >
                  {statusLabels[s.status]}
                </span>
              </div>

              {s.notes && (
                <p className="text-white/60 text-sm leading-relaxed mb-3">
                  {s.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatus(s.id, st)}
                    disabled={s.status === st}
                    className={`text-xs font-medium border rounded-lg px-3 py-1.5 transition ${
                      s.status === st
                        ? "bg-teal/20 border-teal/40 text-teal cursor-default"
                        : "border-line text-white/50 hover:text-white"
                    }`}
                  >
                    {statusLabels[st]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}