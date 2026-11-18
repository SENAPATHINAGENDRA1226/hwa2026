import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"round1" | "round2">("round1");

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evaluation & Scoring Matrix
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Independent scoring workflows for Preliminary (Round 1) and Grand Finals (Round 2)
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "round1" | "round2")}>
          <TabsList className="grid w-full sm:w-96 grid-cols-2 mb-6">
            <TabsTrigger value="round1" className="font-display font-semibold text-xs gap-1.5">
              <span>Round 1 Evaluation</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {r1Evaluations.length}/{r1Teams.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="round2" className="font-display font-semibold text-xs gap-1.5">
              <span>Round 2 Evaluation</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {r2Evaluations.length}/{r2EligibleTeams.length}
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
        </Tabs>
      </main>
    </div>
  );
}
