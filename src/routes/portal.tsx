import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Award,
  Search,
  Users,
  QrCode,
  FileCheck,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Download,
  Calendar,
  Lock,
  ArrowRight,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Team, CertificateRecord, FinalPosition } from "@/lib/types";
import { CertificateModal } from "@/components/hackathon/CertificateModal";
import { downloadTeamQrPass } from "@/lib/download-pass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/portal")({
  component: StudentPortal,
});

function StudentPortal() {
  const [teamInput, setTeamInput] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  // Check URL query parameters or session storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTeamId = params.get("teamId") || sessionStorage.getItem("hwa_active_team_id");
      if (urlTeamId) {
        verifyAndLoadTeam(urlTeamId);
      }
    }
  }, []);

  const verifyAndLoadTeam = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your Team ID.");
      setHasAttempted(true);
      return;
    }

    const found = db.getTeam(trimmed);
    if (found) {
      setSelectedTeam(found);
      setTeamInput(found.teamId);
      setErrorMessage("");
      setHasAttempted(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hwa_active_team_id", found.teamId);
      }
      toast.success(`Welcome, Team ${found.teamName}!`);
    } else {
      setSelectedTeam(null);
      setErrorMessage(
        `Team ID "${trimmed}" not found. Please check your registration confirmation or Team ID format (e.g. HWA-2026-101).`,
      );
      setHasAttempted(true);
      toast.error("Invalid Team ID");
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndLoadTeam(teamInput);
  };

  const handleExitTeam = () => {
    setSelectedTeam(null);
    setTeamInput("");
    setErrorMessage("");
    setHasAttempted(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hwa_active_team_id");
      const url = new URL(window.location.href);
      url.searchParams.delete("teamId");
      window.history.replaceState({}, "", url.pathname);
    }
    toast.info("Logged out from team portal.");
  };

  // Status checks for active team
  const r1Eval = selectedTeam ? db.getRound1EvaluationForTeam(selectedTeam.teamId) : undefined;
  const r1Selection = selectedTeam ? db.getRound1SelectionForTeam(selectedTeam.teamId) : undefined;
  const r1Pub = db.getRound1PublicationStatus();

  const r2Eval = selectedTeam ? db.getRound2EvaluationForTeam(selectedTeam.teamId) : undefined;
  const finalResults = db.getFinalResults();
  const finalPub = db.getFinalPublicationStatus();
  const teamFinalResult = selectedTeam
    ? finalResults.find((r) => r.teamId === selectedTeam.teamId)
    : undefined;

  const teamCerts = selectedTeam ? db.getCertificatesForTeam(selectedTeam.teamId) : [];

  const isR1Selected = r1Pub.isPublished && r1Selection?.status === "selected";
  const isR1NotSelected = r1Pub.isPublished && r1Selection?.status === "not_selected";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-black text-lg sm:text-xl text-neon">
              HACK WITH AVANTHI
            </span>
            <Badge variant="outline" className="border-cyan text-cyan text-[10px]">
              STUDENT PORTAL
            </Badge>
          </Link>
          <div className="flex items-center gap-3">
            {selectedTeam ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExitTeam}
                className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
              >
                <LogOut className="h-3.5 w-3.5" /> Switch Team
              </Button>
            ) : (
              <Link to="/register">
                <Button size="sm" variant="outline" className="text-xs h-8 border-cyan text-cyan hover:bg-cyan/10">
                  Register New Team
                </Button>
              </Link>
            )}
            <Link to="/results" className="text-xs text-muted-foreground hover:text-cyan hidden sm:inline">
              Public Standings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10">
        {/* GATEKEEPER VIEW: If no valid team loaded */}
        {!selectedTeam ? (
          <div className="max-w-lg mx-auto my-12 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
              <Lock className="h-8 w-8" />
            </div>

            <div className="text-center space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan">
                Authentication Required
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                Enter Team ID
              </h1>
              <p className="text-xs text-muted-foreground">
                Please enter your registered unique Team ID to access your team status, QR attendance pass, and certificates.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="e.g. HWA-2026-101"
                    className="font-mono text-center text-base tracking-wider uppercase h-12 bg-background/50 border-border focus-visible:border-cyan"
                    value={teamInput}
                    onChange={(e) => {
                      setTeamInput(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-cyan hover:bg-cyan/90 text-slate-950 font-bold tracking-wide uppercase text-xs gap-2 shadow-lg glow-cyan"
              >
                Verify & Load Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED TEAM DASHBOARD */
          <div className="space-y-8 animate-fade-in">
            {/* Team Identity Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-r from-card via-card/80 to-muted/30 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-3 py-1 rounded-full bg-cyan/15 border border-cyan/40 text-cyan font-bold">
                      {selectedTeam.teamId}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedTeam.theme}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${selectedTeam.paymentStatus === "verified"
                        ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500 text-amber-400 bg-amber-500/10"
                        }`}
                    >
                      Payment: {selectedTeam.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="mt-3 font-display text-3xl sm:text-4xl font-black">{selectedTeam.teamName}</h2>
                  <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                    <span>Academic Year: {selectedTeam.academicYear}</span>
                    <span>•</span>
                    <span>Registered on {new Date(selectedTeam.registeredAt).toLocaleDateString()}</span>
                  </p>
                </div>

                {/* Digital QR Attendance Pass */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-background/80 border border-border p-4 rounded-2xl self-start md:self-auto shadow-md">
                  <div className="p-1.5 bg-white rounded-xl border border-border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                        JSON.stringify({ teamId: selectedTeam.teamId, name: selectedTeam.teamName }),
                      )}`}
                      alt="Team QR Attendance Pass"
                      className="h-16 w-16"
                    />
                  </div>
                  <div className="text-left text-xs font-mono space-y-1">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-cyan" />
                      OFFICIAL QR PASS
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Entry:{" "}
                      <span
                        className={
                          selectedTeam.attendanceStatus === "checked_in"
                            ? "text-emerald-400 font-bold"
                            : "text-amber-400 font-bold"
                        }
                      >
                        {selectedTeam.attendanceStatus === "checked_in" ? "CHECKED IN" : "PENDING"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => downloadTeamQrPass(selectedTeam)}
                      className="h-7 text-[10px] gap-1 px-2 border-cyan/40 text-cyan hover:bg-cyan/10"
                    >
                      <Download className="h-3 w-3" /> Download Pass
                    </Button>
                  </div>
                </div>
              </div>

              {/* Roster list */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {selectedTeam.members.map((m, idx) => (
                  <div key={idx} className="bg-background/40 border border-border/50 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.role}</span>
                    </div>
                    <div className="text-muted-foreground text-[11px] truncate mt-1">{m.email}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TWO-ROUND PROGRESS TRACKER */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold">Two-Round Progression Tracker</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official evaluation state verified by the Super Admin
                  </p>
                </div>
              </div>

              {/* Visual Tracker Graph */}
              <div className="relative space-y-4">
                {/* Step 1: Registration */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="w-0.5 h-16 bg-emerald-500/40 my-1" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground">
                      STAGE 1: REGISTRATION & VERIFICATION
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Team verified with ID {selectedTeam.teamId}. Payment verification:{" "}
                      <span className="font-bold text-emerald-400 uppercase">{selectedTeam.paymentStatus}</span>.
                    </p>
                  </div>
                </div>

                {/* Step 2: Round 1 Evaluation */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${r1Eval?.isSubmitted
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-muted border-border text-muted-foreground"
                        }`}
                    >
                      {r1Eval?.isSubmitted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div
                      className={`w-0.5 h-16 my-1 ${r1Eval?.isSubmitted ? "bg-emerald-500/40" : "bg-border"
                        }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground">
                      STAGE 2: ROUND 1 EVALUATION
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r1Eval?.isSubmitted
                        ? "Round 1 evaluation completed by jury panel. Awaiting Super Admin results publication."
                        : "Round 1 jury evaluation in progress."}
                    </p>
                  </div>
                </div>

                {/* Step 3: Round 1 Results (Branching Point) */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${r1Pub.isPublished
                        ? isR1Selected
                          ? "bg-cyan/20 border-cyan text-cyan"
                          : "bg-violet/20 border-violet text-violet"
                        : "bg-muted border-border text-muted-foreground"
                        }`}
                    >
                      {r1Pub.isPublished ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                    </div>
                    {isR1Selected && <div className="w-0.5 h-16 bg-cyan/40 my-1" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-semibold text-sm text-foreground">
                      STAGE 3: ROUND 1 OFFICIAL RESULTS
                    </h4>
                    {!r1Pub.isPublished ? (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Official Round 1 results have not yet been released.
                      </p>
                    ) : isR1Selected ? (
                      /* SELECTED FOR ROUND 2 CARD */
                      <div className="mt-3 p-5 rounded-2xl border border-cyan/40 bg-cyan/5 text-foreground space-y-2">
                        <div className="flex items-center gap-2 text-cyan font-bold text-sm">
                          <Sparkles className="h-4 w-4" /> CONGRATULATIONS!
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                          Your team has been selected for Round 2 of Hack With Avanthi 2026.
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Your innovation, creativity and technical performance have earned you a place in the next stage. Get ready for the next challenge!
                        </p>
                        <div className="pt-2">
                          <Badge className="bg-cyan text-slate-950 font-bold text-xs uppercase tracking-wider">
                            SELECTED FOR ROUND 2
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      /* NOT SELECTED CARD */
                      <div className="mt-3 p-5 rounded-2xl border border-border bg-muted/30 text-foreground space-y-2">
                        <div className="font-bold text-sm text-foreground">
                          YOUR ROUND 1 JOURNEY IS COMPLETE!
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Thank you for participating in Hack With Avanthi 2026.
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Your creativity, dedication and effort are appreciated. Although you haven't advanced to Round 2, you have been an important part of this event. Keep learning, building and innovating!
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="outline" className="border-border text-xs">
                            ROUND 1 COMPLETED – NOT SELECTED
                          </Badge>
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" /> Participation Certificate Available Below
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4 & 5: Only for Round 2 Qualified Teams */}
                {isR1Selected && (
                  <>
                    {/* Step 4: Round 2 Evaluation */}
                    <div className="flex gap-4 items-start mt-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${r2Eval?.isSubmitted
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "bg-muted border-border text-muted-foreground"
                            }`}
                        >
                          {r2Eval?.isSubmitted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div
                          className={`w-0.5 h-16 my-1 ${r2Eval?.isSubmitted ? "bg-emerald-500/40" : "bg-border"
                            }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm text-foreground">
                          STAGE 4: ROUND 2 EVALUATION
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r2Eval?.isSubmitted
                            ? "Round 2 evaluation completed by the Grand Jury. Final rankings are being tabulated."
                            : "Round 2 in-depth architecture and prototype pitching is active."}
                        </p>
                      </div>
                    </div>

                    {/* Step 5: Final Results Announcement */}
                    <div className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${finalPub.isPublished
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-muted border-border text-muted-foreground"
                            }`}
                        >
                          {finalPub.isPublished ? <Award className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-display font-semibold text-sm text-foreground">
                          STAGE 5: FINAL RESULTS & CEREMONY
                        </h4>
                        {!finalPub.isPublished ? (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Final results are being prepared for official release by the Super Admin.
                          </p>
                        ) : teamFinalResult?.position === "first_place" ? (
                          /* WINNER CARD */
                          <div className="mt-3 p-6 rounded-2xl border border-amber-400/50 bg-amber-500/10 text-foreground space-y-2">
                            <div className="text-amber-300 font-extrabold text-base flex items-center gap-2">
                              <Award className="h-5 w-5" /> CHAMPIONS OF HACK WITH AVANTHI 2026!
                            </div>
                            <p className="text-sm font-semibold text-amber-200">
                              Congratulations on securing FIRST PLACE!
                            </p>
                            <p className="text-xs leading-relaxed text-foreground/80">
                              Your innovation, technical excellence and dedication have made you the champions of Hack With Avanthi 2026.
                            </p>
                            <div className="pt-2">
                              <Badge className="bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                                GRAND WINNER — 1ST PLACE
                              </Badge>
                            </div>
                          </div>
                        ) : teamFinalResult?.position === "second_place" ? (
                          /* RUNNER UP CARD */
                          <div className="mt-3 p-6 rounded-2xl border border-cyan-400/50 bg-cyan-500/10 text-foreground space-y-2">
                            <div className="text-cyan-300 font-extrabold text-base flex items-center gap-2">
                              <Award className="h-5 w-5" /> OUTSTANDING ACHIEVEMENT!
                            </div>
                            <p className="text-sm font-semibold text-cyan-200">
                              Congratulations on securing SECOND PLACE!
                            </p>
                            <p className="text-xs leading-relaxed text-foreground/80">
                              Your creativity and determination have made an exceptional contribution to Hack With Avanthi 2026.
                            </p>
                            <div className="pt-2">
                              <Badge className="bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                                RUNNER UP — 2ND PLACE
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          /* OTHER ROUND 2 PARTICIPANT */
                          <div className="mt-3 p-6 rounded-2xl border border-violet-400/50 bg-violet-500/10 text-foreground space-y-2">
                            <div className="text-violet-300 font-extrabold text-base flex items-center gap-2">
                              <Award className="h-5 w-5" /> YOUR JOURNEY MATTERS!
                            </div>
                            <p className="text-xs leading-relaxed text-foreground/80">
                              Thank you for making it to Round 2 of Hack With Avanthi 2026.
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Your dedication and hard work are appreciated. Keep exploring, building and innovating!
                            </p>
                            <div className="pt-2">
                              <Badge variant="outline" className="border-violet-400 text-violet-300 text-xs">
                                ROUND 2 FINALIST
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ISSUED CREDENTIALS & CERTIFICATES */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-cyan" /> Verified Certificates
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official verified credentials for team members
                  </p>
                </div>
              </div>

              {teamCerts.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-40 text-cyan" />
                  Certificates are automatically generated and made available as soon as the respective round results are officially released by the Super Admin.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teamCerts.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl border border-border bg-background/50 hover:border-cyan/50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{cert.certificateId}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {cert.category.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="font-display font-bold text-base text-foreground">{cert.recipientName}</div>
                        <div className="text-xs text-muted-foreground">{cert.recipientEmail}</div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setActiveCert(cert)}
                          className="h-8 text-xs gap-1.5 bg-cyan text-slate-950 font-bold hover:bg-cyan/90"
                        >
                          <Download className="h-3.5 w-3.5" /> View & Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Certificate Viewer Modal */}
      <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />
    </div>
  );
}
