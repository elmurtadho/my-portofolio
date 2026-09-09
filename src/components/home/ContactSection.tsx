"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Globe,
} from "lucide-react";
import { ContactData } from "@/lib/mock-data";
import { ContactLinkButton } from "@/components/ui/ContactLinkButton";

interface ContactSectionProps {
  contact: ContactData;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  const cleanPhone = contact.phone.replace(/[^0-9]/g, "");

  return (
    <section
      id="contact"
      className="relative py-24 bg-[#070f0b] border-t border-[#132c1f] overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute left-[-10%] top-1/4 w-96 h-96 bg-emerald-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-1/4 w-96 h-96 bg-teal-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10291e] border border-[#1e4834] text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kontak &amp; Kolaborasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Mari Mulai{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
              Mewujudkan Proyek
            </span>
          </h2>
          <p className="mt-3 text-base text-emerald-200/60 max-w-2xl leading-relaxed">
            Punya ide menarik atau butuh bantuan dalam desain grafis, UI/UX, video, atau 3D? Kirim pesan kapan saja.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Email Card */}
            <div className="p-6 rounded-2xl bg-[#0b1c14] border border-[#1d4734] shadow-xl flex items-start justify-between gap-4 group hover:border-emerald-500/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    Email Resmi
                  </h3>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-base font-bold text-white hover:text-emerald-300 transition break-all"
                  >
                    {contact.email}
                  </a>
                  <p className="text-xs text-emerald-300/60 mt-1">
                    Respon cepat dalam 1x24 jam kerja.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {copiedField === "email" && (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-in fade-in zoom-in-95">
                    Tersalin!
                  </span>
                )}
                <button
                  onClick={() => handleCopy(contact.email, "email")}
                  className="p-2 rounded-lg bg-[#122e20] hover:bg-[#183e2b] text-emerald-300 hover:text-white transition flex-shrink-0"
                  title="Salin Email"
                >
                  {copiedField === "email" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp / Phone Card */}
            <div className="p-6 rounded-2xl bg-[#0b1c14] border border-[#1d4734] shadow-xl flex items-start justify-between gap-4 group hover:border-emerald-500/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    WhatsApp &amp; Telepon
                  </h3>
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-white hover:text-emerald-300 transition"
                  >
                    {contact.phone}
                  </a>
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-[#143525] text-emerald-300 hover:bg-[#1a4430] border border-[#21543b] transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {copiedField === "phone" && (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-in fade-in zoom-in-95">
                    Tersalin!
                  </span>
                )}
                <button
                  onClick={() => handleCopy(contact.phone, "phone")}
                  className="p-2 rounded-lg bg-[#122e20] hover:bg-[#183e2b] text-emerald-300 hover:text-white transition flex-shrink-0"
                  title="Salin Nomor Telepon"
                >
                  {copiedField === "phone" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div className="p-6 rounded-2xl bg-[#0b1c14] border border-[#1d4734] shadow-xl flex items-start justify-between gap-4 group hover:border-emerald-500/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    Basis &amp; Lokasi
                  </h3>
                  <p className="text-base font-bold text-white">
                    {contact.location}
                  </p>
                  <p className="text-xs text-emerald-300/60 mt-1">
                    Tersedia untuk remote work secara global atau on-site project.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {copiedField === "location" && (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-in fade-in zoom-in-95">
                    Tersalin!
                  </span>
                )}
                <button
                  onClick={() => handleCopy(contact.location, "location")}
                  className="p-2 rounded-lg bg-[#122e20] hover:bg-[#183e2b] text-emerald-300 hover:text-white transition flex-shrink-0"
                  title="Salin Lokasi"
                >
                  {copiedField === "location" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Social Links Card */}
            {contact.socials && contact.socials.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                  Koneksi &amp; Jejaring Sosial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contact.socials.map((s, idx) => (
                    <ContactLinkButton
                      key={idx}
                      platform={s.platform}
                      url={s.url}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-[#0c1f16] border border-[#1f4b36] shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-2">
                Kirim Pesan Langsung
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/65 mb-6">
                Isi formulir di bawah ini dan saya akan segera menghubungi Anda kembali.
              </p>

              {submitted ? (
                <div className="p-8 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white">
                    Pesan Berhasil Terkirim!
                  </h4>
                  <p className="text-sm text-emerald-200/80 mt-1 max-w-md mx-auto">
                    Terima kasih telah menghubungi saya. Detail pesan Anda telah tercatat dan saya akan membalas ke email Anda secepatnya.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300/90 mb-1.5">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Contoh: Rian Pratama"
                        className="w-full px-4 py-3 rounded-xl bg-[#08150f] border border-[#1a3f2d] text-sm text-white placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300/90 mb-1.5">
                        Alamat Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#08150f] border border-[#1a3f2d] text-sm text-white placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300/90 mb-1.5">
                      Subjek Pesan
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Contoh: Diskusi Proyek Desain & 3D Baru"
                      className="w-full px-4 py-3 rounded-xl bg-[#08150f] border border-[#1a3f2d] text-sm text-white placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300/90 mb-1.5">
                      Pesan Anda *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Ceritakan gambaran ide proyek, ekspektasi waktu, atau lingkup desain yang Anda perlukan..."
                      className="w-full px-4 py-3 rounded-xl bg-[#08150f] border border-[#1a3f2d] text-sm text-white placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesan Sekarang</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
