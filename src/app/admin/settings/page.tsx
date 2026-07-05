"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/admin/file-upload";

const emptyForm = {
  address: "",
  mapEmbedUrl: "",
  officePhoto1: "",
  officePhoto2: "",
  whatsappNumber: "",
  whatsappGroupUrl: "",
  wechatQrUrl: "",
  email: "",
  youtubeUrl: "",
  tiktokUrl: "",
  instagramUrl: "",
  facebookUrl: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setForm({ ...emptyForm, ...data });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  const inputClass =
    "mt-1.5 w-full bg-field border border-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition";
  const labelClass = "text-xs font-semibold text-white/70";

  if (loading) return <p className="text-white/40 text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Site settings</h1>
      <p className="text-white/50 text-sm mb-8">
        Contact info, social links, and photos shown in the site footer.
      </p>

      <div className="bg-panel border border-line rounded-xl p-5 sm:p-6 space-y-6">
        <div>
          <p className="text-white text-sm font-semibold mb-3">Location</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Building 6, No. 6285 Hutai Road, Baoshan District, Shanghai, China"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Google Maps embed URL</label>
              <input
                name="mapEmbedUrl"
                value={form.mapEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?..."
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FileUpload
                label="Office photo 1"
                accept="image/*"
                onUploaded={(url) => setForm({ ...form, officePhoto1: url })}
              />
              <FileUpload
                label="Office photo 2"
                accept="image/*"
                onUploaded={(url) => setForm({ ...form, officePhoto2: url })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <p className="text-white text-sm font-semibold mb-3">Contact</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="clarazhu789@gmail.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp number</label>
              <input
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="+86 153 1701 5639"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp community group link</label>
              <input
                name="whatsappGroupUrl"
                value={form.whatsappGroupUrl}
                onChange={handleChange}
                placeholder="https://chat.whatsapp.com/..."
                className={inputClass}
              />
            </div>
            <FileUpload
              label="WeChat QR code image"
              accept="image/*"
              onUploaded={(url) => setForm({ ...form, wechatQrUrl: url })}
            />
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <p className="text-white text-sm font-semibold mb-3">Social media</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>YouTube channel URL</label>
              <input
                name="youtubeUrl"
                value={form.youtubeUrl}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>TikTok URL</label>
              <input
                name="tiktokUrl"
                value={form.tiktokUrl}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input
                name="instagramUrl"
                value={form.instagramUrl}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input
                name="facebookUrl"
                value={form.facebookUrl}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save settings"}
        </button>
      </div>
    </div>
  );
}