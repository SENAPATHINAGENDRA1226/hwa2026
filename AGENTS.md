## Project rules
- Event facts (dates, prizes, schedule, themes, register link) live only in `src/lib/event-content.ts`; components read from it so updates happen in one place.
- The 3D neural sphere is lazy-loaded behind `<ClientOnly>` so the rest of the page server-renders for SEO; it pauses rendering when off-screen.
- The site is single-page with in-page anchors because the brief asked for one continuous scrolling experience.
