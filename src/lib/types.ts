export type AcademicYear = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";

export type PaymentStatus = "pending" | "verified" | "rejected";
export type AttendanceStatus = "registered" | "checked_in";

export interface TeamMember {
  name: string;
  email: string;
  phone?: string;
  college?: string;
  role: "Leader" | "Member";
}

export interface Team {
  id: string; // internal UUID
  teamId: string; // e.g. HWA-2026-101
  teamName: string;
  academicYear: AcademicYear;
  theme: string;
  members: TeamMember[];
  paymentProofUrl?: string;
  paymentTransactionId?: string;
  paymentStatus: PaymentStatus;
  attendanceStatus: AttendanceStatus;
  registeredAt: string;
}

export interface EvaluationCriteria {
  innovation: number; // 0-25 (Innovation & Creativity: 25%)
  problemUnderstanding: number; // 0-20 (Problem Understanding: 20%)
  technicalFeasibility: number; // 0-20 (Technical Feasibility: 20%)
  practicalImplementation: number; // 0-20 (Practical Implementation: 20%)
  presentation: number; // 0-15 (Presentation & Communication: 15%)
}

export interface Round1Evaluation {
  id: string;
  teamId: string;
  judgeName: string;
  judgeId: string;
  criteria: EvaluationCriteria;
  totalScore: number; // 0-100
  feedback: string;
  isSubmitted: boolean;
  submittedAt: string;
  updatedAt?: string | undefined;
}

export type Round1SelectionStatus = "pending_review" | "selected" | "not_selected";

export interface Round1Selection {
  teamId: string;
  status: Round1SelectionStatus;
  notes?: string | undefined;
  selectedAt?: string | undefined;
  selectedBy?: string | undefined;
}

export type Round2EvaluationCriteria = EvaluationCriteria;

export interface Round2Evaluation {
  id: string;
  teamId: string;
  judgeName: string;
  judgeId: string;
  criteria: Round2EvaluationCriteria;
  totalScore: number; // 0-100
  feedback: string;
  isSubmitted: boolean;
  submittedAt: string;
  updatedAt?: string | undefined;
}

export type FinalPosition = "first_place" | "second_place" | "third_place" | "finalist";

export interface FinalResult {
  teamId: string;
  position: FinalPosition;
  notes?: string;
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface ResultPublication {
  round: "round_1" | "final";
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  stats?: {
    totalTeams: number;
    evaluatedTeams: number;
    selectedCount?: number;
    notSelectedCount?: number;
    winnerTeamId?: string;
    runnerUpTeamId?: string;
  };
}

export type CertificateCategory =
  | "round_1_participation"
  | "winner"
  | "runner_up"
  | "third_place"
  | "round_2_participation";

export interface CertificateTemplate {
  imageUrl: string;
  nameYPercent: number; // e.g. 48%
  teamYPercent: number; // e.g. 56%
  fontSize: number; // e.g. 40
  fontColor: string; // e.g. "#ffffff"
  showTeamName: boolean;
  showCertId: boolean;
  certIdYPercent: number; // e.g. 88%
  updatedAt: string;
  updatedBy: string;
}

export interface CertificateRecord {
  id: string;
  certificateId: string; // e.g. HWA-CERT-XXXXX
  teamId: string;
  teamName: string;
  recipientName: string;
  recipientEmail: string;
  category: CertificateCategory;
  issuedAt: string;
  verificationCode: string;
  template: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: Record<string, unknown>;
}
