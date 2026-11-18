import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../lib/db";

describe("HWA 2026 — Two-Round Hackathon Management System", () => {
  beforeEach(() => {
    db.resetToDefault();
    // Seed fresh test teams for test harness
    for (let i = 1; i <= 4; i++) {
      db.registerTeam({
        teamName: `TestTeam-${i}`,
        academicYear: "3rd Year",
        theme: "Generative AI",
        paymentStatus: "verified",
        attendanceStatus: "checked_in",
        members: [
          { name: `Member ${i}-1`, email: `m${i}1@aiet.edu.in`, role: "Leader" },
          { name: `Member ${i}-2`, email: `m${i}2@aiet.edu.in`, role: "Member" },
        ],
      });
    }
  });

  it("1. registers a new team with unique ID and pending payment", () => {
    const team = db.registerTeam({
      teamName: "AlphaCreators",
      academicYear: "3rd Year",
      theme: "Generative AI",
      paymentStatus: "pending",
      attendanceStatus: "registered",
      members: [
        { name: "Suresh K", email: "suresh@aiet.edu.in", role: "Leader" },
        { name: "Manoj P", email: "manoj@aiet.edu.in", role: "Member" },
      ],
    });

    expect(team.teamId).toMatch(/^HWA-2026-\d+$/);
    expect(team.paymentStatus).toBe("pending");
    expect(db.getTeam(team.teamId)).toBeDefined();
  });

  it("2. allows payment verification and QR check-in", () => {
    const teams = db.getTeams();
    const teamId = teams[0]!.teamId;

    db.verifyPayment(teamId, "verified", "Super Admin");
    db.checkInTeam(teamId, "Coordinator");

    const updated = db.getTeam(teamId);
    expect(updated?.paymentStatus).toBe("verified");
    expect(updated?.attendanceStatus).toBe("checked_in");
  });

  it("3. saves Round 1 evaluation scores and calculates total correctly", () => {
    const teams = db.getTeams();
    const teamId = teams[0]!.teamId;

    const evalRecord = db.saveRound1Evaluation({
      teamId,
      judgeName: "Dr. Arvind",
      judgeId: "JURY-01",
      criteria: {
        innovation: 24,
        problemUnderstanding: 19,
        technicalFeasibility: 19,
        practicalImplementation: 18,
        presentation: 14,
      },
      feedback: "Excellent architecture and well-articulated demo.",
      isSubmitted: true,
    });

    expect(evalRecord.totalScore).toBe(94);
    expect(db.getRound1EvaluationForTeam(teamId)?.totalScore).toBe(94);
  });

  it("4. handles Round 1 selections and releases Round 1 results with Category A certificates", () => {
    const teams = db.getTeams();
    const team1 = teams[0]!.teamId;
    const team2 = teams[1]!.teamId;
    const team3 = teams[2]!.teamId;

    // Evaluate
    db.saveRound1Evaluation({
      teamId: team1,
      judgeName: "Judge A",
      judgeId: "J1",
      criteria: {
        innovation: 20,
        problemUnderstanding: 16,
        technicalFeasibility: 16,
        practicalImplementation: 16,
        presentation: 12,
      },
      feedback: "Good",
      isSubmitted: true,
    });

    // Select team 1 for Round 2, reject team 2 and 3
    db.setRound1Selection(team1, "selected");
    db.setRound1Selection(team2, "not_selected");
    db.setRound1Selection(team3, "not_selected");

    const pub = db.publishRound1Results("Super Admin");
    expect(pub.isPublished).toBe(true);

    // Verify Category A certificates issued ONLY to non-selected team members
    const team2Certs = db.getCertificatesForTeam(team2);
    expect(team2Certs.length).toBe(teams[1]!.members.length);
    expect(team2Certs[0]!.category).toBe("round_1_participation");

    // Selected team 1 should NOT receive participation certificate at this stage
    const team1Certs = db.getCertificatesForTeam(team1);
    expect(team1Certs.length).toBe(0);
  });

  it("5. strictly forbids unselected teams from Round 2 evaluation", () => {
    const teams = db.getTeams();
    const unselectedTeamId = teams[3]!.teamId;

    db.setRound1Selection(unselectedTeamId, "not_selected");

    expect(() => {
      db.saveRound2Evaluation({
        teamId: unselectedTeamId,
        judgeName: "Grand Jury",
        judgeId: "GJ1",
        criteria: {
          innovation: 20,
          problemUnderstanding: 16,
          technicalFeasibility: 16,
          practicalImplementation: 16,
          presentation: 12,
        },
        feedback: "Attempt",
        isSubmitted: true,
      });
    }).toThrow("Team is not eligible for Round 2 evaluation.");
  });

  it("6. validates unique positions and completes final results with Category B certificates", () => {
    const teams = db.getTeams();
    const team1 = teams[0]!.teamId;
    const team2 = teams[1]!.teamId;

    // Both selected for R2
    db.setRound1Selection(team1, "selected");
    db.setRound1Selection(team2, "selected");
    db.publishRound1Results("Super Admin");

    // Evaluate R2
    db.saveRound2Evaluation({
      teamId: team1,
      judgeName: "Jury",
      judgeId: "J1",
      criteria: {
        innovation: 25,
        problemUnderstanding: 20,
        technicalFeasibility: 20,
        practicalImplementation: 19,
        presentation: 15,
      },
      feedback: "Exceptional Winner",
      isSubmitted: true,
    });
    db.saveRound2Evaluation({
      teamId: team2,
      judgeName: "Jury",
      judgeId: "J1",
      criteria: {
        innovation: 22,
        problemUnderstanding: 18,
        technicalFeasibility: 17,
        practicalImplementation: 17,
        presentation: 13,
      },
      feedback: "Strong Runner-up",
      isSubmitted: true,
    });

    // Guard against identical winner & runner up
    expect(() => {
      db.setFinalRankings(team1, team1);
    }).toThrow("Duplicate position error: Winner and Runner-Up cannot be the same team.");

    // Valid rankings
    db.setFinalRankings(team1, team2);
    const finalPub = db.publishFinalResults("Super Admin");
    expect(finalPub.isPublished).toBe(true);

    // Winner certificates
    const winnerCerts = db.getCertificatesForTeam(team1);
    expect(winnerCerts.length).toBe(teams[0]!.members.length);
    expect(winnerCerts[0]!.category).toBe("winner");

    // Runner-up certificates
    const runnerUpCerts = db.getCertificatesForTeam(team2);
    expect(runnerUpCerts.length).toBe(teams[1]!.members.length);
    expect(runnerUpCerts[0]!.category).toBe("runner_up");

    // Public verification lookup
    const certId = winnerCerts[0]!.certificateId;
    const verified = db.getCertificateById(certId);
    expect(verified?.recipientName).toBe(teams[0]!.members[0]!.name);
  });
});
