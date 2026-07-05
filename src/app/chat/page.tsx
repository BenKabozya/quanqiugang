"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/components/shared/back-button";

type Message = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileType: string | null;
  senderType: string;
  createdAt: string;
  admin: { name: string } | null;
  user: { name: string } | null;
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  async function loadMessages() {
    const res = await fetch("/api/chat");
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [status]);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 100;
    isNearBottomRef.current = nearBottom;
    setShowJumpButton(!nearBottom);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJumpButton(false);
  }

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage(fileUrl?: string, fileType?: string) {
    if (!text.trim() && !fileUrl) return;
    setSending(true);

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text || null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
      }),
    });

    setText("");
    setSending(false);
    loadMessages();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    e.target.value = "";

    if (!res.ok) {
      setSending(false);
      alert(data.error || "Upload failed.");
      return;
    }

    await sendMessage(data.url, data.fileType);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4">
        <div className="bg-panel border border-line rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-white text-xl font-bold mb-2">Sign in required</h1>
          <Link
            href="/login"
            className="inline-block mt-4 bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg flex flex-col">
      <header className="border-b border-line bg-panel px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <BackButton />
          <h1 className="text-white font-semibold mt-1">Chat with our team</h1>
        </div>
        <Link
          href="/quote?from=chat"
          className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shrink-0"
        >
          Request quotation
        </Link>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl lg:max-w-4xl mx-auto w-full relative"
      >
        {messages.length === 0 ? (
          <p className="text-white/30 text-sm text-center mt-10">
            No messages yet. Say hello to start the conversation.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => {
              const isMe = m.senderType === "user";
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
  className={`max-w-[80%] sm:max-w-[65%] lg:max-w-[55%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-gradient-to-r from-teal to-lime text-slate-bg"
                        : "bg-panel border border-line text-white"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-teal text-xs font-semibold mb-1">
                        {m.admin?.name || "Team"}
                      </p>
                    )}
                    {m.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    )}
                    {m.fileUrl && m.fileType === "image" && (
                      <img src={m.fileUrl} alt="attachment" className="rounded-lg mt-2 max-w-full" />
                    )}
                    {m.fileUrl && m.fileType === "video" && (
                      <video src={m.fileUrl} controls className="rounded-lg mt-2 max-w-full" />
                    )}
                    {m.fileUrl && m.fileType === "audio" && (
                      <audio src={m.fileUrl} controls className="mt-2 w-full" />
                    )}
                    {m.fileUrl && m.fileType === "file" && (
  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className={isMe ? "text-xs mt-2 inline-block underline text-slate-bg" : "text-xs mt-2 inline-block underline text-teal"}>View file</a>
)}
                    <p className={`text-[10px] mt-1.5 ${isMe ? "text-slate-bg/60" : "text-white/30"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 sm:right-10 bg-gradient-to-r from-teal to-lime text-slate-bg rounded-full w-11 h-11 flex items-center justify-center shadow-lg text-lg z-20"
        >
          ↓
        </button>
      )}

      <div className="border-t border-line bg-panel px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl lg:max-w-4xl mx-auto flex gap-2">
          <label className="shrink-0 flex items-center justify-center w-11 h-11 bg-field border border-line rounded-lg text-white/50 hover:text-white cursor-pointer transition">
            <input
              type="file"
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            📎
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-field border border-line rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition"
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending}
            className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-3 rounded-lg disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}