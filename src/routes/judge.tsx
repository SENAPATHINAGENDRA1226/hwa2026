import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Save,
  Shield,
  Star,
  Users,
  AlertCircle,
  FileText,
  BarChart3,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
  QrCode,
  Camera,
  CameraOff,
  Upload,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  UserCheck,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Team, Round1Evaluation, Round2Evaluation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/judge")({
  component: JudgePortalPage,
});

const VALID_JUDGES: Record<string, { name: string; pin: string }> = {
  "judge": { name: "Official Grand Jury", pin: "judge@hwa" },
};

function JudgePortalPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginId, setLoginId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [judgeName, setJudgeName] = useState("Dr. Arvind Swamy (Jury #1)");
  const [judgeId, setJudgeId] = useState("JURY-01");
  const [activeTab, setActiveTab] = useState<"round1" | "round2" | "attendance">("round1");

  // Round 1 State
  const [r1Teams, setR1Teams] = useState<Team[]>([]);
  const [r1SelectedTeamId, setR1SelectedTeamId] = useState<string>("");
  const [r1Innovation, setR1Innovation] = useState<number>(20);
  const [r1Problem, setR1Problem] = useState<number>(16);
  const [r1Feasibility, setR1Feasibility] = useState<number>(16);
  const [r1Implementation, setR1Implementation] = useState<number>(16);
  const [r1Presentation, setR1Presentation] = useState<number>(12);
  const [r1Feedback, setR1Feedback] = useState<string>("");
  const [r1Evaluations, setR1Evaluations] = useState<Round1Evaluation[]>([]);

  // Round 2 State
  const [r2EligibleTeams, setR2EligibleTeams] = useState<Team[]>([]);
  const [r2SelectedTeamId, setR2SelectedTeamId] = useState<string>("");
  const [r2Innovation, setR2Innovation] = useState<number>(20);
  const [r2Problem, setR2Problem] = useState<number>(16);
  const [r2Feasibility, setR2Feasibility] = useState<number>(16);
  const [r2Implementation, setR2Implementation] = useState<number>(16);
  const [r2Presentation, setR2Presentation] = useState<number>(12);
  const [r2Feedback, setR2Feedback] = useState<string>("");
  const [r2Evaluations, setR2Evaluations] = useState<Round2Evaluation[]>([]);

  const r1Pub = db.getRound1PublicationStatus();
  const finalPub = db.getFinalPublicationStatus();

  // Attendance Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScannedTeam, setLastScannedTeam] = useState<Team | null>(null);
  const [manualTeamInput, setManualTeamInput] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "present" | "pending">("all");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const html5QrCodeRef = useRef<any>(null);
  const lastScannedTimeRef = useRef<{ id: string; time: number }>({ id: "", time: 0 });

  // Check stored session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("hwa_judge_auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setJudgeId(parsed.id);
          setJudgeName(parsed.name);
          setIsAuthenticated(true);
        } catch { }
      }
    }
  }, []);

  // Load evaluation state
  const refreshData = () => {
    const teams = db.getTeams();
    setR1Teams(teams);
    const evals1 = db.getRound1Evaluations();
    setR1Evaluations(evals1);

    const selections = db.getRound1Selections();
    const selectedIds = selections.filter((s) => s.status === "selected").map((s) => s.teamId);
    const eligibleR2 = teams.filter((t) => selectedIds.includes(t.teamId));
    setR2EligibleTeams(eligibleR2);

    const evals2 = db.getRound2Evaluations();
    setR2Evaluations(evals2);

    if (!r1SelectedTeamId && teams.length > 0) {
      setR1SelectedTeamId(teams[0]?.teamId || "");
      loadR1TeamEval(teams[0]?.teamId || "");
    }
    if (!r2SelectedTeamId && eligibleR2.length > 0) {
      setR2SelectedTeamId(eligibleR2[0]?.teamId || "");
      loadR2TeamEval(eligibleR2[0]?.teamId || "");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const idKey = loginId.trim().toLowerCase();
    const pin = loginPin.trim();

    if (!idKey || !pin) {
      setAuthError("Please enter both Judge ID and Passcode.");
      return;
    }

    const judgeConfig = VALID_JUDGES[idKey];
    if (judgeConfig && judgeConfig.pin === pin) {
      const sessionData = { id: idKey.toUpperCase(), name: judgeConfig.name };
      setJudgeId(sessionData.id);
      setJudgeName(sessionData.name);
      setIsAuthenticated(true);
      setAuthError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hwa_judge_auth", JSON.stringify(sessionData));
      }
      toast.success(`Authenticated as ${judgeConfig.name}`);
    } else {
      setAuthError("Invalid Judge ID or Passcode. Access restricted to authorized evaluation jury.");
      toast.error("Authentication failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginId("");
    setLoginPin("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hwa_judge_auth");
    }
    toast.info("Judge session ended.");
  };

  const loadR1TeamEval = (teamId: string) => {
    const existing = db.getRound1EvaluationForTeam(teamId);
    if (existing) {
      setR1Innovation(existing.criteria.innovation);
      setR1Problem(existing.criteria.problemUnderstanding);
      setR1Feasibility(existing.criteria.technicalFeasibility);
      setR1Implementation(existing.criteria.practicalImplementation);
      setR1Presentation(existing.criteria.presentation);
      setR1Feedback(existing.feedback || "");
    } else {
      setR1Innovation(20);
      setR1Problem(16);
      setR1Feasibility(16);
      setR1Implementation(16);
      setR1Presentation(12);
      setR1Feedback("");
    }
  };

  const loadR2TeamEval = (teamId: string) => {
    const existing = db.getRound2EvaluationForTeam(teamId);
    if (existing) {
      setR2Innovation(existing.criteria.innovation);
      setR2Problem(existing.criteria.problemUnderstanding);
      setR2Feasibility(existing.criteria.technicalFeasibility);
      setR2Implementation(existing.criteria.practicalImplementation);
      setR2Presentation(existing.criteria.presentation);
      setR2Feedback(existing.feedback || "");
    } else {
      setR2Innovation(20);
      setR2Problem(16);
      setR2Feasibility(16);
      setR2Implementation(16);
      setR2Presentation(12);
      setR2Feedback("");
    }
  };

  const handleR1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!r1SelectedTeamId) {
      toast.error("Please select a team to evaluate.");
      return;
    }
    try {
      db.saveRound1Evaluation({
        teamId: r1SelectedTeamId,
        judgeName,
        judgeId,
        criteria: {
          innovation: Number(r1Innovation),
          problemUnderstanding: Number(r1Problem),
          technicalFeasibility: Number(r1Feasibility),
          practicalImplementation: Number(r1Implementation),
          presentation: Number(r1Presentation),
        },
        feedback: r1Feedback.trim(),
        isSubmitted: true,
      });
      toast.success(`Round 1 evaluation recorded for ${r1SelectedTeamId}`);
      refreshData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving evaluation");
    }
  };

  const handleR2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!r2SelectedTeamId) {
      toast.error("Please select an eligible Round 2 team.");
      return;
    }
    try {
      db.saveRound2Evaluation({
        teamId: r2SelectedTeamId,
        judgeName,
        judgeId,
        criteria: {
          innovation: Number(r2Innovation),
          problemUnderstanding: Number(r2Problem),
          technicalFeasibility: Number(r2Feasibility),
          practicalImplementation: Number(r2Implementation),
          presentation: Number(r2Presentation),
        },
        feedback: r2Feedback.trim(),
        isSubmitted: true,
      });
      toast.success(`Round 2 evaluation recorded for ${r2SelectedTeamId}`);
      refreshData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving evaluation");
    }
  };

  // Web Audio chime for attendance scan confirmation
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch { }
  };

  const parseTeamIdFromScan = (rawText: string): string | null => {
    if (!rawText) return null;
    const trimmed = rawText.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.teamId) return String(parsed.teamId).toUpperCase();
    } catch { }
    const match = trimmed.match(/HWA-2026-\d+/i);
    if (match) return match[0].toUpperCase();
    const all = db.getTeams();
    const found = all.find((t) => t.teamId.toLowerCase() === trimmed.toLowerCase());
    if (found) return found.teamId;
    return null;
  };

  const handleProcessCheckIn = (input: string) => {
    const teamId = parseTeamIdFromScan(input);
    if (!teamId) {
      toast.error(`Invalid QR pass. Could not detect a valid Team ID from scanned data.`);
      return false;
    }

    // Debounce scans within 3 seconds for the same team
    const now = Date.now();
    if (lastScannedTimeRef.current.id === teamId && now - lastScannedTimeRef.current.time < 3000) {
      return true;
    }
    lastScannedTimeRef.current = { id: teamId, time: now };

    const team = db.getTeam(teamId);
    if (!team) {
      toast.error(`Team "${teamId}" is not registered in the system.`);
      return false;
    }

    playBeep();

    if (team.attendanceStatus === "checked_in") {
      toast.info(`Team ${team.teamName} (${team.teamId}) is already marked PRESENT.`);
      setLastScannedTeam(team);
      return true;
    }

    db.checkInTeam(team.teamId, judgeName);
    toast.success(`PRESENT: Team ${team.teamName} (${team.teamId}) marked PRESENT!`);
    setLastScannedTeam({ ...team, attendanceStatus: "checked_in" });
    refreshData();
    return true;
  };

  const startCameraScanner = async () => {
    try {
      setIsScanning(true);
      setScanError("");
      const { Html5Qrcode } = await import("html5-qrcode");
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch { }
      }
      const qrScanner = new Html5Qrcode("judge-qr-reader");
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleProcessCheckIn(decodedText);
        },
        () => { }
      );
    } catch (err: unknown) {
      console.error(err);
      setIsScanning(false);
      setScanError(
        "Camera access not granted or not supported in this environment. Use 'Upload QR Image' or manual Team ID entry.",
      );
      toast.error("Camera access failed or denied");
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch { }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => { });
        } catch { }
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "attendance" && isScanning) {
      stopCameraScanner();
    }
  }, [activeTab]);

  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info("Scanning QR code image file...");
      const { Html5Qrcode } = await import("html5-qrcode");
      const tempScanner = new Html5Qrcode("judge-qr-file-hidden");
      const decodedText = await tempScanner.scanFile(file, true);
      handleProcessCheckIn(decodedText);
    } catch (err) {
      console.error(err);
      toast.error("Could not find a valid QR code in this image. Please ensure the image is clear.");
    }
    e.target.value = "";
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTeamInput.trim()) {
      toast.error("Please enter a Team ID.");
      return;
    }
    const success = handleProcessCheckIn(manualTeamInput.trim());
    if (success) {
      setManualTeamInput("");
    }
  };

  const selectedR1Team = r1Teams.find((t) => t.teamId === r1SelectedTeamId);
  const selectedR2Team = r2EligibleTeams.find((t) => t.teamId === r2SelectedTeamId);

  const r1TotalScore =
    Number(r1Innovation) +
    Number(r1Problem) +
    Number(r1Feasibility) +
    Number(r1Implementation) +
    Number(r1Presentation);

  const r2TotalScore =
    Number(r2Innovation) +
    Number(r2Problem) +
    Number(r2Feasibility) +
    Number(r2Implementation) +
    Number(r2Presentation);

  const r1AvgScore =
    r1Evaluations.length > 0
      ? (r1Evaluations.reduce((acc, curr) => acc + curr.totalScore, 0) / r1Evaluations.length).toFixed(1)
      : "0";

  const r2AvgScore =
    r2Evaluations.length > 0
      ? (r2Evaluations.reduce((acc, curr) => acc + curr.totalScore, 0) / r2Evaluations.length).toFixed(1)
      : "0";

  // Attendance computed values (must be before return)
  const filteredAttendanceTeams = r1Teams.filter((t) => {
    if (attendanceFilter === "present" && t.attendanceStatus !== "checked_in") return false;
    if (attendanceFilter === "pending" && t.attendanceStatus === "checked_in") return false;
    if (!attendanceSearch.trim()) return true;
    const query = attendanceSearch.toLowerCase();
    return (
      t.teamId.toLowerCase().includes(query) ||
      t.teamName.toLowerCase().includes(query) ||
      t.members.some((m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query))
    );
  });

  // IF NOT AUTHENTICATED: SHOW SECURE JUDGE LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet">
            <Lock className="h-8 w-8" />
          </div>

          <div className="text-center space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-violet font-semibold">
              Jury Access Only
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Judge Portal Login
            </h1>
            <p className="text-xs text-muted-foreground">
              Evaluation access is restricted to appointed HWA 2026 jury members. Students are not permitted.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono">Judge ID *</Label>
              <Input
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (authError) setAuthError("");
                }}
                className="font-mono uppercase text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono">Security Passcode *</Label>
              <Input
                type="password"
                value={loginPin}
                onChange={(e) => {
                  setLoginPin(e.target.value);
                  if (authError) setAuthError("");
                }}
                className="font-mono text-sm"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-violet hover:bg-violet/90 text-white font-bold text-xs uppercase tracking-wider h-11 gap-2"
            >
              <KeyRound className="h-4 w-4" /> Authenticate as Judge
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

  // AUTHENTICATED JUDGE INTERFACE
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display font-black text-xl text-neon">
              HWA 2026
            </Link>
            <Badge className="bg-violet/20 border-violet text-violet text-xs font-mono">
              JUDGING PORTAL
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-border text-xs hidden sm:inline font-mono">
              {judgeId} • {judgeName}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Hidden file scanner anchor for static image decoding */}
        <div id="judge-qr-file-hidden" className="hidden" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evaluation & Attendance Hub
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Scoring workflows for Round 1 & Round 2, plus Live QR Attendance Scanner for team check-in
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "round1" | "round2" | "attendance")}>
          <TabsList className="grid w-full sm:w-135 grid-cols-3 mb-6">
            <TabsTrigger value="round1" className="font-display font-semibold text-xs gap-1.5">
              <span>Round 1</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {r1Evaluations.length}/{r1Teams.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="round2" className="font-display font-semibold text-xs gap-1.5">
              <span>Round 2</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {r2Evaluations.length}/{r2EligibleTeams.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="font-display font-semibold text-xs gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-cyan" />
              <span>QR Scanner</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {r1Teams.filter((t) => t.attendanceStatus === "checked_in").length}/{r1Teams.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ======================================================== */}
          {/* ROUND 1 EVALUATION TAB                                    */}
          {/* ======================================================== */}
          <TabsContent value="round1" className="space-y-6">
            {/* Round 1 Dashboard Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Total Teams</span>
                <div className="text-2xl font-black font-display text-foreground mt-1">{r1Teams.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Completed</span>
                <div className="text-2xl font-black font-display text-emerald-400 mt-1">{r1Evaluations.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Pending</span>
                <div className="text-2xl font-black font-display text-amber-400 mt-1">
                  {Math.max(0, r1Teams.length - r1Evaluations.length)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Avg Score</span>
                <div className="text-2xl font-black font-display text-cyan mt-1">{r1AvgScore} / 100</div>
              </div>
            </div>

            {r1Pub.isPublished && (
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Round 1 results have been officially released. Scoring is now locked for this round.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleR1Submit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <Label htmlFor="r1TeamSelect" className="text-xs font-mono uppercase text-muted-foreground">
                        Select Team to Evaluate
                      </Label>
                      <Select
                        value={r1SelectedTeamId}
                        onValueChange={(val) => {
                          setR1SelectedTeamId(val);
                          loadR1TeamEval(val);
                        }}
                      >
                        <SelectTrigger id="r1TeamSelect" className="w-full sm:w-72 font-semibold">
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {r1Teams.map((t) => {
                            const isDone = r1Evaluations.some((e) => e.teamId === t.teamId);
                            return (
                              <SelectItem key={t.teamId} value={t.teamId}>
                                {isDone ? "✓ " : "○ "} {t.teamId} — {t.teamName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Computed Score</span>
                      <div className="text-3xl font-black font-display text-cyan">{r1TotalScore} / 100</div>
                    </div>
                  </div>

                  {/* Team Details Banner */}
                  {selectedR1Team && (
                    <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-sm">{selectedR1Team.teamName}</span>
                        <Badge variant="outline" className="border-cyan text-cyan">
                          {selectedR1Team.theme}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        Leader: {selectedR1Team.members[0]?.name} ({selectedR1Team.members[0]?.email}) • Academic Year:{" "}
                        {selectedR1Team.academicYear}
                      </div>
                      <div className="flex gap-2 text-[11px] text-muted-foreground pt-1">
                        <span>Roster:</span>
                        {selectedR1Team.members.map((m, i) => (
                          <span key={i} className="font-mono text-foreground/80">
                            {m.name}
                            {i < selectedR1Team.members.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rubric Criteria 5 items totaling 100% */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-sm">Round 1 Evaluation Criteria (100% Total)</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>1. Innovation & Creativity (25%)</span>
                        <span className="font-mono font-bold text-cyan">{r1Innovation} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={r1Innovation}
                        onChange={(e) => setR1Innovation(Number(e.target.value))}
                        disabled={r1Pub.isPublished}
                        className="w-full accent-cyan"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>2. Problem Understanding (20%)</span>
                        <span className="font-mono font-bold text-cyan">{r1Problem} / 20 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={r1Problem}
                        onChange={(e) => setR1Problem(Number(e.target.value))}
                        disabled={r1Pub.isPublished}
                        className="w-full accent-cyan"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>3. Technical Feasibility (20%)</span>
                        <span className="font-mono font-bold text-cyan">{r1Feasibility} / 20 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={r1Feasibility}
                        onChange={(e) => setR1Feasibility(Number(e.target.value))}
                        disabled={r1Pub.isPublished}
                        className="w-full accent-cyan"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>4. Practical Implementation (20%)</span>
                        <span className="font-mono font-bold text-cyan">{r1Implementation} / 20 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={r1Implementation}
                        onChange={(e) => setR1Implementation(Number(e.target.value))}
                        disabled={r1Pub.isPublished}
                        className="w-full accent-cyan"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>5. Presentation & Communication (15%)</span>
                        <span className="font-mono font-bold text-cyan">{r1Presentation} / 15 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={r1Presentation}
                        onChange={(e) => setR1Presentation(Number(e.target.value))}
                        disabled={r1Pub.isPublished}
                        className="w-full accent-cyan"
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label htmlFor="r1Feedback" className="text-xs">
                      Jury Observations & Feedback
                    </Label>
                    <Textarea
                      id="r1Feedback"
                      placeholder="Add constructive technical remarks, architectural strengths, and areas for improvement..."
                      value={r1Feedback}
                      onChange={(e) => setR1Feedback(e.target.value)}
                      disabled={r1Pub.isPublished}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={r1Pub.isPublished}
                    className="w-full bg-cyan hover:bg-cyan/90 text-slate-950 font-bold gap-2"
                  >
                    <Save className="h-4 w-4" /> Save Round 1 Evaluation
                  </Button>
                </form>
              </div>

              {/* Leaderboard / Scored Teams List */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h3 className="font-display font-semibold text-sm mb-3">Round 1 Scores Overview</h3>
                  <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                    {r1Teams.map((t) => {
                      const ev = r1Evaluations.find((e) => e.teamId === t.teamId);
                      return (
                        <div
                          key={t.teamId}
                          onClick={() => {
                            setR1SelectedTeamId(t.teamId);
                            loadR1TeamEval(t.teamId);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${r1SelectedTeamId === t.teamId
                            ? "border-cyan bg-cyan/10"
                            : "border-border hover:bg-muted/40"
                            }`}
                        >
                          <div>
                            <div className="font-bold text-foreground">{t.teamName}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{t.teamId}</div>
                          </div>
                          <div>
                            {ev ? (
                              <Badge className="bg-emerald-500/15 border-emerald-500 text-emerald-400 font-mono">
                                {ev.totalScore} pts
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* ROUND 2 EVALUATION TAB (Restricted to Selected Teams)     */}
          {/* ======================================================== */}
          <TabsContent value="round2" className="space-y-6">
            {/* Round 2 Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Round 2 Finalists</span>
                <div className="text-2xl font-black font-display text-foreground mt-1">{r2EligibleTeams.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Evaluations Completed</span>
                <div className="text-2xl font-black font-display text-emerald-400 mt-1">{r2Evaluations.length}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Pending Evaluations</span>
                <div className="text-2xl font-black font-display text-amber-400 mt-1">
                  {Math.max(0, r2EligibleTeams.length - r2Evaluations.length)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Avg R2 Score</span>
                <div className="text-2xl font-black font-display text-violet mt-1">{r2AvgScore} / 100</div>
              </div>
            </div>

            {r2EligibleTeams.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
                <Shield className="h-10 w-10 mx-auto text-amber-400 opacity-60" />
                <h3 className="font-display font-bold text-lg">No Teams Selected for Round 2 Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Only teams selected by the Super Admin in the Round 1 Selection Management module appear in Round 2.
                  Please complete Round 1 scoring and release Round 1 results first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <form onSubmit={handleR2Submit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                      <div className="space-y-1">
                        <Label htmlFor="r2TeamSelect" className="text-xs font-mono uppercase text-muted-foreground">
                          Select Round 2 Eligible Team
                        </Label>
                        <Select
                          value={r2SelectedTeamId}
                          onValueChange={(val) => {
                            setR2SelectedTeamId(val);
                            loadR2TeamEval(val);
                          }}
                        >
                          <SelectTrigger id="r2TeamSelect" className="w-full sm:w-72 font-semibold">
                            <SelectValue placeholder="Select Finalist" />
                          </SelectTrigger>
                          <SelectContent>
                            {r2EligibleTeams.map((t) => {
                              const isDone = r2Evaluations.some((e) => e.teamId === t.teamId);
                              return (
                                <SelectItem key={t.teamId} value={t.teamId}>
                                  {isDone ? "✓ " : "○ "} {t.teamId} — {t.teamName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Computed R2 Score</span>
                        <div className="text-3xl font-black font-display text-violet">{r2TotalScore} / 100</div>
                      </div>
                    </div>

                    {/* Team Details */}
                    {selectedR2Team && (
                      <div className="p-4 rounded-xl border border-violet/30 bg-violet/5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-sm">{selectedR2Team.teamName}</span>
                          <Badge className="bg-violet text-white text-[10px]">ROUND 2 FINALIST</Badge>
                        </div>
                        <div className="text-muted-foreground">Theme: {selectedR2Team.theme}</div>
                      </div>
                    )}

                    {/* Rubric Criteria for Round 2 */}
                    <div className="space-y-4">
                      <h3 className="font-display font-semibold text-sm">Round 2 Grand Jury Matrix (100% Total)</h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>1. Innovation & Creativity (25%)</span>
                          <span className="font-mono font-bold text-violet">{r2Innovation} / 25 pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={r2Innovation}
                          onChange={(e) => setR2Innovation(Number(e.target.value))}
                          disabled={finalPub.isPublished}
                          className="w-full accent-violet"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>2. Problem Understanding (20%)</span>
                          <span className="font-mono font-bold text-violet">{r2Problem} / 20 pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={r2Problem}
                          onChange={(e) => setR2Problem(Number(e.target.value))}
                          disabled={finalPub.isPublished}
                          className="w-full accent-violet"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>3. Technical Feasibility (20%)</span>
                          <span className="font-mono font-bold text-violet">{r2Feasibility} / 20 pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={r2Feasibility}
                          onChange={(e) => setR2Feasibility(Number(e.target.value))}
                          disabled={finalPub.isPublished}
                          className="w-full accent-violet"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>4. Practical Implementation (20%)</span>
                          <span className="font-mono font-bold text-violet">{r2Implementation} / 20 pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={r2Implementation}
                          onChange={(e) => setR2Implementation(Number(e.target.value))}
                          disabled={finalPub.isPublished}
                          className="w-full accent-violet"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>5. Presentation & Communication (15%)</span>
                          <span className="font-mono font-bold text-violet">{r2Presentation} / 15 pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={r2Presentation}
                          onChange={(e) => setR2Presentation(Number(e.target.value))}
                          disabled={finalPub.isPublished}
                          className="w-full accent-violet"
                        />
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                      <Label htmlFor="r2Feedback" className="text-xs">
                        Grand Jury Final Deliberation Notes
                      </Label>
                      <Textarea
                        id="r2Feedback"
                        placeholder="Remarks regarding podium eligibility, technical breakthroughs, and final ranking justification..."
                        value={r2Feedback}
                        onChange={(e) => setR2Feedback(e.target.value)}
                        disabled={finalPub.isPublished}
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={finalPub.isPublished}
                      className="w-full bg-violet hover:bg-violet/90 text-white font-bold gap-2"
                    >
                      <Save className="h-4 w-4" /> Save Round 2 Evaluation
                    </Button>
                  </form>
                </div>

                {/* Round 2 Team Scores */}
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="font-display font-semibold text-sm mb-3">Round 2 Standings</h3>
                    <div className="space-y-2">
                      {r2EligibleTeams.map((t) => {
                        const ev = r2Evaluations.find((e) => e.teamId === t.teamId);
                        return (
                          <div
                            key={t.teamId}
                            onClick={() => {
                              setR2SelectedTeamId(t.teamId);
                              loadR2TeamEval(t.teamId);
                            }}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${r2SelectedTeamId === t.teamId
                              ? "border-violet bg-violet/10"
                              : "border-border hover:bg-muted/40"
                              }`}
                          >
                            <div>
                              <div className="font-bold text-foreground">{t.teamName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{t.teamId}</div>
                            </div>
                            <div>
                              {ev ? (
                                <Badge className="bg-violet/20 border-violet text-violet font-mono">
                                  {ev.totalScore} pts
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ======================================================== */}
          {/* QR ATTENDANCE SCANNER TAB                                */}
          {/* ======================================================== */}
          <TabsContent value="attendance" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <span className="text-xs text-muted-foreground font-mono">Total Teams</span>
                <div className="text-2xl font-black font-display text-foreground mt-1">{r1Teams.length}</div>
                <span className="text-[11px] text-muted-foreground">Registered squads</span>
              </div>
              <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4">
                <span className="text-xs text-emerald-400 font-mono">Checked In (Present)</span>
                <div className="text-2xl font-black font-display text-emerald-400 mt-1">
                  {r1Teams.filter((t) => t.attendanceStatus === "checked_in").length}
                </div>
                <span className="text-[11px] text-emerald-400/80">
                  {r1Teams.length > 0
                    ? Math.round((r1Teams.filter((t) => t.attendanceStatus === "checked_in").length / r1Teams.length) * 100)
                    : 0}
                  % Turnout
                </span>
              </div>
              <div className="bg-card border border-amber-500/30 bg-amber-500/5 rounded-xl p-4">
                <span className="text-xs text-amber-300 font-mono">Pending Check-in</span>
                <div className="text-2xl font-black font-display text-amber-300 mt-1">
                  {r1Teams.filter((t) => t.attendanceStatus !== "checked_in").length}
                </div>
                <span className="text-[11px] text-amber-300/80">Awaiting desk arrival</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-mono">Scanner Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${isScanning ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {isScanning ? "Camera Active" : "Standby"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-cyan" /> Audio Chime Enabled
                </span>
              </div>
            </div>

            {/* Scanner Controls & Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Camera & Scanner Interface */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-cyan" />
                      <h3 className="font-display font-semibold text-sm">QR Code Camera Scanner</h3>
                    </div>
                    {isScanning && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                        Scanning Live
                      </Badge>
                    )}
                  </div>

                  {/* Camera Viewport / Placeholder */}
                  <div className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center">
                    {/* HTML5 QR Code Mount point */}
                    <div id="judge-qr-reader" className="w-full h-full" />

                    {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90">
                        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-cyan/40 bg-cyan/5 mb-3">
                          <QrCode className="h-8 w-8 text-cyan animate-pulse" />
                          <div className="absolute inset-0 rounded-2xl border border-cyan/20 animate-ping opacity-30" />
                        </div>
                        <p className="font-display font-semibold text-sm text-foreground">
                          Camera Scanner Is In Standby
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                          Click below to start your device camera and scan student attendance passes.
                        </p>
                        <Button
                          onClick={startCameraScanner}
                          className="mt-4 gap-2 bg-cyan text-slate-950 font-bold hover:bg-cyan/90 h-9 text-xs"
                        >
                          <Camera className="h-4 w-4" /> Start Camera Scanner
                        </Button>
                      </div>
                    )}

                    {isScanning && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-cyan glow-cyan animate-scan shadow-[0_0_12px_rgba(0,229,255,0.8)]" />
                    )}
                  </div>

                  {scanError && (
                    <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                      {scanError}
                    </div>
                  )}

                  {/* Scanner Action Controls */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {isScanning ? (
                      <Button
                        variant="destructive"
                        onClick={stopCameraScanner}
                        className="flex-1 gap-2 h-9 text-xs"
                      >
                        <CameraOff className="h-4 w-4" /> Stop Camera
                      </Button>
                    ) : (
                      <Button
                        onClick={startCameraScanner}
                        className="flex-1 gap-2 bg-cyan text-slate-950 font-bold hover:bg-cyan/90 h-9 text-xs"
                      >
                        <Camera className="h-4 w-4" /> Open Camera
                      </Button>
                    )}

                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 h-9 text-xs border-border hover:bg-muted"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 text-cyan" /> Upload QR Image
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Instant Manual Team Check-in / Barcode Gun Fallback */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
                  <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-cyan" /> Fast Check-In / Barcode Gun
                  </h4>
                  <form onSubmit={handleManualCheckIn} className="flex gap-2">
                    <Input
                      placeholder="e.g. HWA-2026-101"
                      value={manualTeamInput}
                      onChange={(e) => setManualTeamInput(e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                    <Button
                      type="submit"
                      className="bg-cyan text-slate-950 font-bold hover:bg-cyan/90 text-xs shrink-0 px-4"
                    >
                      Check In
                    </Button>
                  </form>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Hardware barcode scanners and manual Team IDs automatically mark the team present on Enter.
                  </p>
                </div>
              </div>

              {/* Right Column: Last Scanned Confirmation & Live Roster */}
              <div className="lg:col-span-7 space-y-4">
                {/* Last Scanned Team Confirmation Alert */}
                {lastScannedTeam && (
                  <div className="p-5 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-foreground relative overflow-hidden shadow-lg animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>ATTENDANCE RECORDED — PRESENT</span>
                      </div>
                      <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase">
                        SUCCESS
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-mono">Team ID</span>
                        <div className="font-mono text-base font-bold text-foreground">
                          {lastScannedTeam.teamId}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-mono">Team Name</span>
                        <div className="font-display text-base font-bold text-foreground">
                          {lastScannedTeam.teamName}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-mono">Theme / Track</span>
                        <div className="text-foreground font-medium">{lastScannedTeam.theme || "Open Innovation"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-mono">Year & Branch</span>
                        <div className="text-foreground font-medium">
                          {lastScannedTeam.academicYear} • CSM / CSD
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs">
                      <span className="text-muted-foreground text-[10px] uppercase font-mono">Team Participants ({lastScannedTeam.members.length}):</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {lastScannedTeam.members.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 bg-black/40 border border-emerald-500/30 text-emerald-300 text-[11px]"
                          >
                            <span className="font-semibold">{m.name}</span>
                            {idx === 0 && <span className="text-[9px] text-cyan">(Leader)</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Roster Filter & List */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm">Attendance Roster</h3>
                      <p className="text-xs text-muted-foreground">
                        Live participant verification and manual status controls
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg text-xs">
                      <button
                        onClick={() => setAttendanceFilter("all")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${attendanceFilter === "all"
                          ? "bg-cyan text-slate-950 shadow"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        All ({r1Teams.length})
                      </button>
                      <button
                        onClick={() => setAttendanceFilter("present")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${attendanceFilter === "present"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Present ({r1Teams.filter((t) => t.attendanceStatus === "checked_in").length})
                      </button>
                      <button
                        onClick={() => setAttendanceFilter("pending")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${attendanceFilter === "pending"
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Pending ({r1Teams.filter((t) => t.attendanceStatus !== "checked_in").length})
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Team ID, team name, or student participant name..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  {/* Team List Table */}
                  <div className="border border-border rounded-xl overflow-hidden max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] sticky top-0 z-10 backdrop-blur">
                        <tr>
                          <th className="p-3">Team</th>
                          <th className="p-3 hidden sm:table-cell">Members</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAttendanceTeams.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-muted-foreground">
                              No teams found matching current criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredAttendanceTeams.map((t) => {
                            const isPresent = t.attendanceStatus === "checked_in";
                            return (
                              <tr
                                key={t.id}
                                className={`transition-colors hover:bg-muted/40 ${isPresent ? "bg-emerald-500/[0.03]" : ""
                                  }`}
                              >
                                <td className="p-3">
                                  <div className="font-mono text-cyan font-semibold text-[11px]">{t.teamId}</div>
                                  <div className="font-bold text-foreground text-xs mt-0.5">{t.teamName}</div>
                                  <div className="text-[10px] text-muted-foreground sm:hidden mt-0.5">
                                    {t.members.length} {t.members.length === 1 ? "participant" : "participants"}
                                  </div>
                                </td>
                                <td className="p-3 hidden sm:table-cell">
                                  <div className="font-medium text-foreground">{t.members[0]?.name} (Leader)</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {t.members.length > 1
                                      ? `+ ${t.members.length - 1} more (${t.academicYear})`
                                      : t.academicYear}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {isPresent ? (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold gap-1">
                                      <Check className="h-3 w-3" /> PRESENT
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                                      PENDING
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {isPresent ? (
                                    <button
                                      onClick={() => {
                                        db.setTeamAttendance(t.teamId, "pending", judgeName);
                                        refreshData();
                                        toast.info(`Team ${t.teamId} reset to Pending.`);
                                      }}
                                      className="text-[11px] text-muted-foreground hover:text-amber-400 font-semibold"
                                      title="Reset attendance to pending"
                                    >
                                      Set Pending
                                    </button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        db.checkInTeam(t.teamId, judgeName);
                                        playBeep();
                                        setLastScannedTeam({ ...t, attendanceStatus: "checked_in" });
                                        refreshData();
                                        toast.success(`PRESENT: Team ${t.teamName} checked in.`);
                                      }}
                                      className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3"
                                    >
                                      Mark Present
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
