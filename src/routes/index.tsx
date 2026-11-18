import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/hackathon/About";
import { ContactVenue } from "@/components/hackathon/ContactVenue";
import { Eligibility } from "@/components/hackathon/Eligibility";
import { Evaluation } from "@/components/hackathon/Evaluation";
import { FAQ } from "@/components/hackathon/FAQ";
import { Footer } from "@/components/hackathon/Footer";
import { Guidelines } from "@/components/hackathon/Guidelines";
import { Hero } from "@/components/hackathon/Hero";
import { Navbar } from "@/components/hackathon/Navbar";
import { ParticipationBenefits } from "@/components/hackathon/ParticipationBenefits";
import { ParticleField } from "@/components/hackathon/ParticleField";
import { Prizes } from "@/components/hackathon/Prizes";
import { Rules } from "@/components/hackathon/Rules";
import { ProblemStatements } from "@/components/hackathon/Themes";
import { Timeline } from "@/components/hackathon/Timeline";

const TITLE = "HACK WITH AVANTHI 2026 — 24-Hour AI Hackathon by DLIDES CLUB";
const DESCRIPTION =
  "Where Intelligence Meets Innovation. A 24-hour technical hackathon at Avanthi Institute of Engineering & Technology (21 – 22 Dec 2026) for 2nd and 3rd year CSM & CSD students. ₹20,000 prize pool.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <ParticleField />
      <Navbar />
      <main>
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. About Hack With Avanthi */}
        <About />

        {/* 3. Problem Statements */}
        <ProblemStatements />

        {/* 4. Timeline of the Event */}
        <Timeline />

        {/* 5. Eligibility Criteria */}
        <Eligibility />

        {/* 6. Guidelines */}
        <Guidelines />

        {/* 7. Rules & Code of Conduct */}
        <Rules />

        {/* 8 & 9. Evaluation & Judging Criteria */}
        <Evaluation />

        {/* 10. Prize Pool (₹20,000) */}
        <Prizes />

        {/* 11. Participation Benefits for All Teams */}
        <ParticipationBenefits />

        {/* 12. Common Queries – Frequently Asked Questions */}
        <FAQ />

        {/* 13. Get in Touch – Contact & Venue */}
        <ContactVenue />
      </main>

      {/* 14. Footer */}
      <Footer />
    </div>
  );
}
