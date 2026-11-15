import { useRef } from "react";
import { Download, Printer, X, ShieldCheck, Award } from "lucide-react";
import { CertificateRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan" />
            <span className="font-display font-semibold text-sm">HWA 2026 Verified Credential</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-4 sm:p-8 flex justify-center bg-zinc-950">
          <div
            ref={certRef}
            id="printable-certificate"
            className="relative w-full max-w-[850px] aspect-[1.414/1] bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 border-[6px] border-double border-cyan/40 p-8 sm:p-12 flex flex-col justify-between text-center shadow-2xl overflow-hidden rounded-lg"
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
                24-Hour AI & Technical Hackathon • 18 – 19 December 2026
              </p>

              <div className={`mt-4 inline-block px-4 py-1 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider ${getBadgeColor(certificate.category)}`}>
                {getCategoryTitle(certificate.category)}
              </div>
            </div>

            {/* Middle Award Body */}
            <div className="relative z-10 my-4 sm:my-6">
              <p className="text-xs sm:text-sm font-light text-muted-foreground italic">
                This credential is proudly presented to
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-violet uppercase tracking-wide">
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
                <div className="text-[10px] text-muted-foreground">AIET Campus</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1.5 bg-white rounded border border-border">
                  {/* Simulated QR code */}
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
