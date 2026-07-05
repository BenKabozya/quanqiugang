"use client";

import { useState } from "react";

export default function FileUpload({
  label,
  accept,
  onUploaded,
}: {
  label: string;
  accept: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Upload failed.");
      return;
    }

    onUploaded(data.url);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-white/70">{label}</label>
      <div className="mt-1.5">
        <label className="flex items-center justify-center gap-2 border border-dashed border-line rounded-lg px-4 py-3 text-sm text-white/50 cursor-pointer hover:border-teal transition">
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          {uploading
            ? "Uploading..."
            : fileName
            ? fileName
            : "Click to choose a file"}
        </label>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}