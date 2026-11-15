import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/hackathon/About";
import { Footer } from "@/components/hackathon/Footer";
import { Hero } from "@/components/hackathon/Hero";
import { Navbar } from "@/components/hackathon/Navbar";
import { ParticleField } from "@/components/hackathon/ParticleField";
import { Prizes } from "@/components/hackathon/Prizes";
import { Register } from "@/components/hackathon/Register";
import { Themes } from "@/components/hackathon/Themes";
import { Timeline } from "@/components/hackathon/Timeline";

const TITLE = "HACK WITH AVANTHI 2026 — 24-Hour AI Hackathon by DLIDES CLUB";
const DESCRIPTION =
  "Where Intelligence Meets Innovation. A two-day technical hackathon at Avanthi Institute of Engineering & Technology with nine themes, cash prizes and mentors.";

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
        <Hero />
        <About />
        <Themes />
        <Timeline />
        <Prizes />
        <Register />
      </main>
      <Footer />
    </div>
  );
}
