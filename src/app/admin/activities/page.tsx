"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/admin/file-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";

type Activity = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaCaption: string | null;
  eventDate: string;
  admin: { name: string };
  _count: { comments: number };
};

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  mediaCaption: "",
  eventDate: "",
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadActivities() {
    setLoading(true);
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivities(data);
    setLoading(false);
  }

  useEffect(() => {
    loadActivities();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(a: Activity) {
    setEditingId(a.id);
    setForm({
  title: a.title,
  description: a.description,
  imageUrl: a.imageUrl || "",
  videoUrl: a.videoUrl || "",
  mediaCaption: a.mediaCaption || "",
  eventDate: a.eventDate.slice(0, 10),
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
      await fetch(`/api/activities/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    cancelForm();
    loadActivities();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this activity? This cannot be undone.")) return;
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    loadActivities();
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-xs font-semibold text-white/70";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Activities</h1>
          <p className="text-white/50 text-sm">
            Post updates about sourcing trips, shipments, and supplier
            visits.
          </p>
        </div>
        <button
          onClick={showForm ? cancelForm : startNew}
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition shrink-0"
        >
          {showForm ? "Cancel" : "+ New activity"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-line rounded-xl p-5 sm:p-6 mb-8 space-y-4"
        >
          <p className="text-white font-semibold text-sm mb-1">
            {editingId ? "Edit activity" : "New activity"}
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
    placeholder="e.g. Inspecting the new supplier's factory floor"
    className={inputClass}
  />
</div>

          {(form.imageUrl || form.videoUrl) && (
            <p className="text-white/40 text-xs">
              Current file: {form.imageUrl || form.videoUrl}
            </p>
          )}

          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Save changes"
              : "Post activity"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-white/40 text-sm">No activities posted yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div
              key={a.id}
              className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{a.title}</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(a.eventDate).toLocaleDateString()} · by{" "}
                  {a.admin.name} · {a._count.comments} comments
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(a)}
                  className="text-white/60 text-xs font-medium border border-line rounded-lg px-3 py-1.5 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
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
