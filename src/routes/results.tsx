import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Award, Trophy, Sparkles, CheckCircle2, Clock, ArrowLeft, Shield } from "lucide-react";
import { db } from "@/lib/db";
import { Team, FinalResult, ResultPublication } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/results")({
  component: PublicResultsPage,
});

function PublicResultsPage() {
  const [r1Pub, setR1Pub] = useState<ResultPublication>({ round: "round_1", isPublished: false });
  const [finalPub, setFinalPub] = useState<ResultPublication>({ round: "final", isPublished: false });
  const [teams, setTeams] = useState<Team[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);

  useEffect(() => {
    setR1Pub(db.getRound1PublicationStatus());
    setFinalPub(db.getFinalPublicationStatus());
    setTeams(db.getTeams());
    setFinalResults(db.getFinalResults());
  }, []);

  const winner = finalResults.find((r) => r.position === "first_place");
  const runnerUp = finalResults.find((r) => r.position === "second_place");
  const thirdPlace = finalResults.find((r) => r.position === "third_place");

  const winnerTeam = teams.find((t) => t.teamId === winner?.teamId);
  const runnerUpTeam = teams.find((t) => t.teamId === runnerUp?.teamId);
  const thirdPlaceTeam = teams.find((t) => t.teamId === thirdPlace?.teamId);

  const r1Selections = db.getRound1Selections();
  const r1SelectedTeams = teams.filter((t) =>
    r1Selections.some((s) => s.teamId === t.teamId && s.status === "selected"),
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to HWA Arena
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan text-cyan text-xs font-mono">
              OFFICIAL RESULTS
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-12 space-y-16">
        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            Official Bulletin 2026
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            Hackathon Standings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Where Intelligence Meets Innovation. Celebrating the exceptional builders and problem solvers of Avanthi Institute of Engineering & Technology.
          </p>
        </div>

        {/* SECTION 1: FINAL PODIUM (If Released) */}
        {finalPub.isPublished && winnerTeam && runnerUpTeam ? (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-amber-400">GRAND FINALS</span>
              <h2 className="font-display text-3xl font-extrabold mt-1">Hall of Champions</h2>
            </div>

            {/* Winner Showcase */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient
            -to-b from-amber-500/20 via-zinc-950 to-neutral-950 p-8 sm:p-12 text-center shadow-2xl">
              <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-cyan/20 blur-3xl" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <Trophy className="h-4 w-4" /> FIRST PLACE — 1ST RANK
                </div>

                <h3 className="font-display text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-yellow-100 uppercase tracking-wide">
                  {winnerTeam.teamName}
                </h3>

                <p className="font-mono text-xs text-amber-300/80">{winnerTeam.teamId} • {winnerTeam.theme}</p>

                <div className="p-6 rounded-2xl bg-black/40 border border-amber-400/30 text-center space-y-2">
                  <div className="font-display font-bold text-base text-amber-300">
                    CHAMPIONS OF HACK WITH AVANTHI 2026!
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Congratulations on securing FIRST PLACE!
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your innovation, technical excellence and dedication have made you the champions of Hack With Avanthi 2026.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  {winnerTeam.members.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium">
                      {m.name} ({m.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Runner-Up Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-cyan/50 bg-linear-to-b from-cyan/15 via-zinc-950 to-neutral-950 p-8 text-center shadow-xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/20 border border-cyan/60 text-cyan font-mono text-xs font-bold uppercase">
                  <Award className="h-3.5 w-3.5" /> SECOND PLACE — RUNNER UP
                </div>

                <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-cyan">
                  {runnerUpTeam.teamName}
                </h4>
                <p className="font-mono text-xs text-muted-foreground">{runnerUpTeam.teamId} • {runnerUpTeam.theme}</p>

                <div className="p-4 rounded-xl bg-black/40 border border-cyan/30 text-xs text-foreground/90 space-y-1">
                  <div className="font-bold text-cyan">OUTSTANDING ACHIEVEMENT!</div>
                  <p className="text-muted-foreground">
                    Congratulations on securing SECOND PLACE! Your creativity and determination have made an exceptional contribution to Hack With Avanthi 2026.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {runnerUpTeam.members.map((m, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Third Place or Finalist Showcase */}
              {thirdPlaceTeam ? (
                <div className="rounded-3xl border border-violet/50 bg-linear-to-b from-violet/15 via-zinc-950 to-neutral-950 p-8 text-center shadow-xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet/20 border border-violet/60 text-violet font-mono text-xs font-bold uppercase">
                    <Award className="h-3.5 w-3.5" /> THIRD PLACE
                  </div>

                  <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-violet">
                    {thirdPlaceTeam.teamName}
                  </h4>
                  <p className="font-mono text-xs text-muted-foreground">{thirdPlaceTeam.teamId} • {thirdPlaceTeam.theme}</p>

                  <div className="p-4 rounded-xl bg-black/40 border border-violet/30 text-xs text-foreground/90 space-y-1">
                    <div className="font-bold text-violet">EXCELLENCE IN INNOVATION!</div>
                    <p className="text-muted-foreground">
                      Recognized for exceptional technical execution and creative solution design.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {thirdPlaceTeam.members.map((m, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet/10 border border-violet/30 text-violet">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card/60 p-8 flex flex-col justify-center items-center text-center space-y-3">
                  <Shield className="h-10 w-10 text-cyan/60" />
                  <div className="font-display font-bold text-lg">Round 2 Finalists</div>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    All Round 2 participants receive official Finalist Certificates for qualifying for the Grand Arena.
                  </p>
                  <Link to="/portal">
                    <Button size="sm" variant="outline" className="text-xs">
                      Check Your Certificate in Portal
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-3xl border border-dashed border-border bg-card/30 text-center space-y-2">
            <Clock className="h-8 w-8 mx-auto text-amber-400 opacity-60" />
            <h3 className="font-display font-bold text-lg">Final Results Pending Official Release</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Grand Jury evaluations and podium verifications are underway. The Super Admin will publish the official Champions shortly.
            </p>
          </div>
        )}

        {/* SECTION 2: ROUND 1 QUALIFIERS (If Released) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan">STAGE RESULTS</span>
              <h3 className="font-display text-2xl font-bold">Round 1 Advancing Teams</h3>
            </div>
            {r1Pub.isPublished && (
              <Badge className="bg-cyan/15 border-cyan text-cyan text-xs font-mono self-start sm:self-auto">
                {r1SelectedTeams.length} TEAMS ADVANCED TO ROUND 2
              </Badge>
            )}
          </div>

          {!r1Pub.isPublished ? (
            <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs">
              Round 1 results will appear here once officially released by the Super Admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {r1SelectedTeams.map((t) => (
                <div
                  key={t.teamId}
                  className="p-5 rounded-2xl border border-cyan/30 bg-card hover:border-cyan/70 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan font-bold">{t.teamId}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {t.academicYear}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-foreground">{t.teamName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.theme}</p>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Leader: {t.members[0]?.name}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Round 2
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
