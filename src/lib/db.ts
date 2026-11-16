import {
  Team,
  Round1Evaluation,
  Round1Selection,
  Round2Evaluation,
  FinalResult,
  ResultPublication,
  CertificateRecord,
  AuditLog,
  CertificateCategory,
  PaymentStatus,
} from "./types";

const STORAGE_KEY_PREFIX = "hwa_2026_prod_";

const inMemoryStore: Record<string, string> = {};

function isBrowser(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined" && window.localStorage !== null;
  } catch {
    return false;
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  const fullKey = STORAGE_KEY_PREFIX + key;
  if (isBrowser()) {
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // fall through to memory store
    }
  }
  if (inMemoryStore[fullKey] !== undefined) {
    try {
      return JSON.parse(inMemoryStore[fullKey]!) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  const fullKey = STORAGE_KEY_PREFIX + key;
  const serialized = JSON.stringify(value);
  inMemoryStore[fullKey] = serialized;

  if (isBrowser()) {
    try {
      localStorage.setItem(fullKey, serialized);
    } catch (err) {
      console.warn("localStorage write failed, using in-memory store:", err);
    }
  }
}

class HwaDatabase {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (getItem<Team[] | null>("teams", null) === null) {
      setItem("teams", []);
      setItem("round_1_evaluations", []);
      setItem("round_1_selections", []);
      setItem("round_2_evaluations", []);
      setItem("final_results", []);
      setItem("result_publications", [
        { round: "round_1", isPublished: false },
        { round: "final", isPublished: false },
      ]);
      setItem("certificate_records", []);
      setItem("audit_logs", [
        {
          id: "log-init",
          action: "SYSTEM_INITIALIZED",
          performedBy: "Super Admin",
          timestamp: new Date().toISOString(),
          details: { initializedTeams: 0 },
        },
      ]);
    }
  }

  // TEAMS
  getTeams(): Team[] {
    return getItem<Team[]>("teams", []);
  }

  getTeam(teamId: string): Team | undefined {
    return this.getTeams().find((t) => t.teamId.toLowerCase() === teamId.toLowerCase());
  }

  registerTeam(newTeamData: Omit<Team, "id" | "teamId" | "registeredAt">): Team {
    const teams = this.getTeams();
    const nextNumber = teams.length + 101;
    const teamId = `HWA-2026-${nextNumber}`;
    const newTeam: Team = {
      ...newTeamData,
      id: `team-uuid-${Date.now()}`,
      teamId,
      registeredAt: new Date().toISOString(),
    };

    teams.push(newTeam);
    setItem("teams", teams);

    // Initial selection record
    const selections = this.getRound1Selections();
    selections.push({
      teamId,
      status: "pending_review",
    });
    setItem("round_1_selections", selections);

    this.addAuditLog("TEAM_REGISTERED", "Student Portal", { teamId, teamName: newTeam.teamName });
    return newTeam;
  }

  verifyPayment(teamId: string, status: PaymentStatus, adminName = "Super Admin") {
    const teams = this.getTeams();
    const index = teams.findIndex((t) => t.teamId === teamId);
    if (index !== -1) {
      teams[index]!.paymentStatus = status;
      setItem("teams", teams);
      this.addAuditLog("PAYMENT_STATUS_UPDATED", adminName, { teamId, status });
    }
  }

  checkInTeam(teamId: string, adminName = "Attendance Coordinator") {
    const teams = this.getTeams();
    const index = teams.findIndex((t) => t.teamId === teamId);
    if (index !== -1) {
      teams[index]!.attendanceStatus = "checked_in";
      setItem("teams", teams);
      this.addAuditLog("ATTENDANCE_CHECKED_IN", adminName, { teamId });
    }
  }

  // ROUND 1 EVALUATION
  getRound1Evaluations(): Round1Evaluation[] {
    return getItem<Round1Evaluation[]>("round_1_evaluations", []);
  }

  getRound1EvaluationForTeam(teamId: string): Round1Evaluation | undefined {
    return this.getRound1Evaluations().find((e) => e.teamId === teamId);
  }

  saveRound1Evaluation(evaluation: Omit<Round1Evaluation, "id" | "totalScore" | "submittedAt">): Round1Evaluation {
    const pub = this.getRound1PublicationStatus();
    if (pub.isPublished) {
      throw new Error("Round 1 results are finalized. Further evaluations are locked.");
    }

    const evaluations = this.getRound1Evaluations();
    const totalScore =
      evaluation.criteria.innovation +
      evaluation.criteria.techComplexity +
      evaluation.criteria.feasibility +
      evaluation.criteria.presentation;

    const existingIndex = evaluations.findIndex((e) => e.teamId === evaluation.teamId);

    const record: Round1Evaluation = {
      ...evaluation,
      id: existingIndex !== -1 ? evaluations[existingIndex]!.id : `r1-eval-${Date.now()}`,
      totalScore,
      submittedAt: existingIndex !== -1 ? evaluations[existingIndex]!.submittedAt : new Date().toISOString(),
      updatedAt: existingIndex !== -1 ? new Date().toISOString() : undefined,
    };

    if (existingIndex !== -1) {
      evaluations[existingIndex] = record;
    } else {
      evaluations.push(record);
    }

    setItem("round_1_evaluations", evaluations);
    this.addAuditLog(
      existingIndex !== -1 ? "ROUND_1_EVALUATION_UPDATED" : "ROUND_1_EVALUATION_SUBMITTED",
      evaluation.judgeName,
      { teamId: evaluation.teamId, totalScore },
    );
    return record;
  }

  // ROUND 1 SELECTION
  getRound1Selections(): Round1Selection[] {
    return getItem<Round1Selection[]>("round_1_selections", []);
  }

  getRound1SelectionForTeam(teamId: string): Round1Selection | undefined {
    return this.getRound1Selections().find((s) => s.teamId === teamId);
  }

  setRound1Selection(
    teamId: string,
    status: "pending_review" | "selected" | "not_selected",
    adminName = "Super Admin",
    notes?: string,
  ) {
    const pub = this.getRound1PublicationStatus();
    if (pub.isPublished) {
      throw new Error("Round 1 results have already been released and locked.");
    }

    const selections = this.getRound1Selections();
    const existing = selections.find((s) => s.teamId === teamId);
    if (existing) {
      existing.status = status;
      existing.selectedAt = new Date().toISOString();
      existing.selectedBy = adminName;
      if (notes) existing.notes = notes;
    } else {
      selections.push({
        teamId,
        status,
        selectedAt: new Date().toISOString(),
        selectedBy: adminName,
        notes,
      });
    }

    setItem("round_1_selections", selections);
    this.addAuditLog("ROUND_1_SELECTION_UPDATED", adminName, { teamId, status });
  }

  batchSetRound1Selection(
    teamIds: string[],
    status: "selected" | "not_selected",
    adminName = "Super Admin",
  ) {
    const pub = this.getRound1PublicationStatus();
    if (pub.isPublished) {
      throw new Error("Round 1 results have already been released and locked.");
    }

    const selections = this.getRound1Selections();
    for (const teamId of teamIds) {
      const existing = selections.find((s) => s.teamId === teamId);
      if (existing) {
        existing.status = status;
        existing.selectedAt = new Date().toISOString();
        existing.selectedBy = adminName;
      } else {
        selections.push({
          teamId,
          status,
          selectedAt: new Date().toISOString(),
          selectedBy: adminName,
        });
      }
    }
    setItem("round_1_selections", selections);
    this.addAuditLog("ROUND_1_BATCH_SELECTION", adminName, { count: teamIds.length, status });
  }

  // ROUND 1 PUBLICATION & CERTIFICATES (Category A)
  getRound1PublicationStatus(): ResultPublication {
    const publications = getItem<ResultPublication[]>("result_publications", []);
    return (
      publications.find((p) => p.round === "round_1") ?? {
        round: "round_1",
        isPublished: false,
      }
    );
  }

  publishRound1Results(adminName = "Super Admin") {
    const teams = this.getTeams();
    const selections = this.getRound1Selections();
    const evaluations = this.getRound1Evaluations();

    const selectedCount = selections.filter((s) => s.status === "selected").length;
    const notSelectedCount = selections.filter((s) => s.status === "not_selected").length;

    if (selectedCount === 0) {
      throw new Error("Cannot release Round 1 results: No teams have been selected for Round 2.");
    }

    const publications = getItem<ResultPublication[]>("result_publications", []);
    const pubIndex = publications.findIndex((p) => p.round === "round_1");

    const record: ResultPublication = {
      round: "round_1",
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy: adminName,
      stats: {
        totalTeams: teams.length,
        evaluatedTeams: evaluations.length,
        selectedCount,
        notSelectedCount,
      },
    };

    if (pubIndex !== -1) {
      publications[pubIndex] = record;
    } else {
      publications.push(record);
    }
    setItem("result_publications", publications);

    // AUTO-GENERATE CATEGORY A CERTIFICATES FOR NON-SELECTED TEAMS
    this.issueCategoryACertificates(adminName);

    this.addAuditLog("ROUND_1_RESULTS_RELEASED", adminName, record.stats ?? {});
    return record;
  }

  // ROUND 2 EVALUATION
  getRound2Evaluations(): Round2Evaluation[] {
    return getItem<Round2Evaluation[]>("round_2_evaluations", []);
  }

  getRound2EvaluationForTeam(teamId: string): Round2Evaluation | undefined {
    return this.getRound2Evaluations().find((e) => e.teamId === teamId);
  }

  saveRound2Evaluation(evaluation: Omit<Round2Evaluation, "id" | "totalScore" | "submittedAt">): Round2Evaluation {
    const pub = this.getFinalPublicationStatus();
    if (pub.isPublished) {
      throw new Error("Final results have been published. Round 2 evaluations are locked.");
    }

    // Must be selected in Round 1
    const selection = this.getRound1SelectionForTeam(evaluation.teamId);
    if (!selection || selection.status !== "selected") {
      throw new Error("Team is not eligible for Round 2 evaluation.");
    }

    const evaluations = this.getRound2Evaluations();
    const totalScore =
      evaluation.criteria.implementation +
      evaluation.criteria.aiArchitecture +
      evaluation.criteria.viability +
      evaluation.criteria.qnaDefense;

    const existingIndex = evaluations.findIndex((e) => e.teamId === evaluation.teamId);

    const record: Round2Evaluation = {
      ...evaluation,
      id: existingIndex !== -1 ? evaluations[existingIndex]!.id : `r2-eval-${Date.now()}`,
      totalScore,
      submittedAt: existingIndex !== -1 ? evaluations[existingIndex]!.submittedAt : new Date().toISOString(),
      updatedAt: existingIndex !== -1 ? new Date().toISOString() : undefined,
    };

    if (existingIndex !== -1) {
      evaluations[existingIndex] = record;
    } else {
      evaluations.push(record);
    }

    setItem("round_2_evaluations", evaluations);
    this.addAuditLog(
      existingIndex !== -1 ? "ROUND_2_EVALUATION_UPDATED" : "ROUND_2_EVALUATION_SUBMITTED",
      evaluation.judgeName,
      { teamId: evaluation.teamId, totalScore },
    );
    return record;
  }

  // FINAL RESULTS
  getFinalResults(): FinalResult[] {
    return getItem<FinalResult[]>("final_results", []);
  }

  getFinalPublicationStatus(): ResultPublication {
    const publications = getItem<ResultPublication[]>("result_publications", []);
    return (
      publications.find((p) => p.round === "final") ?? {
        round: "final",
        isPublished: false,
      }
    );
  }

  setFinalRankings(
    winnerTeamId: string,
    runnerUpTeamId: string,
    thirdPlaceTeamId?: string,
    adminName = "Super Admin",
  ) {
    if (winnerTeamId === runnerUpTeamId) {
      throw new Error("Duplicate position error: Winner and Runner-Up cannot be the same team.");
    }
    if (thirdPlaceTeamId && (thirdPlaceTeamId === winnerTeamId || thirdPlaceTeamId === runnerUpTeamId)) {
      throw new Error("Duplicate position error: Third place cannot be identical to Winner or Runner-Up.");
    }

    const r1Selections = this.getRound1Selections();
    const r2Teams = r1Selections.filter((s) => s.status === "selected").map((s) => s.teamId);

    if (!r2Teams.includes(winnerTeamId) || !r2Teams.includes(runnerUpTeamId)) {
      throw new Error("Selected winners must be teams that qualified for Round 2.");
    }

    const finalResults: FinalResult[] = [];
    const timestamp = new Date().toISOString();

    for (const teamId of r2Teams) {
      let position: FinalResult["position"] = "finalist";
      if (teamId === winnerTeamId) position = "first_place";
      else if (teamId === runnerUpTeamId) position = "second_place";
      else if (thirdPlaceTeamId && teamId === thirdPlaceTeamId) position = "third_place";

      finalResults.push({
        teamId,
        position,
        finalizedAt: timestamp,
        finalizedBy: adminName,
      });
    }

    setItem("final_results", finalResults);
    this.addAuditLog("FINAL_RANKINGS_UPDATED", adminName, {
      winnerTeamId,
      runnerUpTeamId,
      thirdPlaceTeamId,
    });
  }

  publishFinalResults(adminName = "Super Admin") {
    const finalResults = this.getFinalResults();
    const winner = finalResults.find((r) => r.position === "first_place");
    const runnerUp = finalResults.find((r) => r.position === "second_place");

    if (!winner || !runnerUp) {
      throw new Error("Cannot release final results: 1st Place (Winner) and 2nd Place (Runner-Up) must be selected.");
    }

    const publications = getItem<ResultPublication[]>("result_publications", []);
    const pubIndex = publications.findIndex((p) => p.round === "final");

    const record: ResultPublication = {
      round: "final",
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy: adminName,
      stats: {
        totalTeams: this.getTeams().length,
        evaluatedTeams: this.getRound2Evaluations().length,
        winnerTeamId: winner.teamId,
        runnerUpTeamId: runnerUp.teamId,
      },
    };

    if (pubIndex !== -1) {
      publications[pubIndex] = record;
    } else {
      publications.push(record);
    }
    setItem("result_publications", publications);

    // AUTO-GENERATE CATEGORY B CERTIFICATES FOR ROUND 2 TEAMS
    this.issueCategoryBCertificates(adminName);

    this.addAuditLog("FINAL_RESULTS_RELEASED", adminName, record.stats ?? {});
    return record;
  }

  // CERTIFICATES
  getCertificateRecords(): CertificateRecord[] {
    return getItem<CertificateRecord[]>("certificate_records", []);
  }

  getCertificatesForTeam(teamId: string): CertificateRecord[] {
    return this.getCertificateRecords().filter((c) => c.teamId === teamId);
  }

  getCertificateById(certId: string): CertificateRecord | undefined {
    return this.getCertificateRecords().find(
      (c) => c.certificateId.toLowerCase() === certId.toLowerCase(),
    );
  }

  private issueCategoryACertificates(adminName: string) {
    const selections = this.getRound1Selections();
    const notSelectedTeamIds = selections.filter((s) => s.status === "not_selected").map((s) => s.teamId);
    const teams = this.getTeams().filter((t) => notSelectedTeamIds.includes(t.teamId));
    const certs = this.getCertificateRecords();

    let count = 0;
    for (const team of teams) {
      for (const member of team.members) {
        // Guard against duplicate
        const exists = certs.some(
          (c) => c.teamId === team.teamId && c.recipientEmail.toLowerCase() === member.email.toLowerCase(),
        );
        if (!exists) {
          count++;
          const certId = `HWA-CERT-R1-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          certs.push({
            id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            certificateId: certId,
            teamId: team.teamId,
            teamName: team.teamName,
            recipientName: member.name,
            recipientEmail: member.email,
            category: "round_1_participation",
            issuedAt: new Date().toISOString(),
            verificationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
            template: "participation_round_1",
          });
        }
      }
    }
    setItem("certificate_records", certs);
    this.addAuditLog("CATEGORY_A_CERTIFICATES_ISSUED", adminName, { generatedCount: count });
  }

  private issueCategoryBCertificates(adminName: string) {
    const finalResults = this.getFinalResults();
    const teams = this.getTeams();
    const certs = this.getCertificateRecords();

    let count = 0;
    for (const res of finalResults) {
      const team = teams.find((t) => t.teamId === res.teamId);
      if (!team) continue;

      let cat: CertificateCategory = "round_2_participation";
      let tmpl = "round_2_finalist";
      if (res.position === "first_place") {
        cat = "winner";
        tmpl = "champion_1st";
      } else if (res.position === "second_place") {
        cat = "runner_up";
        tmpl = "runner_up_2nd";
      } else if (res.position === "third_place") {
        cat = "third_place";
        tmpl = "third_place_3rd";
      }

      for (const member of team.members) {
        // Prevent duplicate assignment
        const exists = certs.some(
          (c) => c.teamId === team.teamId && c.recipientEmail.toLowerCase() === member.email.toLowerCase(),
        );
        if (!exists) {
          count++;
          const certId = `HWA-CERT-R2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          certs.push({
            id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            certificateId: certId,
            teamId: team.teamId,
            teamName: team.teamName,
            recipientName: member.name,
            recipientEmail: member.email,
            category: cat,
            issuedAt: new Date().toISOString(),
            verificationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
            template: tmpl,
          });
        }
      }
    }
    setItem("certificate_records", certs);
    this.addAuditLog("CATEGORY_B_CERTIFICATES_ISSUED", adminName, { generatedCount: count });
  }

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>("audit_logs", []);
  }

  addAuditLog(action: string, performedBy: string, details: Record<string, unknown>) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
    });
    setItem("audit_logs", logs.slice(0, 100)); // retain last 100
  }

  // RESET / RE-SEED
  resetToDefault() {
    for (const key of Object.keys(inMemoryStore)) {
      delete inMemoryStore[key];
    }
    if (isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEY_PREFIX + "teams");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "round_1_evaluations");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "round_1_selections");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "round_2_evaluations");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "final_results");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "result_publications");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "certificate_records");
        localStorage.removeItem(STORAGE_KEY_PREFIX + "audit_logs");
      } catch {}
    }
    this.ensureInitialized();
  }
}

export const db = new HwaDatabase();
