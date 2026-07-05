"use client";

import { useEffect, useState } from "react";

type ChatUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  chatMessages: {
    content: string | null;
    createdAt: string;
    senderType: string;
  }[];
};

type AllUser = { id: string; name: string; email: string; country: string };

type Message = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileType: string | null;
  senderType: string;
  createdAt: string;
  admin: { name: string } | null;
};

export default function AdminInboxPage() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/chat/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function loadMessages(userId: string) {
    const res = await fetch(`/api/chat?userId=${userId}`);
    const data = await res.json();
    setMessages(data);
  }

  useEffect(() => {
  loadUsers();
  fetch("/api/users")
    .then((res) => res.json())
    .then(setAllUsers);
  const interval = setInterval(loadUsers, 5000);
  return () => clearInterval(interval);
}, []);

function startConversationWith(user: AllUser) {
  setSelectedUser({ ...user, chatMessages: [] });
  setShowUserPicker(false);
}

  useEffect(() => {
    if (!selectedUser) return;
    loadMessages(selectedUser.id);
    const interval = setInterval(() => loadMessages(selectedUser.id), 4000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  async function sendReply(fileUrl?: string, fileType?: string) {
  if ((!text.trim() && !fileUrl) || !selectedUser) return;
  setSending(true);

  await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: text || null,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      userId: selectedUser.id,
    }),
  });

  setText("");
  setSending(false);
  loadMessages(selectedUser.id);
  loadUsers();
}

async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file || !selectedUser) return;

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

  await sendReply(data.url, data.fileType);
}
  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex -m-4 sm:-m-6 lg:-m-8">
      {/* User list */}
      <div className={`w-full sm:w-72 shrink-0 border-r border-line overflow-y-auto ${selectedUser ? "hidden sm:block" : "block"}`}>
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h1 className="text-white font-bold">Inbox</h1>
          <button
            onClick={() => setShowUserPicker(!showUserPicker)}
            className="text-teal text-xs font-semibold hover:underline"
          >
            {showUserPicker ? "Cancel" : "+ New"}
          </button>
        </div>

        {showUserPicker && (
          <div className="border-b border-line max-h-64 overflow-y-auto">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => startConversationWith(u)}
                className="w-full text-left p-3 border-b border-line last:border-0 hover:bg-panel transition"
              >
                <p className="text-white text-sm">{u.name}</p>
                <p className="text-white/40 text-xs">{u.email} · {u.country}</p>
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <p className="text-white/40 text-sm p-4">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-white/40 text-sm p-4">No conversations yet.</p>
        ) : (
          users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full text-left p-4 border-b border-line hover:bg-panel transition ${
                selectedUser?.id === u.id ? "bg-panel" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium truncate">
                  {u.name}
                </p>
                <span className="text-white/30 text-[10px] shrink-0 ml-2">
                  {u.country}
                </span>
              </div>
              <p className="text-white/40 text-xs truncate mt-1">
                {u.chatMessages[0]?.senderType === "admin" ? "You: " : ""}
                {u.chatMessages[0]?.content || "No messages"}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Conversation */}
      <div className={`flex-1 flex-col ${selectedUser ? "flex" : "hidden sm:flex"}`}>
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">
              Select a conversation to view messages.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-line p-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden text-white/50 text-sm shrink-0"
              >
                ← 
              </button>
              <div>
                <p className="text-white font-semibold">{selectedUser.name}</p>
                <p className="text-white/40 text-xs">
                  {selectedUser.email} · {selectedUser.country}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const isAdmin = m.senderType === "admin";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] rounded-2xl px-4 py-2.5 ${
                        isAdmin
                          ? "bg-gradient-to-r from-teal to-lime text-slate-bg"
                          : "bg-field border border-line text-white"
                      }`}
                    >
                      {m.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {m.content}
                        </p>
                      )}
                      {m.fileUrl && m.fileType === "image" && (
                        <img
                          src={m.fileUrl}
                          alt="attachment"
                          className="rounded-lg mt-2 max-w-full"
                        />
                      )}
                      {m.fileUrl && m.fileType === "video" && (
                        <video
                          src={m.fileUrl}
                          controls
                          className="rounded-lg mt-2 max-w-full"
                        />
                      )}
                      <p
                        className={`text-[10px] mt-1.5 ${
                          isAdmin ? "text-slate-bg/60" : "text-white/30"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-line p-4 flex gap-2">
              <label className="shrink-0 flex items-center justify-center w-10 h-10 bg-field border border-line rounded-lg text-white/50 hover:text-white cursor-pointer transition">
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
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
                placeholder="Type a reply..."
                className="flex-1 bg-field border border-line rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition"
              />
              <button
                onClick={() => sendReply()}
                disabled={sending}
                className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}