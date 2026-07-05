"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "@/components/shared/notification-bell";

type Activity = {
  id: string;
  title: string;
  eventDate: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

type Service = {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

type Section = {
  key: string;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

type Settings = {
  address?: string;
  mapEmbedUrl?: string;
  officePhoto1?: string;
  officePhoto2?: string;
  whatsappNumber?: string;
  whatsappGroupUrl?: string;
  wechatQrUrl?: string;
  email?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function HomePage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch("/api/activities").then((r) => r.json()).then(setActivities);
    fetch("/api/services").then((r) => r.json()).then(setServices);
    fetch("/api/sections").then((r) => r.json()).then((data: Section[]) => {
      const map: Record<string, Section> = {};
      data.forEach((s) => (map[s.key] = s));
      setSections(map);
    });
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const navLinks = [
    { id: "services", label: "Services" },
    { id: "sourcing", label: "Sourcing" },
    { id: "purchasing", label: "Purchasing" },
    { id: "journey", label: "Our Journey" },
    { id: "about", label: "About" },
  ];

  return (
    <div className="bg-slate-bg">
      {/* Sticky top bar */}
      <header className="border-b border-line bg-panel sticky top-0 z-30">
        {/* Row 1: brand + account controls */}
        <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-field border border-line flex items-center justify-center shrink-0">
              <span className="text-teal font-bold text-xs sm:text-sm">QG</span>
            </div>
            <span className="text-white font-semibold text-xs sm:text-sm truncate hidden sm:inline">
              Quanqiugang International
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {session ? (
              <>
                <NotificationBell />
                <Link href="/chat" className="text-white/60 text-xs sm:text-sm hover:text-white transition">
                  Chat
                </Link>
                <Link href="/quote" className="text-white/60 text-xs sm:text-sm hover:text-white transition hidden sm:inline">
                  Request quote
                </Link>
                <Link href="/my-shipments" className="text-white/60 text-xs sm:text-sm hover:text-white transition">
                  Track shipment
                </Link>
                <span className="hidden lg:inline text-white/60 text-sm">
                  Hi, {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-white/50 text-xs sm:text-sm hover:text-white transition border border-line rounded-lg px-2.5 sm:px-3 py-1.5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/60 text-xs sm:text-sm hover:text-white transition">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Row 2: section anchor nav, always visible */}
        <div className="border-t border-line">
          <div className="max-w-7xl xl:max-w-[1600px] mx-auto flex justify-start sm:justify-center overflow-x-auto gap-1 px-4 sm:px-6 lg:px-10 xl:px-16 py-2">
            {navLinks.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToId(n.id)}
                className="shrink-0 text-white/60 hover:text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg hover:bg-field transition whitespace-nowrap"
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-bg px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-lime/10 rounded-full blur-[120px]" />
        <div className="relative max-w-2xl">
          <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-4">
            Sourcing · Purchasing · Shipping
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            We source, buy, and ship for you  from China to your door.
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8">
            Follow our latest sourcing trips and supplier visits below, or
            create an account to start a quotation and chat directly with our team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => scrollToId("services")}
              className="bg-gradient-to-r from-teal to-lime text-slate-bg font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Explore services
            </button>
            <button
              onClick={() => scrollToId("journey")}
              className="border border-line text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-lg transition"
            >
              Our Journey
            </button>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="min-h-screen bg-panel px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20">
        <div className="max-w-7xl xl:max-w-[1600px] mx-auto">
          <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-2">What we offer</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-10">Services</h2>

          {services.length === 0 ? (
            <p className="text-white/40 text-sm">No services listed yet.</p>
          ) : (
            <div
              className="grid gap-5 lg:gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="bg-field border border-line rounded-2xl overflow-hidden group hover:border-teal/40 transition"
                >
                  <div className="w-full aspect-video bg-slate-bg overflow-hidden">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : s.videoUrl ? (
                      <video src={s.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm leading-snug">{s.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== SOURCING ===== */}
      <section id="sourcing" className="min-h-screen bg-slate-bg px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">01</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            {sections.sourcing?.title || "Sourcing"}
          </h2>
          {sections.sourcing?.imageUrl && (
            <img
              src={sections.sourcing.imageUrl}
              alt="Sourcing"
              className="w-full rounded-2xl mb-6"
            />
          )}
          {sections.sourcing?.videoUrl && (
            <video src={sections.sourcing.videoUrl} controls className="w-full rounded-2xl mb-6" />
          )}
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/60 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sections.sourcing?.body || "<p>Content coming soon.</p>",
            }}
          />
        </div>
      </section>

      {/* ===== PURCHASING ===== */}
      <section id="purchasing" className="min-h-screen bg-panel px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-2">02</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            {sections.purchasing?.title || "Purchasing"}
          </h2>
          {sections.purchasing?.imageUrl && (
            <img
              src={sections.purchasing.imageUrl}
              alt="Purchasing"
              className="w-full rounded-2xl mb-6"
            />
          )}
          {sections.purchasing?.videoUrl && (
            <video src={sections.purchasing.videoUrl} controls className="w-full rounded-2xl mb-6" />
          )}
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/60 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sections.purchasing?.body || "<p>Content coming soon.</p>",
            }}
          />
        </div>
      </section>

      {/* ===== OUR JOURNEY (Activities) ===== */}
      <section id="journey" className="min-h-screen bg-slate-bg px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20">
        <div className="max-w-7xl xl:max-w-[1600px] mx-auto">
          <p className="text-lime text-xs font-semibold tracking-widest uppercase mb-2">Behind the scenes</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-10">Our Journey</h2>

          {activities.length === 0 ? (
            <p className="text-white/40 text-sm">No activity posts yet.</p>
          ) : (
            <div
              className="grid gap-5 lg:gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={`/activities/${a.id}`}
                  className="bg-panel border border-line rounded-2xl overflow-hidden group hover:border-teal/40 transition"
                >
                  <div className="w-full aspect-video bg-field overflow-hidden">
                    {a.imageUrl ? (
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : a.videoUrl ? (
                      <video src={a.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-white/40 text-[11px] mb-1">
                      {new Date(a.eventDate).toLocaleDateString()}
                    </p>
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="min-h-screen bg-panel px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">About us</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            {sections.about?.title || "About Quanqiugang International"}
          </h2>
          {sections.about?.imageUrl && (
            <img src={sections.about.imageUrl} alt="About" className="w-full rounded-2xl mb-6" />
          )}
          {sections.about?.videoUrl && (
            <video src={sections.about.videoUrl} controls className="w-full rounded-2xl mb-6" />
          )}
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/60 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sections.about?.body || "<p>Content coming soon.</p>",
            }}
          />
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-bg border-t border-line px-4 sm:px-6 lg:px-10 xl:px-16 py-14">
        <div className="max-w-7xl xl:max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Our office</h3>
            {settings.address && (
              <p className="text-white/50 text-sm mb-4 leading-relaxed">{settings.address}</p>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {settings.officePhoto1 && (
                <img src={settings.officePhoto1} alt="Office" className="rounded-lg w-full aspect-square object-cover" />
              )}
              {settings.officePhoto2 && (
                <img src={settings.officePhoto2} alt="Office" className="rounded-lg w-full aspect-square object-cover" />
              )}
            </div>
            {settings.mapEmbedUrl && (
              <iframe src={settings.mapEmbedUrl} className="w-full h-40 rounded-lg border-0" loading="lazy" />
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Contact us</h3>
            <div className="space-y-2 text-sm">
              {settings.email && (
                <a className="block text-white/50 hover:text-teal transition" href={`mailto:${settings.email}`}>Email: {settings.email}</a>
              )}
              {settings.whatsappNumber && (
                <a className="block text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}>WhatsApp: {settings.whatsappNumber}</a>
              )}
              {settings.whatsappGroupUrl && (
                <a className="block text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={settings.whatsappGroupUrl}>Join our WhatsApp community</a>
              )}
            </div>
            {settings.wechatQrUrl && (
              <div className="mt-4">
                <p className="text-white/40 text-xs mb-2">Scan for WeChat</p>
                <img src={settings.wechatQrUrl} alt="WeChat QR" className="w-24 h-24 rounded-lg" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Follow us</h3>
            <div className="flex flex-col gap-2 text-sm">
              {settings.youtubeUrl && (
                <a className="text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={settings.youtubeUrl}>YouTube</a>
              )}
              {settings.tiktokUrl && (
                <a className="text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={settings.tiktokUrl}>TikTok</a>
              )}
              {settings.instagramUrl && (
                <a className="text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={settings.instagramUrl}>Instagram</a>
              )}
              {settings.facebookUrl && (
                <a className="text-white/50 hover:text-teal transition" target="_blank" rel="noopener noreferrer" href={settings.facebookUrl}>Facebook</a>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl xl:max-w-[1600px] mx-auto border-t border-line mt-10 pt-6">
          <p className="text-white/30 text-xs text-center">
            © {new Date().getFullYear()} Quanqiugang International. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}