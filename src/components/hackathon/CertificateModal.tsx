import { useRef, useState, useEffect } from "react";
import { Download, Printer, X, ShieldCheck, Award } from "lucide-react";
import { CertificateRecord, CertificateTemplate } from "@/lib/types";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (certificate) {
      setTemplate(db.getCertificateTemplate());
    }
  }, [certificate]);

  if (!certificate) return null;

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

  const handleDownloadImage = async () => {
    if (!certificate) return;
    setIsDownloading(true);
    toast.info("Preparing your high-resolution certificate...");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas");

      const width = 1600;
      const height = 1131; // Standard A4 landscape ratio
      canvas.width = width;
      canvas.height = height;

      if (template?.imageUrl) {
        // Draw custom uploaded template
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          bgImg.onload = () => resolve();
          bgImg.onerror = () => reject(new Error("Failed to load certificate template background"));
          bgImg.src = template.imageUrl;
        });

        ctx.drawImage(bgImg, 0, 0, width, height);

        // Recipient Name
        ctx.textAlign = "center";
        const nameY = (template.nameYPercent / 100) * height;
        ctx.fillStyle = template.fontColor || "#ffffff";
        ctx.font = `bold ${template.fontSize ? template.fontSize * 1.5 : 54}px serif`;
        ctx.fillText(certificate.recipientName, width / 2, nameY);

        // Team Name
        if (template.showTeamName) {
          const teamY = (template.teamYPercent / 100) * height;
          ctx.font = `italic 24px sans-serif`;
          ctx.fillStyle = template.fontColor || "#e2e8f0";
          ctx.fillText(`Team: ${certificate.teamName} (${certificate.teamId})`, width / 2, teamY);
        }

        // Certificate ID & Verification
        if (template.showCertId) {
          const certY = (template.certIdYPercent / 100) * height;
          ctx.font = `14px monospace`;
          ctx.fillStyle = template.fontColor || "#94a3b8";
          ctx.fillText(`Certificate ID: ${certificate.certificateId} • Code: ${certificate.verificationCode}`, width / 2, certY);
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
        ctx.fillText("2 DAYS AI & TECHNICAL HACKATHON • 18 – 19 DECEMBER 2026", width / 2, 225);

        // Category Pill
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 20px monospace";
        ctx.fillText(getCategoryTitle(certificate.category), width / 2, 280);

        // Presentation intro
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "italic 22px sans-serif";
        ctx.fillText("This credential is proudly presented to", width / 2, 400);

        // Recipient Name
        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 64px sans-serif";
        ctx.fillText(certificate.recipientName, width / 2, 480);

        // Citation
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "20px sans-serif";
        ctx.fillText(
          `of ${certificate.teamName} (${certificate.teamId}) in recognition of outstanding`,
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
        ctx.fillText("Avanthi Institute of Engg & Tech", 140, 955);

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
        ctx.fillText(`CERTIFICATE ID: ${certificate.certificateId}`, width / 2, 980);
        ctx.fillText(`VERIFICATION CODE: ${certificate.verificationCode}`, width / 2, 1005);
      }

      // Download triggered
      const link = document.createElement("a");
      const safeName = certificate.recipientName.replace(/\s+/g, "_");
      link.download = `HWA-2026-Certificate-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Certificate downloaded successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to generate download. You can also use 'Print / Save PDF'.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan" />
            <span className="font-display font-semibold text-sm">HWA 2026 Verified Credential</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="gap-2 bg-cyan text-slate-950 font-bold hover:bg-cyan/90 h-9"
            >
              <Download className="h-4 w-4" /> {isDownloading ? "Generating..." : "Download Certificate (PNG)"}
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2 h-9">
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 flex justify-center bg-zinc-950">
          {template?.imageUrl ? (
            /* Custom Uploaded Template View */
            <div
              ref={certRef}
              id="printable-certificate"
              className="relative w-full max-w-212.5 aspect-[1.414/1] bg-black shadow-2xl overflow-hidden rounded-lg border border-border"
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
              className="relative w-full max-w-212.5 aspect-[1.414/1] bg-linear-to-br from-slate-950 via-zinc-900 to-neutral-950 border-[6px] border-double border-cyan/40 p-8 sm:p-12 flex flex-col justify-between text-center shadow-2xl overflow-hidden rounded-lg"
            >
              {/* Background cyber watermark patterns */}
              <div className="pointer-events-none absolute inset-0 bg-neural-grid opacity-25" />
              <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet/15 blur-3xl" />

              {/* Top Branding */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-cyan/90">
                  <ShieldCheck className="h-4 w-4 text-cyan" />
                  DLIDES CLUB • AVANTHI INSTITUTE OF ENGINEERING & TECHNOLOGY
                </div>
                <h1 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-wider text-white">
                  HACK WITH AVANTHI 2026
                </h1>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  2 Days AI & Technical Hackathon • 18 – 19 December 2026
                </p>

                <div
                  className={`mt-4 inline-block px-4 py-1 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider ${getBadgeColor(certificate.category)}`}
                >
                  {getCategoryTitle(certificate.category)}
                </div>
              </div>

              {/* Middle Award Body */}
              <div className="relative z-10 my-4 sm:my-6">
                <p className="text-xs sm:text-sm font-light text-muted-foreground italic">
                  This credential is proudly presented to
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan via-white to-violet uppercase tracking-wide">
                  {certificate.recipientName}
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-foreground/80 max-w-xl mx-auto leading-relaxed">
                  of <strong className="text-cyan font-semibold">{certificate.teamName}</strong> ({certificate.teamId}) in recognition of outstanding technical competence, innovation, and active participation in the arena.
                </p>
              </div>

              {/* Signatures & Verification Footer */}
              <div className="relative z-10 pt-4 border-t border-border/40 grid grid-cols-3 items-end text-xs">
                <div className="text-left font-mono">
                  <div className="h-8 border-b border-border/60 flex items-end pb-1 font-signature text-sm text-cyan">
                    Dr. G. Suresh Kumar
                  </div>
                  <div className="font-semibold text-foreground mt-1">Principal</div>
                  <div className="text-[10px] text-muted-foreground">AVANTHI COLLEGE</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-1.5 bg-white rounded border border-border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=https://hackwithavanthi.com/verify/${certificate.certificateId}`}
                      alt="QR Verify"
                      className="h-12 w-12"
                    />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground mt-1">
                    ID: {certificate.certificateId}
                  </span>
                  <span className="font-mono text-[8px] text-cyan/70">
                    CODE: {certificate.verificationCode}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <div className="h-8 border-b border-border/60 flex items-end justify-end pb-1 font-signature text-sm text-violet">
                    Prof. M. R. V. Sharma
                  </div>
                  <div className="font-semibold text-foreground mt-1">Convenor</div>
                  <div className="text-[10px] text-muted-foreground">DLIDES CLUB</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <span>Issued on {new Date(certificate.issuedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
          <span className="font-mono text-cyan">Official HWA Cryptographic Verification Token</span>
        </div>
      </div>
    </div>
  );
}
