import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Upload,
  Users,
  Shield,
  ArrowLeft,
  QrCode,
  CreditCard,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { downloadTeamQrPass } from "@/lib/download-pass";
import { THEMES, EVENT } from "@/lib/event-content";
import { AcademicYear, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [academicYear, setAcademicYear] = useState<AcademicYear>("3rd Year");
  const [theme, setTheme] = useState(THEMES[0]?.title || "Generative AI");
  const [txId, setTxId] = useState("");
  const [fileName, setFileName] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // 4 Members
  const [members, setMembers] = useState([
    { name: "", email: "", phone: "", college: "Avanthi Institute of Eng & Tech", role: "Leader" as const },
    { name: "", email: "", phone: "", college: "Avanthi Institute of Eng & Tech", role: "Member" as const },
    { name: "", email: "", phone: "", college: "Avanthi Institute of Eng & Tech", role: "Member" as const },
    { name: "", email: "", phone: "", college: "Avanthi Institute of Eng & Tech", role: "Member" as const },
  ]);

  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index]!, [field]: value };
    setMembers(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceiptPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Attached receipt: ${file.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Please enter your Team Name");
      return;
    }
    if (!members[0]?.name.trim() || !members[0]?.email.trim()) {
      toast.error("Team Leader name and email are required");
      return;
    }
    if (!members[1]?.name.trim() || !members[1]?.email.trim()) {
      toast.error("At least 2 members are required to form a team");
      return;
    }
    if (!txId.trim()) {
      toast.error("Please enter your UPI Transaction Reference / UTR Number");
      return;
    }

    // Filter out blank members beyond 2
    const validMembers = members.filter((m) => m.name.trim() && m.email.trim());

    const newTeam = db.registerTeam({
      teamName: teamName.trim(),
      academicYear,
      theme,
      members: validMembers,
      paymentTransactionId: txId.trim(),
      paymentProofUrl: receiptPreview || "/receipt-placeholder.png",
      paymentStatus: "pending",
      attendanceStatus: "registered",
    });

    setRegisteredTeam(newTeam);
    toast.success(`Team registered successfully! Team ID: ${newTeam.teamId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to HWA 2026 Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10">
        {registeredTeam ? (
          /* SUCCESS SCREEN */
          <div className="bg-card border border-cyan/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-cyan/15 border-2 border-cyan flex items-center justify-center text-cyan">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan">REGISTRATION CONFIRMED</span>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold">{registeredTeam.teamName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your team has been initialized for Hack With Avanthi 2026.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 rounded-2xl border border-border bg-muted/20 space-y-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unique Team ID:</span>
                <span className="font-mono font-bold text-lg text-cyan">{registeredTeam.teamId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Selected Theme:</span>
                <span className="font-medium text-foreground">{registeredTeam.theme}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                  PENDING ADMIN CONFIRMATION
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">UTR Reference:</span>
                <span className="font-mono text-xs text-foreground font-semibold">
                  {registeredTeam.paymentTransactionId}
                </span>
              </div>

              {/* QR Preview */}
              <div className="pt-4 border-t border-border flex flex-col items-center text-center space-y-3">
                <div className="p-2 bg-white rounded-lg border border-border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      JSON.stringify({ teamId: registeredTeam.teamId, name: registeredTeam.teamName }),
                    )}`}
                    alt="Team QR Attendance Pass"
                    className="h-24 w-24"
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  Official Check-In QR Pass (Preserved in Student Portal)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTeamQrPass(registeredTeam)}
                  className="gap-2 text-xs border-cyan/40 text-cyan hover:bg-cyan/10"
                >
                  <Download className="h-3.5 w-3.5" /> Download QR Attendance Pass
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button
                type="button"
                onClick={() => downloadTeamQrPass(registeredTeam)}
                className="w-full sm:w-auto bg-cyan hover:bg-cyan/90 text-slate-950 font-bold gap-2"
              >
                <Download className="h-4 w-4" /> Download QR Pass
              </Button>
              <a href={`/portal?teamId=${registeredTeam.teamId}`}>
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  Open Student Portal <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link to="/">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Back to Main Arena
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan">Team Registration</span>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold">Register for HWA 2026</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your team details, members, and payment reference to obtain your official Team ID.
              </p>
            </div>

            {/* Team Details */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan" /> Team Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g. CyberVanguard"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Select value={academicYear} onValueChange={(val) => setAcademicYear(val as AcademicYear)}>
                    <SelectTrigger id="academicYear">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="theme">Selected Hackathon Theme *</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((t) => (
                        <SelectItem key={t.code} value={t.title}>
                          {t.code} — {t.title} ({t.blurb})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-violet" /> Roster Members (2 to 4)
              </h2>

              {members.map((m, idx) => (
                <div key={idx} className="p-4 border border-border/70 rounded-xl bg-background/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan">
                      {idx === 0 ? "LEADER (MEMBER 01)" : `MEMBER 0${idx + 1}`}
                    </span>
                    <span className="text-muted-foreground">{idx < 2 ? "* Required" : "Optional"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        placeholder="Student name"
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                        required={idx < 2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">College Email</Label>
                      <Input
                        type="email"
                        placeholder="name@aiet.edu.in"
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                        required={idx < 2}
                      />
                    </div>
                    {idx === 0 && (
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">WhatsApp / Phone Number</Label>
                        <Input
                          placeholder="+91 9876543210"
                          value={m.phone}
                          onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Details & Upload */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="text-center sm:text-left">
                <h2 className="font-display font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" /> Registration Payment
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan the QR code using any UPI app to complete payment, enter your transaction reference / UTR, and upload the payment proof.
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="p-2 bg-black rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden max-w-65">
                  <img
                    src="/payment-qr.jpg"
                    alt="Payment QR Code - Senapathi Nagendra"
                    className="w-full h-auto rounded-xl object-contain mx-auto"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <span className="font-bold select-all bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-300">
                    9063262364-2@ybl
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="txId">UPI Transaction ID / UTR Number *</Label>
                  <Input
                    id="txId"
                    placeholder="e.g. 98234827101"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Screenshot / Receipt</Label>
                  <Input id="receipt" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                </div>
              </div>

              {receiptPreview && (
                <div className="p-3 border border-border rounded-xl bg-background/50 flex items-center gap-3">
                  <img src={receiptPreview} alt="Receipt preview" className="h-12 w-12 object-cover rounded-lg border" />
                  <div className="text-xs">
                    <div className="font-semibold text-foreground">Attached Receipt</div>
                    <div className="text-muted-foreground text-[11px]">{fileName}</div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full bg-cyan hover:bg-cyan/90 text-slate-950 font-bold">
              Submit Registration & Submit Payment Proof
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
