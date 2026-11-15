import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, XCircle, Award, CheckCircle2, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CertificateRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify/$certId")({
  component: VerifyCertificatePage,
});

function VerifyCertificatePage() {
  const { certId } = Route.useParams();
  const [cert, setCert] = useState<CertificateRecord | null | undefined>(undefined);

  useEffect(() => {
    if (certId) {
      const found = db.getCertificateById(certId);
      setCert(found || null);
    }
  }, [certId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {cert === undefined ? (
          <div className="text-sm text-muted-foreground">Verifying signature on blockchain registry...</div>
        ) : cert ? (
          <>
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                VERIFIED CREDENTIAL
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                Authenticity Confirmed
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Issued by DLIDES CLUB & Avanthi Institute of Engineering & Technology
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-muted/20 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Certificate ID:</span>
                <span className="font-mono font-bold text-cyan">{cert.certificateId}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Recipient Name:</span>
                <span className="font-bold text-foreground">{cert.recipientName}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Assigned Team:</span>
                <span className="font-semibold text-foreground">{cert.teamName} ({cert.teamId})</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-mono font-semibold uppercase text-cyan">
                  {cert.category.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Date of Issuance:</span>
                <span className="font-mono">{new Date(cert.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/portal">
                <Button variant="outline" className="w-full text-xs">
                  Go to Student Portal
                </Button>
              </Link>
              <Link to="/">
                <Button className="w-full text-xs bg-cyan text-slate-950 font-semibold">
                  Main Arena
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/15 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <XCircle className="h-8 w-8" />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400">
                UNVERIFIED RECORD
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold text-foreground">
                Certificate Not Found
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                No issued certificate was located matching token: <span className="font-mono text-cyan">{certId}</span>
              </p>
            </div>

            <Link to="/">
              <Button variant="outline" className="text-xs gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Home
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
