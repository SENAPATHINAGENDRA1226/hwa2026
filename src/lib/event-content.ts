// All event facts live here so they are easy to update in one place.
// Placeholder values (dates, prizes, schedule) are marked and should be confirmed by the organisers.

export const EVENT = {
  name: "HACK WITH AVANTHI 2026",
  tagline: "Where Intelligence Meets Innovation.",
  organiser: "DLIDES CLUB",
  institute: "Avanthi Institute of Engineering & Technology",
  // Placeholder: event kick-off, India Standard Time.
  startsAt: "2026-12-18T09:00:00+05:30",
  dateLabel: "18 – 19 Dec 2026",
  venue: "AIET Campus",
  duration: "24 Hours",
  teamSize: "2 – 4 Members",
  // Paste the real registration form link here (Google Form, Devfolio, Unstop…).
  registerUrl: "",
} as const;

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#themes", label: "Themes" },
  { href: "#timeline", label: "Timeline" },
  { href: "#prizes", label: "Prizes" },
  { href: "#register", label: "Register" },
] as const;

export type ThemeIcon =
  | "sparkles"
  | "brain"
  | "shield"
  | "blocks"
  | "bot"
  | "heart"
  | "wallet"
  | "leaf"
  | "education";

export const THEMES: { code: string; title: string; blurb: string; icon: ThemeIcon }[] = [
  { code: "T-01", title: "Generative AI", blurb: "LLMs, agents and creative AI that write, see and reason.", icon: "sparkles" },
  { code: "T-02", title: "Machine Learning & Data", blurb: "Models and pipelines that turn raw data into insight.", icon: "brain" },
  { code: "T-03", title: "Cybersecurity", blurb: "Defend systems, detect threats and protect privacy.", icon: "shield" },
  { code: "T-04", title: "Blockchain & Web3", blurb: "Trustless apps, digital identity and transparent ledgers.", icon: "blocks" },
  { code: "T-05", title: "IoT & Robotics", blurb: "Smart devices and machines that sense and act.", icon: "bot" },
  { code: "T-06", title: "HealthTech", blurb: "Tools for diagnosis, care and everyday wellbeing.", icon: "heart" },
  { code: "T-07", title: "FinTech", blurb: "Payments, lending and money tools for everyone.", icon: "wallet" },
  { code: "T-08", title: "Sustainability", blurb: "Climate, energy and smart-city solutions for a greener planet.", icon: "leaf" },
  { code: "T-09", title: "Smart Education", blurb: "Reimagine how students learn, practise and grow.", icon: "education" },
];

// Placeholder schedule.
export const TIMELINE: { day: string; time: string; title: string; detail: string }[] = [
  { day: "Day 1", time: "08:00", title: "Check-in & Kit Pickup", detail: "Verify your team, grab your badge and settle into your pod." },
  { day: "Day 1", time: "09:30", title: "Opening Ceremony", detail: "Keynote, theme reveal and the rules of the arena." },
  { day: "Day 1", time: "10:30", title: "Hacking Begins", detail: "The 24-hour clock starts. Build, break, iterate." },
  { day: "Day 1", time: "15:00", title: "Mentor Round I", detail: "Industry mentors review your idea and architecture." },
  { day: "Day 1", time: "23:59", title: "Midnight Checkpoint", detail: "Progress check, fun activities and a late-night refuel." },
  { day: "Day 2", time: "07:00", title: "Mentor Round II", detail: "Final feedback before the home stretch." },
  { day: "Day 2", time: "10:30", title: "Code Freeze", detail: "Submissions lock. Push your final commit." },
  { day: "Day 2", time: "11:00", title: "Final Pitches", detail: "Demo your product live to the jury." },
  { day: "Day 2", time: "15:00", title: "Awards & Closing", detail: "Winners announced. Celebrate the builders." },
];

// Placeholder prize amounts in Indian Rupees.
export const PRIZES = [
  { rank: "2nd", title: "Runner Up", amount: 30000, perks: ["Trophy & medals", "Certificates", "Goodies"], tone: "violet" },
  { rank: "1st", title: "Grand Winner", amount: 50000, perks: ["Champion trophy", "Internship interviews", "Premium goodies"], tone: "cyan" },
  { rank: "3rd", title: "Second Runner Up", amount: 20000, perks: ["Trophy & medals", "Certificates", "Goodies"], tone: "magenta" },
] as const;

export const SPECIAL_AWARDS = ["Best in each of the 9 themes", "Best All-Women Team", "Best First-Year Team", "Most Innovative Idea"];
