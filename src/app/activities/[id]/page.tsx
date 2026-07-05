"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/components/shared/back-button";

type Comment = {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: { name: string };
};

type Activity = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaCaption: string | null;
  admin: { name: string };
  comments: Comment[];
};

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  async function load() {
    const res = await fetch(`/api/activities/${id}`);
    const data = await res.json();
    setActivity(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function submitComment() {
    if (!commentText.trim()) return;
    await fetch(`/api/activities/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    setCommentText("");
    load();
  }

  async function likeComment(commentId: string) {
    if (likedIds.includes(commentId)) return;
    setLikedIds([...likedIds, commentId]);
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg">
        <p className="text-white/40 text-sm">Activity not found.</p>
      </div>
    );
  }

  const visibleComments = showAllComments
    ? activity.comments
    : activity.comments.slice(0, 2);
  const hiddenCount = activity.comments.length - visibleComments.length;

  return (
    <div className="min-h-screen bg-slate-bg px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12">
      {/* This container now matches your homepage max width */}
      <div className="max-w-7xl xl:max-w-[1600px] mx-auto w-full">
        <BackButton />

        <div className="bg-panel border border-line rounded-2xl overflow-hidden mt-4 w-full">
          {activity.imageUrl && (
  <div className="w-full bg-white/5">
    <img
      src={activity.imageUrl}
      alt={activity.title}
      className="w-full h-auto block"
    />
  </div>
)}
          {activity.videoUrl && (
  <div className="w-full max-h-[75vh] bg-black flex items-center justify-center">
    <video
      src={activity.videoUrl}
      controls
      className="w-full h-auto max-h-[75vh] object-contain"
    />
  </div>
)}
          {activity.mediaCaption && (
            <p className="text-white/40 text-xs italic px-4 sm:px-5 pt-3">
              {activity.mediaCaption}
            </p>
          )}

          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
            <p className="text-white/40 text-xs mb-2">
              {new Date(activity.eventDate).toLocaleDateString()} · posted by{" "}
              {activity.admin.name}
            </p>
            <h1 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-4">
              {activity.title}
            </h1>
            <div
              className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none text-white/70 leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: activity.description }}
            />

            <div className="border-t border-line pt-6">
              <p className="text-white/70 text-sm font-semibold mb-4">
                Comments ({activity.comments.length})
              </p>

              <div className="space-y-4">
                {visibleComments.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                      <span className="text-teal font-medium text-sm">{c.user.name}</span>{" "}
                      <span className="text-white/60 text-sm break-words">{c.content}</span>
                    </div>
                    <button
                      onClick={() => likeComment(c.id)}
                      className={`shrink-0 text-xs flex items-center gap-1 ${
                        likedIds.includes(c.id) ? "text-teal" : "text-white/30 hover:text-white/60"
                      } transition`}
                    >
                      ▲ {c.likes}
                    </button>
                  </div>
                ))}
              </div>

              {hiddenCount > 0 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-teal text-xs font-medium mt-4 hover:underline"
                >
                  Show {hiddenCount} more comment{hiddenCount > 1 ? "s" : ""}
                </button>
              )}

              {session && (session.user as any).role === "user" ? (
                <div className="flex flex-col sm:flex-row gap-2 mt-5">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-field border border-line rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition w-full"
                  />
                  <button
                    onClick={submitComment}
                    className="bg-teal text-slate-bg text-sm font-semibold px-4 py-2 rounded-lg shrink-0 w-full sm:w-auto"
                  >
                    Post
                  </button>
                </div>
              ) : (
                <p className="text-white/30 text-xs mt-5">
                  <Link href="/login" className="text-teal hover:underline">
                    Sign in
                  </Link>{" "}
                  to comment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}