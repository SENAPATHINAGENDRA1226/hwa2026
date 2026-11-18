// All event facts live here so they are easy to update in one place.
// Verified event details for HACK WITH AVANTHI (HWA) 2026.

export const EVENT = {
  name: "HACK WITH AVANTHI 2026",
  tagline: "Where Intelligence Meets Innovation.",
  organiser: "DLIDES CLUB",
  institute: "Avanthi Institute of Engineering and Technology",
  location: "Vizianagaram, Andhra Pradesh, India",
  startsAt: "2026-12-21T09:00:00+05:30",
  dateLabel: "21 – 22 Dec 2026",
  venue: "Avanthi Institute of Engineering and Technology, Vizianagaram",
  duration: "24 Hours",
  teamSize: "1 – 4 Participants",
  fee: "₹250 per team",
  registerUrl: "/register",
} as const;

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#problem-statements", label: "Problem Statements" },
  { href: "#timeline", label: "Timeline" },
  { href: "#eligibility", label: "Eligibility" },
  { href: "#guidelines", label: "Guidelines" },
  { href: "#rules", label: "Rules" },
  { href: "#evaluation", label: "Evaluation" },
  { href: "#prizes", label: "Prizes" },
  { href: "#benefits", label: "Benefits" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact & Venue" },
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

export interface TimelineMilestone {
  stage: string;
  date: string;
  title: string;
  detail: string;
  badge: "Registration" | "Submission" | "Screening" | "Hackathon";
  isKeyDeadline?: boolean;
}

export const TIMELINE: TimelineMilestone[] = [
  {
    stage: "Stage 01",
    date: "23 November 2026",
    title: "Registration Opens",
    detail: "Official portal opens for team registrations across CSM and CSD departments.",
    badge: "Registration",
    isKeyDeadline: false,
  },
  {
    stage: "Stage 02",
    date: "15 December 2026",
    title: "Registration Closes",
    detail: "Final deadline to register teams and lock rosters on the official portal.",
    badge: "Registration",
    isKeyDeadline: true,
  },
  {
    stage: "Stage 03",
    date: "19 December 2026",
    title: "PPT Submission Deadline",
    detail: "Every team must submit their 7-section PowerPoint presentation for screening.",
    badge: "Submission",
    isKeyDeadline: true,
  },
  {
    stage: "Stage 04",
    date: "20 December 2026",
    title: "Screening & Shortlisting",
    detail: "Jury and mentors screen submitted PPTs and publish shortlisted teams for the offline sprint.",
    badge: "Screening",
    isKeyDeadline: false,
  },
  {
    stage: "Stage 05",
    date: "21 December 2026",
    title: "Day 1 – Hackathon Begins",
    detail: "Keynote, theme kick-off, 24-hour hacking countdown starts, and Mentor Round 1 commences.",
    badge: "Hackathon",
    isKeyDeadline: true,
  },
  {
    stage: "Stage 06",
    date: "22 December 2026",
    title: "Day 2 – Final Day",
    detail: "Final code freeze, Round 2 project evaluation pitches, and grand award ceremony.",
    badge: "Hackathon",
    isKeyDeadline: true,
  },
];

export const ELIGIBILITY_DATA = {
  institution: "Only students from Avanthi Institute of Engineering and Technology, Vizianagaram, are eligible.",
  departments: [
    { code: "CSM", name: "Computer Science and Engineering (Artificial Intelligence and Machine Learning)" },
    { code: "CSD", name: "Computer Science and Engineering (Data Science)" },
  ],
  years: ["2nd Year", "3rd Year"],
  teamSize: "Minimum: 1 participant · Maximum: 4 participants. Individual participation is allowed. CSM and CSD students can form mixed teams.",
  fee: "₹250 per team (remains the same regardless of the number of team members).",
  pptSubmission: [
    "Problem Understanding",
    "Proposed Solution",
    "Innovation and Uniqueness",
    "Technical Approach",
    "Proposed Architecture or Workflow",
    "Implementation Plan",
    "Expected Impact",
  ],
};

export const GUIDELINES = [
  "Participants must register within the registration period.",
  "Only eligible CSM and CSD students from the 2nd and 3rd years can participate.",
  "Team size must be between 1 and 4 members.",
  "Individual participation is permitted.",
  "A registration fee of ₹250 is applicable per team.",
  "Every team must submit its PPT before the deadline.",
  "Participants must provide accurate registration information.",
  "Teams must present original ideas.",
  "Shortlisted teams must participate in the subsequent event rounds.",
  "Participants must follow instructions provided by the event coordinators.",
];

export const RULES = [
  "Plagiarism and copying other teams' ideas are strictly prohibited.",
  "Misconduct, inappropriate behaviour, and disruption during the event will not be tolerated.",
  "Participants must maintain discipline throughout the event.",
  "Teams must adhere to the prescribed submission deadlines.",
  "Teams must follow the instructions of event coordinators and faculty.",
  "Any form of cheating or unfair practice may result in disqualification.",
  "Participants must respect judges, organizers, volunteers, and fellow participants.",
  "All submitted information must be genuine and accurate.",
  "Organizers reserve the right to disqualify teams violating event rules.",
  "All event results will be published online through the official event platforms/website.",
];

export const JUDGING_CRITERIA = [
  {
    parameter: "Innovation & Creativity",
    weightage: 25,
    description: "Originality, uniqueness, and creative thinking behind the proposed solution.",
  },
  {
    parameter: "Problem Understanding",
    weightage: 20,
    description: "How clearly the team identifies and understands the problem.",
  },
  {
    parameter: "Technical Feasibility",
    weightage: 20,
    description: "Technical possibility and practicality of implementing the solution.",
  },
  {
    parameter: "Practical Implementation",
    weightage: 20,
    description: "Potential to develop the idea into a functional and useful solution.",
  },
  {
    parameter: "Presentation & Communication",
    weightage: 15,
    description: "Clarity, confidence, technical explanation, and teamwork during presentation.",
  },
];

export const PRIZE_POOL = {
  total: 20000,
  categories: [
    {
      year: "2nd Year Category",
      description: "Dedicated competition tier for 2nd Year CSM & CSD innovators",
      totalCategory: 10000,
      prizes: [
        {
          rank: "Winner",
          amount: 7000,
          tone: "cyan",
          title: "2nd Year Winner",
          perks: ["₹7,000 Cash Prize", "Winner Trophy & Medals", "Certificate of Excellence"],
        },
        {
          rank: "Runner-up",
          amount: 3000,
          tone: "violet",
          title: "2nd Year Runner-up",
          perks: ["₹3,000 Cash Prize", "Runner-up Medals", "Certificate of Excellence"],
        },
      ],
    },
    {
      year: "3rd Year Category",
      description: "Dedicated competition tier for 3rd Year CSM & CSD innovators",
      totalCategory: 10000,
      prizes: [
        {
          rank: "Winner",
          amount: 7000,
          tone: "cyan",
          title: "3rd Year Winner",
          perks: ["₹7,000 Cash Prize", "Winner Trophy & Medals", "Certificate of Excellence"],
        },
        {
          rank: "Runner-up",
          amount: 3000,
          tone: "violet",
          title: "3rd Year Runner-up",
          perks: ["₹3,000 Cash Prize", "Runner-up Medals", "Certificate of Excellence"],
        },
      ],
    },
  ],
};

export const PARTICIPATION_BENEFITS = {
  allParticipants: [
    {
      title: "Unstop E-Certificate of Participation",
      detail: "Official e-certificate backed by the Unstop platform validating hackathon participation.",
    },
    {
      title: "Avanthi × Unstop E-Certificate of Participation",
      detail: "Co-branded institution e-certificate highlighting participation and technical engagement.",
    },
  ],
  round2Qualified: [
    {
      title: "Unstop Certificate of Excellence",
      detail: "Prestigious recognition awarded to finalists advancing to Round 2.",
    },
    {
      title: "Physical Certificate from Avanthi × Unstop",
      detail: "Printed physical certificate presented at the grand felicitation ceremony.",
    },
  ],
  generationNote: "E-certificates are generated immediately after the respective round ends. The system generates verifiable certificates as soon as the authorized round-completion process is triggered.",
};

export const FAQS = [
  {
    q: "Who can participate?",
    a: "Only 2nd-year and 3rd-year students from the CSM and CSD departments of Avanthi Institute of Engineering and Technology, Vizianagaram.",
  },
  {
    q: "Can students from other colleges participate?",
    a: "No. This event is exclusively for eligible students of Avanthi Institute of Engineering and Technology.",
  },
  {
    q: "What is the team size?",
    a: "Teams can have 1–4 members. Individual participation is also allowed.",
  },
  {
    q: "Can individual students participate?",
    a: "Yes. Individual participation is permitted.",
  },
  {
    q: "Is there any registration fee?",
    a: "Yes. The registration fee is ₹250 per team, irrespective of team size.",
  },
  {
    q: "Is PPT submission compulsory?",
    a: "Yes. Every team must submit its PPT before the specified deadline.",
  },
  {
    q: "Can CSM and CSD students form a team?",
    a: "Yes. Students from both eligible departments can form a mixed team.",
  },
  {
    q: "Will all participants receive certificates?",
    a: "Yes. Every participant will receive an Unstop E-Certificate of Participation and an Avanthi × Unstop E-Certificate.",
  },
  {
    q: "Will shortlisted candidates receive additional certificates?",
    a: "Yes. Round 2 qualified candidates will receive an Unstop Certificate of Excellence and a physical Avanthi × Unstop Certificate.",
  },
  {
    q: "Is accommodation provided?",
    a: "No. Accommodation is not provided.",
  },
  {
    q: "Where will the event take place?",
    a: "Avanthi Institute of Engineering and Technology, Vizianagaram.",
  },
  {
    q: "When will the event take place?",
    a: "21–22 December 2026.",
  },
  {
    q: "When will certificates be generated?",
    a: "E-certificates will be generated immediately after the respective round ends.",
  },
];

export const COORDINATORS = {
  student: [
    {
      role: "President",
      name: "Nagendra Senapathi",
      phone: "9063262364",
      whatsapp: "https://wa.me/919063262364",
    },
    {
      role: "Vice President",
      name: "K. Sanmuka Sai",
      phone: "7702265546",
      whatsapp: "https://wa.me/917702265546",
    },
  ],
  faculty: [
    {
      role: "Head of Department",
      name: "P. Sri Lakshmi",
      phone: "9652698303",
      whatsapp: "https://wa.me/919652698303",
    },
    {
      role: "Faculty Coordinator",
      name: "D. Kiran Kumar",
      phone: "8121219000",
      whatsapp: "https://wa.me/918121219000",
    },
  ],
};

export const VENUE = {
  name: "Avanthi Institute of Engineering and Technology",
  location: "Vizianagaram, Andhra Pradesh, India",
  mapsUrl: "https://maps.google.com/?q=Avanthi+Institute+of+Engineering+and+Technology+Vizianagaram",
};
