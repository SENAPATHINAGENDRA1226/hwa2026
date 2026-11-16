import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Shield,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  Search,
  ChevronRight,
  Filter,
  Download,
  Eye,
  SlidersHorizontal,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import {
  Team,
  Round1Evaluation,
  Round1Selection,
  Round2Evaluation,
  FinalResult,
  CertificateRecord,
  AuditLog,
} from "@/lib/types";
import { CertificateModal } from "@/components/hackathon/CertificateModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminCommandCenter,
});

function AdminCommandCenter() {
  // Super Admin Authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [r1Evals, setR1Evals] = useState<Round1Evaluation[]>([]);
  const [r1Selections, setR1Selections] = useState<Round1Selection[]>([]);
  const [r2Evals, setR2Evals] = useState<Round2Evaluation[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Publication Status
  const [r1Pub, setR1Pub] = useState(db.getRound1PublicationStatus());
  const [finalPub, setFinalPub] = useState(db.getFinalPublicationStatus());

  // Dialogs
  const [showR1ReleaseModal, setShowR1ReleaseModal] = useState(false);
  const [showFinalReleaseModal, setShowFinalReleaseModal] = useState(false);

  // Final Ranking Form State
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [runnerUpTeamId, setRunnerUpTeamId] = useState("");
  const [thirdPlaceTeamId, setThirdPlaceTeamId] = useState("");

  // Preview Certificate
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);

  // Payment Verification Dialog
  const [paymentReviewTeam, setPaymentReviewTeam] = useState<Team | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  // Filter & Search
  const [searchTeam, setSearchTeam] = useState("");
  const [r1Filter, setR1Filter] = useState<"all" | "selected" | "not_selected" | "pending">("all");

  const refreshAll = () => {
    setTeams(db.getTeams());
    setR1Evals(db.getRound1Evaluations());
    setR1Selections(db.getRound1Selections());
    setR2Evals(db.getRound2Evaluations());
    setFinalResults(db.getFinalResults());
    setCertificates(db.getCertificateRecords());
    setAuditLogs(db.getAuditLogs());
    setR1Pub(db.getRound1PublicationStatus());
    setFinalPub(db.getFinalPublicationStatus());
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("hwa_admin_auth");
      if (stored === "true") {
        setIsAdminAuthenticated(true);
      }
    }
    refreshAll();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = adminUsername.trim().toLowerCase();
    const pass = adminPassword.trim();

    if (user === "dlides" && pass === "admin@hwa") {
      setIsAdminAuthenticated(true);
      setAdminAuthError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hwa_admin_auth", "true");
      }
      toast.success("Authenticated as Super Admin");
    } else {
      setAdminAuthError("Access Denied: Invalid Super Admin ID or Passcode.");
      toast.error("Super Admin authentication failed");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUsername("");
    setAdminPassword("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hwa_admin_auth");
    }
    toast.info("Super Admin session closed.");
  };

  // Update existing selections on data load
  useEffect(() => {
    const existingWinner = finalResults.find((r) => r.position === "first_place");
    const existingRunnerUp = finalResults.find((r) => r.position === "second_place");
    const existingThird = finalResults.find((r) => r.position === "third_place");
    if (existingWinner) setWinnerTeamId(existingWinner.teamId);
    if (existingRunnerUp) setRunnerUpTeamId(existingRunnerUp.teamId);
    if (existingThird) setThirdPlaceTeamId(existingThird.teamId);
  }, [finalResults]);

  // Round 1 Selection Actions
  const handleToggleSelection = (teamId: string, currentStatus?: string) => {
    try {
      const nextStatus = currentStatus === "selected" ? "not_selected" : "selected";
      db.setRound1Selection(teamId, nextStatus, "Super Admin");
      refreshAll();
      toast.success(`Updated ${teamId} status to: ${nextStatus.replace("_", " ").toUpperCase()}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating selection");
    }
  };

  const handleSelectTopN = (count: number) => {
    try {
      // Sort teams by R1 score descending
      const scoredTeams = teams
        .map((t) => ({
          teamId: t.teamId,
          score: r1Evals.find((e) => e.teamId === t.teamId)?.totalScore ?? -1,
        }))
        .sort((a, b) => b.score - a.score);

      const topIds = scoredTeams.slice(0, count).map((t) => t.teamId);
      const otherIds = scoredTeams.slice(count).map((t) => t.teamId);

      db.batchSetRound1Selection(topIds, "selected", "Super Admin");
      db.batchSetRound1Selection(otherIds, "not_selected", "Super Admin");
      refreshAll();
      toast.success(`Selected Top ${count} teams for Round 2, marked remainder as Not Selected.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error in batch selection");
    }
  };

  const handleReleaseRound1 = () => {
    try {
      db.publishRound1Results("Super Admin");
      setShowR1ReleaseModal(false);
      refreshAll();
      toast.success("Round 1 Results RELEASED! Category A participation certificates generated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to release Round 1 results");
    }
  };

  // Final Results Actions
  const handleSaveFinalRankings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerTeamId || !runnerUpTeamId) {
      toast.error("Both Winner (1st) and Runner-Up (2nd) must be chosen.");
      return;
    }
    try {
      db.setFinalRankings(winnerTeamId, runnerUpTeamId, thirdPlaceTeamId || undefined, "Super Admin");
      refreshAll();
      toast.success("Final rankings verified & updated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save final rankings");
    }
  };

  const handleReleaseFinalResults = () => {
    try {
      db.publishFinalResults("Super Admin");
      setShowFinalReleaseModal(false);
      refreshAll();
      toast.success("FINAL RESULTS RELEASED! Category B winner & finalist certificates generated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to release final results");
    }
  };

  // Stats computed
  const selectedCount = r1Selections.filter((s) => s.status === "selected").length;
  const notSelectedCount = r1Selections.filter((s) => s.status === "not_selected").length;
  const pendingCount = teams.length - (selectedCount + notSelectedCount);

  const r2EligibleTeams = teams.filter((t) =>
    r1Selections.some((s) => s.teamId === t.teamId && s.status === "selected"),
  );

  // IF NOT AUTHENTICATED: SHOW SECURE SUPER ADMIN LOGIN GATE
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-card border border-red-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Lock className="h-8 w-8" />
          </div>

          <div className="text-center space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-semibold">
              Restricted Access
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Command Center Login
            </h1>
            <p className="text-xs text-muted-foreground">
              Super Admin authorization required. Students and participants are strictly prohibited.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono">Admin ID *</Label>
              <Input
                value={adminUsername}
                onChange={(e) => {
                  setAdminUsername(e.target.value);
                  if (adminAuthError) setAdminAuthError("");
                }}
                className="font-mono text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono">Super Admin Passcode *</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (adminAuthError) setAdminAuthError("");
                }}
                className="font-mono text-sm"
              />
            </div>

            {adminAuthError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider h-11 gap-2 shadow-lg"
            >
              <KeyRound className="h-4 w-4" /> Authenticate Super Admin
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Return to Main Arena
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Super Admin Top Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display font-black text-xl text-neon">
              HWA 2026
            </Link>
            <Badge className="bg-red-500/15 border-red-500/40 text-red-400 text-xs font-mono">
              SUPER ADMIN COMMAND CENTER
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/portal">
              <Button size="sm" variant="ghost" className="text-xs">
                Student Portal
              </Button>
            </Link>
            <Link to="/judge">
              <Button size="sm" variant="ghost" className="text-xs">
                Judge Portal
              </Button>
            </Link>
            <Link to="/results">
              <Button size="sm" variant="ghost" className="text-xs text-cyan">
                Public Results
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("Reset demo data to clean initial state?")) {
                  db.resetToDefault();
                  refreshAll();
                  toast.success("Database restored to initial state.");
                }
              }}
              className="text-xs h-8 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdminLogout}
              className="text-xs h-8 gap-1.5 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap w-full justify-start gap-1 bg-muted/40 p-1 rounded-xl h-auto">
            <TabsTrigger value="overview" className="text-xs font-semibold">
              Overview & Live Metrics
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-xs font-semibold">
              Registrations & Attendance ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="round1" className="text-xs font-semibold gap-1.5">
              <span>Round 1 Selection</span>
              {r1Pub.isPublished ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] h-4">RELEASED</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] h-4">
                  {selectedCount} Selected
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="round2" className="text-xs font-semibold gap-1.5">
              <span>Final Results & Podium</span>
              {finalPub.isPublished && (
                <Badge className="bg-amber-500/20 text-amber-400 text-[10px] h-4">RELEASED</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="certificates" className="text-xs font-semibold gap-1.5">
              <span>Certificates Hub ({certificates.length})</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs font-semibold">
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & LIVE METRICS                            */}
          {/* ======================================================== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground font-mono">Total Teams</span>
                <div className="text-3xl font-black font-display text-foreground mt-1">{teams.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Verified: {teams.filter((t) => t.paymentStatus === "verified").length}</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground font-mono">Round 1 Evaluated</span>
                <div className="text-3xl font-black font-display text-cyan mt-1">
                  {r1Evals.length} / {teams.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Status: {r1Pub.isPublished ? "Official Results Released" : "Awaiting Publication"}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground font-mono">Round 2 Finalists</span>
                <div className="text-3xl font-black font-display text-violet mt-1">
                  {selectedCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">R2 Evaluations: {r2Evals.length}</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground font-mono">Certificates Issued</span>
                <div className="text-3xl font-black font-display text-emerald-400 mt-1">
                  {certificates.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Recipients Assigned</div>
              </div>
            </div>

            {/* Stage Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan" /> Round 1 Stage Control
                  </h3>
                  <Badge variant={r1Pub.isPublished ? "default" : "outline"} className={r1Pub.isPublished ? "bg-emerald-500" : ""}>
                    {r1Pub.isPublished ? "RELEASED & LOCKED" : "EVALUATION & SELECTION PHASE"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Super Admin reviews all submitted Round 1 evaluations and manually approves teams advancing to Round 2. Once released, Category A participation certificates are auto-generated for non-selected teams.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("round1")}
                    className="bg-cyan hover:bg-cyan/90 text-slate-950 font-semibold text-xs"
                  >
                    Open Round 1 Selection Manager <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" /> Round 2 & Grand Finals Control
                  </h3>
                  <Badge variant={finalPub.isPublished ? "default" : "outline"} className={finalPub.isPublished ? "bg-amber-500" : ""}>
                    {finalPub.isPublished ? "RELEASED & PUBLISHED" : "DELIBERATION PHASE"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Grand Jury assesses Round 2 working prototypes. Super Admin assigns 1st Place (Champion) and 2nd Place (Runner-Up). Upon publication, Category B winner and finalist certificates are auto-generated.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("round2")}
                    className="bg-violet hover:bg-violet/90 text-white font-semibold text-xs"
                  >
                    Manage Final Rankings & Podium <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 2: TEAMS, PAYMENT CONFIRMATION & ATTENDANCE           */}
          {/* ======================================================== */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl">Team Management & Payment Approval</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify UPI payments, inspect receipts, approve registration status, and mark onsite attendance
                </p>
              </div>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Filter by Team ID, Name, or Leader..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Payment Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Filter by Payment:</span>
              <button
                onClick={() => setPaymentFilter("all")}
                className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${paymentFilter === "all"
                    ? "border-cyan bg-cyan/15 text-cyan"
                    : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                All Teams ({teams.length})
              </button>
              <button
                onClick={() => setPaymentFilter("pending")}
                className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${paymentFilter === "pending"
                    ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                Pending Approval ({teams.filter((t) => t.paymentStatus === "pending").length})
              </button>
              <button
                onClick={() => setPaymentFilter("verified")}
                className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${paymentFilter === "verified"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                    : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                Verified / Confirmed ({teams.filter((t) => t.paymentStatus === "verified").length})
              </button>
              <button
                onClick={() => setPaymentFilter("rejected")}
                className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${paymentFilter === "rejected"
                    ? "border-rose-500 bg-rose-500/15 text-rose-400"
                    : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                Rejected ({teams.filter((t) => t.paymentStatus === "rejected").length})
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border font-mono text-[11px] text-muted-foreground">
                    <tr>
                      <th className="p-4">TEAM ID</th>
                      <th className="p-4">TEAM NAME & THEME</th>
                      <th className="p-4">LEADER CONTACT</th>
                      <th className="p-4">UTR / TXN REF</th>
                      <th className="p-4">PAYMENT STATUS</th>
                      <th className="p-4">ATTENDANCE</th>
                      <th className="p-4 text-right">PAYMENT ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teams
                      .filter((t) => {
                        if (paymentFilter !== "all" && t.paymentStatus !== paymentFilter) return false;
                        if (!searchTeam) return true;
                        const q = searchTeam.toLowerCase();
                        return (
                          t.teamId.toLowerCase().includes(q) ||
                          t.teamName.toLowerCase().includes(q) ||
                          t.members[0]?.name.toLowerCase().includes(q) ||
                          (t.paymentTransactionId && t.paymentTransactionId.toLowerCase().includes(q))
                        );
                      })
                      .map((t) => (
                        <tr key={t.teamId} className="hover:bg-muted/20">
                          <td className="p-4 font-mono font-bold text-cyan">{t.teamId}</td>
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{t.teamName}</div>
                            <div className="text-[11px] text-muted-foreground">{t.theme} • {t.academicYear}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-foreground">{t.members[0]?.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {t.members[0]?.phone || t.members[0]?.email}
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            <span className="font-semibold text-foreground">
                              {t.paymentTransactionId || "N/A"}
                            </span>
                            <div className="text-[10px] text-muted-foreground">Amount: ₹500</div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${t.paymentStatus === "verified"
                                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold"
                                  : t.paymentStatus === "rejected"
                                    ? "border-rose-500 text-rose-400 bg-rose-500/10"
                                    : "border-amber-400 text-amber-300 bg-amber-400/10 font-bold"
                                }`}
                            >
                              {t.paymentStatus === "verified"
                                ? "CONFIRMED ✓"
                                : t.paymentStatus === "rejected"
                                  ? "REJECTED"
                                  : "PENDING APPROVAL"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  t.attendanceStatus === "checked_in"
                                    ? "border-emerald-500 text-emerald-400"
                                    : "border-muted text-muted-foreground"
                                }
                              >
                                {t.attendanceStatus === "checked_in" ? "CHECKED IN" : "PENDING"}
                              </Badge>
                              {t.attendanceStatus !== "checked_in" && (
                                <button
                                  onClick={() => {
                                    db.checkInTeam(t.teamId);
                                    refreshAll();
                                    toast.success(`Marked present: ${t.teamId}`);
                                  }}
                                  className="text-[11px] text-cyan hover:underline font-semibold"
                                >
                                  Check In
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPaymentReviewTeam(t)}
                                className="h-7 text-xs border-border hover:bg-muted"
                              >
                                Review Proof
                              </Button>
                              {t.paymentStatus !== "verified" ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    db.verifyPayment(t.teamId, "verified", "Super Admin");
                                    refreshAll();
                                    toast.success(`Payment CONFIRMED for Team ${t.teamName} (${t.teamId})`);
                                  }}
                                  className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                                >
                                  Confirm Payment
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    db.verifyPayment(t.teamId, "pending", "Super Admin");
                                    refreshAll();
                                    toast.info(`Reset payment status for ${t.teamId} to Pending`);
                                  }}
                                  className="h-7 text-[11px] text-muted-foreground hover:text-amber-400"
                                >
                                  Revert
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 3: ROUND 1 SELECTION MANAGEMENT                       */}
          {/* ======================================================== */}
          <TabsContent value="round1" className="space-y-6">
            {/* Header with Quick Actions & Release Button */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-cyan">Round 1 Selection</span>
                    {r1Pub.isPublished && (
                      <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                        RESULTS PUBLISHED
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-black">Round 1 Selection Management</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                    Review Round 1 jury marks and feedback. The Super Admin must manually approve advancing teams. No team is promoted purely on automated cutoff without approval.
                  </p>
                </div>

                {/* Release Button */}
                <div className="flex items-center gap-3">
                  {!r1Pub.isPublished ? (
                    <Button
                      size="lg"
                      onClick={() => setShowR1ReleaseModal(true)}
                      className="bg-cyan hover:bg-cyan/90 text-slate-950 font-black tracking-wider uppercase text-xs gap-2 shadow-lg glow-cyan"
                    >
                      <Send className="h-4 w-4" /> Release Round 1 Results
                    </Button>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 justify-end">
                        <CheckCircle2 className="h-4 w-4" /> Official Round 1 Results Released
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Published on {new Date(r1Pub.publishedAt || "").toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Counters & Batch Selection Toolbar */}
              <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">Selection Count:</span>
                  <Badge className="bg-cyan/20 border-cyan text-cyan text-xs">
                    {selectedCount} Selected for Round 2
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {notSelectedCount} Not Selected
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {pendingCount} Pending Review
                  </Badge>
                </div>

                {!r1Pub.isPublished && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Quick Action:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectTopN(3)}
                      className="h-7 text-xs"
                    >
                      Select Top 3
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectTopN(4)}
                      className="h-7 text-xs"
                    >
                      Select Top 4
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              {(["all", "selected", "not_selected", "pending"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setR1Filter(mode)}
                  className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${r1Filter === mode
                      ? "border-cyan bg-cyan/15 text-cyan"
                      : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {mode === "all"
                    ? `All Teams (${teams.length})`
                    : mode === "selected"
                      ? `Selected Preview (${selectedCount})`
                      : mode === "not_selected"
                        ? `Not Selected Preview (${notSelectedCount})`
                        : `Pending Review (${pendingCount})`}
                </button>
              ))}
            </div>

            {/* Team Evaluation Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border font-mono text-[11px] text-muted-foreground">
                    <tr>
                      <th className="p-4">TEAM ID</th>
                      <th className="p-4">TEAM NAME</th>
                      <th className="p-4">YEAR & THEME</th>
                      <th className="p-4">R1 SCORE</th>
                      <th className="p-4">JUDGE FEEDBACK</th>
                      <th className="p-4">SELECTION STATUS</th>
                      <th className="p-4 text-right">ADMIN DECISION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teams
                      .filter((t) => {
                        const sel = r1Selections.find((s) => s.teamId === t.teamId);
                        if (r1Filter === "selected") return sel?.status === "selected";
                        if (r1Filter === "not_selected") return sel?.status === "not_selected";
                        if (r1Filter === "pending") return !sel || sel.status === "pending_review";
                        return true;
                      })
                      .map((t) => {
                        const ev = r1Evals.find((e) => e.teamId === t.teamId);
                        const sel = r1Selections.find((s) => s.teamId === t.teamId);
                        const isSelected = sel?.status === "selected";
                        const isNotSelected = sel?.status === "not_selected";

                        return (
                          <tr key={t.teamId} className="hover:bg-muted/20">
                            <td className="p-4 font-mono font-bold text-cyan">{t.teamId}</td>
                            <td className="p-4 font-semibold text-foreground">{t.teamName}</td>
                            <td className="p-4 text-muted-foreground">
                              {t.academicYear} • {t.theme}
                            </td>
                            <td className="p-4">
                              {ev ? (
                                <Badge className="bg-cyan/15 border-cyan/40 text-cyan font-mono font-bold">
                                  {ev.totalScore} / 100
                                </Badge>
                              ) : (
                                <span className="font-mono text-muted-foreground">Pending</span>
                              )}
                            </td>
                            <td className="p-4 max-w-xs text-[11px] text-muted-foreground truncate">
                              {ev?.feedback || "No remarks entered yet"}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={`text-xs ${isSelected
                                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                                    : isNotSelected
                                      ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                                      : "border-amber-500 text-amber-400 bg-amber-500/10"
                                  }`}
                              >
                                {isSelected
                                  ? "Selected for Round 2"
                                  : isNotSelected
                                    ? "Not Selected for Round 2"
                                    : "Pending Review"}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              {!r1Pub.isPublished ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => handleToggleSelection(t.teamId, sel?.status)}
                                    className={`h-7 text-xs ${isSelected
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                                        : "border-border hover:border-emerald-500"
                                      }`}
                                  >
                                    {isSelected ? "Selected ✓" : "Promote"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      db.setRound1Selection(t.teamId, "not_selected", "Super Admin");
                                      refreshAll();
                                    }}
                                    className={`h-7 text-xs ${isNotSelected
                                        ? "border-rose-500 text-rose-400 bg-rose-500/10"
                                        : "border-border text-muted-foreground"
                                      }`}
                                  >
                                    Exclude
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground font-mono">Locked</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 4: FINAL RESULTS MANAGEMENT & PODIUM                  */}
          {/* ======================================================== */}
          <TabsContent value="round2" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-amber-400">Final Results Module</span>
                    {finalPub.isPublished && (
                      <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                        CHAMPIONS RELEASED
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-black">Final Results & Winner Finalization</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                    Select 1st Place (Winner) and 2nd Place (Runner-Up) from qualified Round 2 finalists. Enforces unique position constraints so no team occupies multiple podium spots.
                  </p>
                </div>

                {!finalPub.isPublished ? (
                  <Button
                    size="lg"
                    onClick={() => setShowFinalReleaseModal(true)}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black tracking-wider uppercase text-xs gap-2 shadow-lg"
                  >
                    <Award className="h-4 w-4" /> Release Final Results
                  </Button>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 justify-end font-bold">
                      <Award className="h-4 w-4" /> Official Final Results Released
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Published on {new Date(finalPub.publishedAt || "").toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Form for 1st & 2nd Place */}
            {r2EligibleTeams.length < 2 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs">
                Round 2 finalists have not been selected yet. Please promote at least 2 teams in the Round 1 Selection tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form
                  onSubmit={handleSaveFinalRankings}
                  className="bg-card border border-border rounded-2xl p-6 space-y-6 lg:col-span-1"
                >
                  <h3 className="font-display font-semibold text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" /> Assign Podium Positions
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-amber-300">
                      1st Place — GRAND WINNER *
                    </Label>
                    <Select
                      value={winnerTeamId}
                      onValueChange={setWinnerTeamId}
                      disabled={finalPub.isPublished}
                    >
                      <SelectTrigger className="font-semibold border-amber-400/40">
                        <SelectValue placeholder="Select Champion Team" />
                      </SelectTrigger>
                      <SelectContent>
                        {r2EligibleTeams.map((t) => (
                          <SelectItem key={t.teamId} value={t.teamId}>
                            {t.teamId} — {t.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-cyan-300">
                      2nd Place — RUNNER UP *
                    </Label>
                    <Select
                      value={runnerUpTeamId}
                      onValueChange={setRunnerUpTeamId}
                      disabled={finalPub.isPublished}
                    >
                      <SelectTrigger className="font-semibold border-cyan-400/40">
                        <SelectValue placeholder="Select Runner-Up Team" />
                      </SelectTrigger>
                      <SelectContent>
                        {r2EligibleTeams.map((t) => (
                          <SelectItem key={t.teamId} value={t.teamId}>
                            {t.teamId} — {t.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-violet-300">
                      3rd Place (Optional)
                    </Label>
                    <Select
                      value={thirdPlaceTeamId}
                      onValueChange={setThirdPlaceTeamId}
                      disabled={finalPub.isPublished}
                    >
                      <SelectTrigger className="font-semibold border-violet-400/40">
                        <SelectValue placeholder="None / Select 3rd Place" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {r2EligibleTeams.map((t) => (
                          <SelectItem key={t.teamId} value={t.teamId}>
                            {t.teamId} — {t.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!finalPub.isPublished && (
                    <Button type="submit" className="w-full bg-cyan hover:bg-cyan/90 text-slate-950 font-bold text-xs">
                      Save & Verify Podium Placement
                    </Button>
                  )}
                </form>

                {/* Round 2 Finalist Standings Table */}
                <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2 space-y-4">
                  <h3 className="font-display font-semibold text-base">Round 2 Finalists & Grand Jury Marks</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border font-mono text-[11px] text-muted-foreground">
                        <tr>
                          <th className="p-3">TEAM ID</th>
                          <th className="p-3">TEAM NAME</th>
                          <th className="p-3">R1 SCORE</th>
                          <th className="p-3">R2 SCORE</th>
                          <th className="p-3">ASSIGNED POSITION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {r2EligibleTeams.map((t) => {
                          const ev1 = r1Evals.find((e) => e.teamId === t.teamId);
                          const ev2 = r2Evals.find((e) => e.teamId === t.teamId);
                          const isWinner = winnerTeamId === t.teamId;
                          const isRunnerUp = runnerUpTeamId === t.teamId;
                          const isThird = thirdPlaceTeamId === t.teamId;

                          return (
                            <tr key={t.teamId} className="hover:bg-muted/20">
                              <td className="p-3 font-mono font-bold text-cyan">{t.teamId}</td>
                              <td className="p-3 font-semibold text-foreground">{t.teamName}</td>
                              <td className="p-3 font-mono text-muted-foreground">{ev1?.totalScore ?? "-"}</td>
                              <td className="p-3 font-mono font-bold text-violet">
                                {ev2 ? `${ev2.totalScore} / 100` : "Pending"}
                              </td>
                              <td className="p-3">
                                {isWinner ? (
                                  <Badge className="bg-amber-400 text-slate-950 font-black">
                                    1ST PLACE (WINNER)
                                  </Badge>
                                ) : isRunnerUp ? (
                                  <Badge className="bg-cyan text-slate-950 font-bold">
                                    2ND PLACE (RUNNER-UP)
                                  </Badge>
                                ) : isThird ? (
                                  <Badge className="bg-violet text-white">
                                    3RD PLACE
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Finalist
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 5: CERTIFICATES HUB                                   */}
          {/* ======================================================== */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl">Issued Credentials & Certificate Hub</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Category A (R1 Non-selected participation) and Category B (R2 Winner/Runner-up/Participation) credentials
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Bulk Print
                </Button>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="p-12 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs">
                No certificates issued yet. Certificates are automatically generated as soon as Round 1 or Final results are officially released.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border font-mono text-[11px] text-muted-foreground">
                      <tr>
                        <th className="p-4">CERTIFICATE ID</th>
                        <th className="p-4">RECIPIENT</th>
                        <th className="p-4">TEAM</th>
                        <th className="p-4">CATEGORY</th>
                        <th className="p-4">ISSUED DATE</th>
                        <th className="p-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {certificates.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="p-4 font-mono font-bold text-cyan">{c.certificateId}</td>
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{c.recipientName}</div>
                            <div className="text-[11px] text-muted-foreground">{c.recipientEmail}</div>
                          </td>
                          <td className="p-4 font-mono text-foreground">{c.teamName} ({c.teamId})</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {c.category.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(c.issuedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveCert(c)}
                              className="h-7 text-xs gap-1 border-cyan/40 hover:bg-cyan/10 hover:text-cyan"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 6: AUDIT LOGS                                         */}
          {/* ======================================================== */}
          <TabsContent value="audit" className="space-y-4">
            <h2 className="font-display font-bold text-xl">System Audit & Action Trail</h2>
            <div className="bg-card border border-border rounded-2xl p-4 divide-y divide-border max-h-150 overflow-y-auto">
              {auditLogs.map((l) => (
                <div key={l.id} className="py-3 flex items-start justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-cyan">{l.action}</span>
                    <span className="text-muted-foreground ml-2">by {l.performedBy}</span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {JSON.stringify(l.details)}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* CONFIRMATION MODAL: RELEASE ROUND 1 RESULTS */}
      <Dialog open={showR1ReleaseModal} onOpenChange={setShowR1ReleaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan font-display">
              <Send className="h-5 w-5" /> Confirm Round 1 Results Release
            </DialogTitle>
            <DialogDescription className="text-xs">
              Releasing Round 1 results will make qualification statuses public, lock Round 1 evaluations, and automatically issue Category A participation certificates to non-selected teams.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Participating Teams:</span>
              <span className="font-bold text-foreground">{teams.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Evaluations Completed:</span>
              <span className="font-bold text-cyan">{r1Evals.length} / {teams.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teams Selected for Round 2:</span>
              <span className="font-bold text-emerald-400">{selectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teams Not Selected:</span>
              <span className="font-bold text-rose-400">{notSelectedCount}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowR1ReleaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseRound1} className="bg-cyan hover:bg-cyan/90 text-slate-950 font-bold">
              Confirm & Release Round 1
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION MODAL: RELEASE FINAL RESULTS */}
      <Dialog open={showFinalReleaseModal} onOpenChange={setShowFinalReleaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400 font-display">
              <Award className="h-5 w-5" /> Confirm Final Results Release
            </DialogTitle>
            <DialogDescription className="text-xs">
              Releasing final results will announce the Grand Winner and Runner-Up publicly, lock Round 2 scoring, and issue official Category B credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">1st Place (Champion):</span>
              <span className="font-bold text-amber-300">{winnerTeamId || "NOT SELECTED"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">2nd Place (Runner-Up):</span>
              <span className="font-bold text-cyan-300">{runnerUpTeamId || "NOT SELECTED"}</span>
            </div>
            {thirdPlaceTeamId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">3rd Place:</span>
                <span className="font-bold text-violet-300">{thirdPlaceTeamId}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowFinalReleaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseFinalResults} className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold">
              Confirm & Release Champions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT PROOF & CONFIRMATION MODAL */}
      <Dialog
        open={!!paymentReviewTeam}
        onOpenChange={(open) => !open && setPaymentReviewTeam(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan font-display text-lg">
              <CheckCircle2 className="h-5 w-5" /> Manual Payment Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review transaction reference, beneficiary amount, and student receipt to confirm registration payment.
            </DialogDescription>
          </DialogHeader>

          {paymentReviewTeam && (
            <div className="space-y-4 py-2 text-xs">
              {/* Summary Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-bold text-foreground">
                    {paymentReviewTeam.teamName} ({paymentReviewTeam.teamId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Leader:</span>
                  <span className="font-semibold text-foreground">
                    {paymentReviewTeam.members[0]?.name} ({paymentReviewTeam.members[0]?.email})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp / Phone:</span>
                  <span className="font-mono text-cyan">
                    {paymentReviewTeam.members[0]?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR / Transaction ID:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {paymentReviewTeam.paymentTransactionId || "Not Provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Proof:</span>
                  <span className="font-bold text-foreground">Provided via UPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      paymentReviewTeam.paymentStatus === "verified"
                        ? "border-emerald-500 text-emerald-400"
                        : "border-amber-400 text-amber-300"
                    }
                  >
                    {paymentReviewTeam.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">
                  Uploaded Payment Proof / Screenshot
                </span>
                <div className="h-44 w-full rounded-xl border border-border/80 bg-black/60 flex items-center justify-center overflow-hidden p-2">
                  {paymentReviewTeam.paymentProofUrl &&
                    paymentReviewTeam.paymentProofUrl.startsWith("data:") ? (
                    <img
                      src={paymentReviewTeam.paymentProofUrl}
                      alt="Payment Receipt"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-1">
                      <FileCheck className="h-8 w-8 mx-auto text-cyan/60" />
                      <div className="text-xs text-foreground font-semibold">
                        Receipt Ref: {paymentReviewTeam.paymentTransactionId || "UPI-REF"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Proof on file • Payment received via UPI
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (paymentReviewTeam) {
                  db.verifyPayment(paymentReviewTeam.teamId, "rejected", "Super Admin");
                  refreshAll();
                  setPaymentReviewTeam(null);
                  toast.error(`Payment marked as REJECTED for ${paymentReviewTeam.teamId}`);
                }
              }}
              className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              Reject Payment
            </Button>
            <Button
              onClick={() => {
                if (paymentReviewTeam) {
                  db.verifyPayment(paymentReviewTeam.teamId, "verified", "Super Admin");
                  refreshAll();
                  setPaymentReviewTeam(null);
                  toast.success(`Payment CONFIRMED for ${paymentReviewTeam.teamName} (${paymentReviewTeam.teamId})`);
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
            >
              Approve & Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Viewer Modal */}
      <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />
    </div>
  );
}
