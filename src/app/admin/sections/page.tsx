"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/admin/file-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";

type Section = {
  key: string;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

const SECTION_KEYS = [
  { key: "sourcing", label: "Sourcing" },
  { key: "purchasing", label: "Purchasing" },
  { key: "about", label: "About" },
];

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [activeKey, setActiveKey] = useState("sourcing");
  const [form, setForm] = useState({ title: "", body: "", imageUrl: "", videoUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/sections");
    const data: Section[] = await res.json();
    const map: Record<string, Section> = {};
    data.forEach((s) => (map[s.key] = s));
    setSections(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const s = sections[activeKey];
    setForm({
      title: s?.title || "",
      body: s?.body || "",
      imageUrl: s?.imageUrl || "",
      videoUrl: s?.videoUrl || "",
    });
  }, [activeKey, sections]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: activeKey, ...form }),
    });
    setSaving(false);
    load();
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-xs font-semibold text-white/70";

  if (loading) return <p className="text-white/40 text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Page sections</h1>
      <p className="text-white/50 text-sm mb-8">
        Edit the Sourcing, Purchasing, and About content shown on the homepage.
      </p>

      <div className="flex gap-2 mb-6">
        {SECTION_KEYS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
              activeKey === s.key
                ? "bg-gradient-to-r from-teal to-lime text-slate-bg"
                : "bg-field border border-line text-white/60 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-xl p-5 sm:p-6 space-y-4">
        <div>
          <label className={labelClass}>Section title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <div className="mt-1.5">
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm({ ...form, body: html })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>
    </div>
  );
}