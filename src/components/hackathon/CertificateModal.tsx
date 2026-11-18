import { useRef, useState, useEffect } from "react";
import { Download, Printer, X, ShieldCheck, Award, Users, Check } from "lucide-react";
import { CertificateRecord, CertificateTemplate } from "@/lib/types";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  allTeamCertificates?: CertificateRecord[];
  onSelectCertificate?: (cert: CertificateRecord) => void;
  onClose: () => void;
}

export function CertificateModal({
  certificate: initialCert,
  allTeamCertificates = [],
  onSelectCertificate,
  onClose,
}: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(initialCert);

  useEffect(() => {
    setActiveCert(initialCert);
  }, [initialCert]);

  useEffect(() => {
    if (activeCert) {
      setTemplate(db.getCertificateTemplate());
    }
  }, [activeCert]);

  if (!activeCert) return null;

  const certificate = activeCert;

  const getCategoryTitle = (cat: CertificateRecord["category"]) => {
    switch (cat) {
      case "winner":
        return "CERTIFICATE OF EXCELLENCE — 1ST PLACE WINNER";
      case "runner_up":
        return "CERTIFICATE OF MERIT — 2ND PLACE RUNNER-UP";
      case "third_place":
        return "CERTIFICATE OF MERIT — 3RD PLACE";
      case "round_2_participation":
        return "CERTIFICATE OF FINALIST PARTICIPATION — ROUND 2";
      case "round_1_participation":
      default:
        return "CERTIFICATE OF PARTICIPATION — ROUND 1";
    }
  };

  const getBadgeColor = (cat: CertificateRecord["category"]) => {
    switch (cat) {
      case "winner":
        return "border-amber-400 text-amber-300 bg-amber-500/10";
      case "runner_up":
        return "border-cyan-400 text-cyan-300 bg-cyan-500/10";
      case "third_place":
        return "border-violet-400 text-violet-300 bg-violet-500/10";
      default:
        return "border-emerald-400 text-emerald-300 bg-emerald-500/10";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateCanvas = async (cert: CertificateRecord, tmpl: CertificateTemplate | null): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas");

    const width = 1600;
    const height = 1131; // Standard A4 landscape ratio
    canvas.width = width;
    canvas.height = height;

    if (tmpl?.imageUrl) {
      // Draw custom uploaded template
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error("Failed to load certificate template background"));
        bgImg.src = tmpl.imageUrl;
      });

      ctx.drawImage(bgImg, 0, 0, width, height);

      // Recipient Name
      ctx.textAlign = "center";
      const nameY = (tmpl.nameYPercent / 100) * height;
      ctx.fillStyle = tmpl.fontColor || "#ffffff";
      ctx.font = `bold ${tmpl.fontSize ? tmpl.fontSize * 1.5 : 54}px serif`;
      ctx.fillText(cert.recipientName, width / 2, nameY);

      // Team Name
      if (tmpl.showTeamName) {
        const teamY = (tmpl.teamYPercent / 100) * height;
        ctx.font = `italic 24px sans-serif`;
        ctx.fillStyle = tmpl.fontColor || "#e2e8f0";
        ctx.fillText(`Team: ${cert.teamName} (${cert.teamId})`, width / 2, teamY);
      }

      // Certificate ID & Verification
      if (tmpl.showCertId) {
        const certY = (tmpl.certIdYPercent / 100) * height;
        ctx.font = `14px monospace`;
        ctx.fillStyle = tmpl.fontColor || "#94a3b8";
        ctx.fillText(`Certificate ID: ${cert.certificateId} • Code: ${cert.verificationCode}`, width / 2, certY);
      }
    } else {
      // Draw Default Official Vector Certificate
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#030712");
      grad.addColorStop(0.5, "#090d1a");
      grad.addColorStop(1, "#02040a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Double border
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 44, width - 88, height - 88);

      // Branding
      ctx.textAlign = "center";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 18px monospace";
      ctx.fillText("DLIDES CLUB • AVANTHI INSTITUTE OF ENGINEERING & TECHNOLOGY", width / 2, 120);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText("HACK WITH AVANTHI 2026", width / 2, 185);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px monospace";
      ctx.fillText("2 DAYS AI & TECHNICAL HACKATHON • 21 – 22 DECEMBER 2026", width / 2, 225);

      // Category Pill
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 20px monospace";
      ctx.fillText(getCategoryTitle(cert.category), width / 2, 280);

      // Presentation intro
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "italic 22px sans-serif";
      ctx.fillText("This credential is proudly presented to", width / 2, 400);

      // Recipient Name
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(cert.recipientName, width / 2, 480);

      // Citation
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "20px sans-serif";
      ctx.fillText(
        `of ${cert.teamName} (${cert.teamId}) in recognition of outstanding`,
        width / 2,
        560,
      );
      ctx.fillText(
        "technical competence, innovation, and active participation in the arena.",
        width / 2,
        595,
      );

      // Footer lines & Signatures
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.moveTo(100, 850);
      ctx.lineTo(width - 100, 850);
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "italic bold 22px cursive";
      ctx.fillText("Dr. G. Suresh Kumar", 140, 910);
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Principal", 140, 935);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Avanthi Institute of Engg & Tech, VZM", 140, 955);

      ctx.textAlign = "right";
      ctx.fillStyle = "#a855f7";
      ctx.font = "italic bold 22px cursive";
      ctx.fillText("Prof. M. R. V. Sharma", width - 140, 910);
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Convenor", width - 140, 935);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("DLIDES CLUB", width - 140, 955);

      // Verification center text
      ctx.textAlign = "center";
      ctx.fillStyle = "#64748b";
      ctx.font = "13px monospace";
      ctx.fillText(`CERTIFICATE ID: ${cert.certificateId}`, width / 2, 980);
      ctx.fillText(`VERIFICATION CODE: ${cert.verificationCode}`, width / 2, 1005);
    }

    return canvas;
  };

  const handleDownloadImage = async (targetCert = certificate) => {
    if (!targetCert) return;
    setIsDownloading(true);
    toast.info(`Preparing certificate for ${targetCert.recipientName}...`);

    try {
      const canvas = await generateCanvas(targetCert, template);
      const link = document.createElement("a");
      const safeName = targetCert.recipientName.replace(/\s+/g, "_");
      link.download = `HWA-2026-Certificate-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded certificate for ${targetCert.recipientName}!`);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to generate download. You can also use 'Print / PDF'.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!allTeamCertificates || allTeamCertificates.length === 0) {
      await handleDownloadImage(certificate);
      return;
    }

    setIsDownloading(true);
    toast.info(`Downloading certificates for all ${allTeamCertificates.length} participants...`);

    try {
      for (let i = 0; i < allTeamCertificates.length; i++) {
        const cert = allTeamCertificates[i];
        if (!cert) continue;
        const canvas = await generateCanvas(cert, template);
        const link = document.createElement("a");
        const safeName = cert.recipientName.replace(/\s+/g, "_");
        link.download = `HWA-2026-Certificate-${safeName}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay to ensure browser handles downloads cleanly
        if (i < allTeamCertificates.length - 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      toast.success(`Downloaded all ${allTeamCertificates.length} certificates!`);
    } catch (err) {
      console.error(err);
      toast.error("Error during batch download.");
    } finally {
      setIsDownloading(false);
    }
  };

  const switchParticipant = (cert: CertificateRecord) => {
    setActiveCert(cert);
    if (onSelectCertificate) {
      onSelectCertificate(cert);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-2 sm:p-4 flex items-start sm:items-center justify-center">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border bg-muted/95 backdrop-blur z-20">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="h-5 w-5 text-cyan shrink-0" />
            <div className="truncate">
              <span className="font-display font-semibold text-xs sm:text-sm text-foreground block truncate">
                Verified Credential • {certificate.recipientName}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">
                {certificate.teamName} ({certificate.teamId})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleDownloadImage(certificate)}
              disabled={isDownloading}
              className="gap-1.5 bg-cyan text-slate-950 font-bold hover:bg-cyan/90 h-8 sm:h-9 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isDownloading ? "Generating..." : "Download PNG"}</span>
              <span className="sm:hidden">PNG</span>
            </Button>
            {allTeamCertificates.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="gap-1.5 h-8 sm:h-9 text-xs border-cyan/50 text-cyan hover:bg-cyan/10 hidden md:inline-flex"
              >
                <Users className="h-3.5 w-3.5" /> All ({allTeamCertificates.length})
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 h-8 sm:h-9 text-xs hidden sm:inline-flex">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Team Participants Switcher Bar (when multiple participants exist) */}
        {allTeamCertificates.length > 1 && (
          <div className="shrink-0 px-4 py-2 bg-background/80 border-b border-border/80 flex items-center gap-2 overflow-x-auto text-xs z-10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
              <Users className="h-3 w-3 text-cyan" /> Team Participants:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {allTeamCertificates.map((c) => {
                const isCurrent = c.id === certificate.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => switchParticipant(c)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${isCurrent
                        ? "bg-cyan/20 border-cyan text-cyan shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                        : "bg-muted/40 border-border text-muted-foreground hover:border-cyan/40 hover:text-foreground"
                      }`}
                  >
                    {isCurrent && <Check className="h-3 w-3 text-cyan" />}
                    <span>{c.recipientName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificate Display Area (Scrollable & Responsive) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 bg-zinc-950 flex flex-col items-center justify-start min-h-75">
          {template?.imageUrl ? (
            /* Custom Uploaded Template View */
            <div
              ref={certRef}
              id="printable-certificate"
              className="relative w-full max-w-212.5 aspect-[1.414/1] bg-black shadow-2xl overflow-hidden rounded-lg border border-border shrink-0 my-auto"
              style={{
                backgroundImage: `url(${template.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay: Recipient Name */}
              <div
                className="absolute left-0 right-0 text-center px-8"
                style={{
                  top: `${template.nameYPercent}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  className="font-bold tracking-wide uppercase"
                  style={{
                    color: template.fontColor || "#ffffff",
                    fontSize: `${template.fontSize || 36}px`,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {certificate.recipientName}
                </div>

                {template.showTeamName && (
                  <div
                    className="mt-1 font-semibold text-xs sm:text-sm tracking-wider"
                    style={{
                      color: template.fontColor || "#e2e8f0",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    Team: {certificate.teamName} ({certificate.teamId})
                  </div>
                )}
              </div>

              {/* Overlay: Certificate Verification Info */}
              {template.showCertId && (
                <div
                  className="absolute left-0 right-0 text-center font-mono text-[10px] sm:text-xs"
                  style={{
                    top: `${template.certIdYPercent}%`,
                    color: template.fontColor || "#94a3b8",
                  }}
                >
                  ID: {certificate.certificateId} • Code: {certificate.verificationCode}
                </div>
              )}
            </div>
          ) : (
            /* Default Vector Certificate View */
            <div
              ref={certRef}
              id="printable-certificate"
              className="relative w-full max-w-212.5 aspect-[1.414/1] bg-linear-to-br from-slate-950 via-zinc-900 to-neutral-950 border-[6px] border-double border-cyan/40 p-6 sm:p-12 flex flex-col justify-between text-center shadow-2xl overflow-hidden rounded-lg shrink-0 my-auto"
            >
              {/* Background cyber watermark patterns */}
              <div className="pointer-events-none absolute inset-0 bg-neural-grid opacity-25" />
              <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet/15 blur-3xl" />

              {/* Top Branding */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan/90">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan" />
                  DLIDES CLUB • AVANTHI INSTITUTE OF ENGINEERING & TECHNOLOGY
                </div>
                <h1 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-3xl md:text-4xl font-extrabold tracking-wider text-white">
                  HACK WITH AVANTHI 2026
                </h1>
                <p className="mt-0.5 sm:mt-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                  2 Days AI & Technical Hackathon • 21 – 22 December 2026
                </p>

                <div
                  className={`mt-2.5 sm:mt-4 inline-block px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider ${getBadgeColor(
                    certificate.category,
                  )}`}
                >
                  {getCategoryTitle(certificate.category)}
                </div>
              </div>

              {/* Middle Award Body */}
              <div className="relative z-10 my-2 sm:my-6">
                <p className="text-[11px] sm:text-sm font-light text-muted-foreground italic">
                  This credential is proudly presented to
                </p>
                <h2 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan via-white to-violet uppercase tracking-wide">
                  {certificate.recipientName}
                </h2>
                <p className="mt-2 sm:mt-3 text-[11px] sm:text-sm text-foreground/80 max-w-xl mx-auto leading-relaxed">
                  of <strong className="text-cyan font-semibold">{certificate.teamName}</strong> ({certificate.teamId}) in recognition of outstanding technical competence, innovation, and active participation in the arena.
                </p>
              </div>

              {/* Signatures & Verification Footer */}
              <div className="relative z-10 pt-3 sm:pt-4 border-t border-border/40 grid grid-cols-3 items-end text-xs">
                <div className="text-left font-mono">
                  <div className="h-6 sm:h-8 border-b border-border/60 flex items-end pb-1 font-signature text-xs sm:text-sm text-cyan">
                    Dr. G. Suresh Kumar
                  </div>
                  <div className="font-semibold text-foreground text-[10px] sm:text-xs mt-1">Principal</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">AIET Campus, VZM</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-1 sm:p-1.5 bg-white rounded border border-border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=https://hackwithavanthi.com/verify/${certificate.certificateId}`}
                      alt="QR Verify"
                      className="h-9 w-9 sm:h-12 sm:w-12"
                    />
                  </div>
                  <span className="font-mono text-[8px] sm:text-[9px] text-muted-foreground mt-1">
                    ID: {certificate.certificateId}
                  </span>
                  <span className="font-mono text-[7px] sm:text-[8px] text-cyan/70">
                    CODE: {certificate.verificationCode}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <div className="h-6 sm:h-8 border-b border-border/60 flex items-end justify-end pb-1 font-signature text-xs sm:text-sm text-violet">
                    Prof. M. R. V. Sharma
                  </div>
                  <div className="font-semibold text-foreground text-[10px] sm:text-xs mt-1">Convenor</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">DLIDES CLUB</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="sm:hidden shrink-0 p-3 bg-muted/95 border-t border-border flex items-center gap-2 sticky bottom-0 z-20">
          <Button
            onClick={() => handleDownloadImage(certificate)}
            disabled={isDownloading}
            className="flex-1 bg-cyan text-slate-950 font-bold hover:bg-cyan/90 h-10 text-xs gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating..." : `Download Certificate (${certificate.recipientName})`}
          </Button>
          {allTeamCertificates.length > 1 && (
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="h-10 text-xs px-3 border-cyan/40 text-cyan shrink-0"
              title="Download all members' certificates"
            >
              All ({allTeamCertificates.length})
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="hidden sm:flex px-6 py-2.5 bg-muted/30 border-t border-border items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>Issued on {new Date(certificate.issuedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
          <span className="font-mono text-cyan text-[11px]">Official HWA Cryptographic Verification Token</span>
        </div>
      </div>
    </div>
  );
}
