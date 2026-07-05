"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { Video } from "@/lib/tiptap-video-extension";
import { useState } from "react";

const StyledImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: "max-width:100%;" },
    };
  },
});

const SIZES: Record<string, string> = {
  small: "30%",
  medium: "50%",
  large: "75%",
  full: "100%",
};

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [size, setSize] = useState("medium");
  const [layout, setLayout] = useState("center");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      StyledImage,
      Youtube.configure({ width: 480, height: 270, nocookie: true }),
      Video,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[200px] px-3.5 py-2.5 focus:outline-none text-white text-sm",
      },
    },
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
      active
        ? "bg-teal text-slate-bg"
        : "text-white/50 hover:text-white hover:bg-field"
    }`;

  function buildStyle() {
    const width = SIZES[size];
    if (layout === "left") {
      return `float:left; width:${width}; margin:4px 16px 12px 0; border-radius:8px;`;
    }
    if (layout === "right") {
      return `float:right; width:${width}; margin:4px 0 12px 16px; border-radius:8px;`;
    }
    return `display:block; width:${width}; margin:16px auto; border-radius:8px; clear:both;`;
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: data.url, style: buildStyle() },
        })
        .run();
    }
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  }

  async function uploadVideo(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "video",
          attrs: { src: data.url, style: buildStyle() },
        })
        .run();
    }
  }

  function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadVideo(file);
    e.target.value = "";
  }

  function insertYoutube() {
    if (!youtubeUrl.trim() || !editor) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  }

  return (
    <div className="bg-field border border-line rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-line p-2 items-center">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
          • List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>
          Heading
        </button>

        <span className="w-px h-5 bg-line mx-1" />

        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="bg-panel border border-line rounded-md text-xs text-white px-2 py-1.5"
        >
          <option value="small">Small (30%)</option>
          <option value="medium">Medium (50%)</option>
          <option value="large">Large (75%)</option>
          <option value="full">Full width</option>
        </select>

        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          className="bg-panel border border-line rounded-md text-xs text-white px-2 py-1.5"
        >
          <option value="left">Layout: Left (text wraps)</option>
          <option value="center">Layout: Center</option>
          <option value="right">Layout: Right (text wraps)</option>
        </select>

        <label className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-white/50 hover:text-white hover:bg-field cursor-pointer transition">
          + Image
          <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
        </label>

        <label className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-white/50 hover:text-white hover:bg-field cursor-pointer transition">
          + Video
          <input type="file" accept="video/*" onChange={handleVideoPick} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => setShowYoutubeInput(!showYoutubeInput)}
          className={btnClass(showYoutubeInput)}
        >
          ▶ YouTube
        </button>

        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>
          Undo
        </button>
      </div>

      {showYoutubeInput && (
        <div className="flex gap-2 p-2 border-b border-line bg-panel">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste a YouTube link..."
            className="flex-1 bg-field border border-line rounded-md px-3 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={insertYoutube}
            className="bg-teal text-slate-bg text-xs font-semibold px-3 py-1.5 rounded-md"
          >
            Insert
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}