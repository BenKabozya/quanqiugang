"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/admin/file-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";

type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaCaption: string | null;
  createdAt: string;
  admin: { name: string };
  _count: { comments: number };
};

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  mediaCaption: "",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      imageUrl: s.imageUrl || "",
      videoUrl: s.videoUrl || "",
      mediaCaption: s.mediaCaption || "",
    });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    cancelForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-xs font-semibold text-white/70";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Services</h1>
          <p className="text-white/50 text-sm">
            Manage the services shown on the homepage.
          </p>
        </div>
        <button
          onClick={showForm ? cancelForm : startNew}
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition shrink-0"
        >
          {showForm ? "Cancel" : "+ New service"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-line rounded-xl p-5 sm:p-6 mb-8 space-y-4"
        >
          <p className="text-white font-semibold text-sm mb-1">
            {editingId ? "Edit service" : "New service"}
          </p>

          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <div className="mt-1.5">
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUpload
              label="Photo (optional)"
              accept="image/*"
              onUploaded={(url) => setForm({ ...form, imageUrl: url })}
            />
            <FileUpload
              label="Video (optional)"
              accept="video/*"
              onUploaded={(url) => setForm({ ...form, videoUrl: url })}
            />
          </div>

          <div>
            <label className={labelClass}>Media caption (optional)</label>
            <input
              name="mediaCaption"
              value={form.mediaCaption}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Post service"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-white/40 text-sm">No services posted yet.</p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{s.title}</p>
                <p className="text-white/40 text-xs mt-1">
                  by {s.admin.name} · {s._count.comments} comments
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(s)}
                  className="text-white/60 text-xs font-medium border border-line rounded-lg px-3 py-1.5 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 text-xs font-medium border border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-950/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}