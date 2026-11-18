import { describe, expect, it } from "vitest";
import { getTimeLeft } from "@/lib/countdown";
import { EVENT } from "@/lib/event-content";

describe("countdown", () => {
  it("counts down to the event kick-off at 9:00 AM IST on 21 Dec 2026", () => {
    const now = new Date("2026-12-20T09:00:00+05:30");
    expect(getTimeLeft(new Date(EVENT.startsAt), now)).toEqual({
      days: 1, hours: 0, minutes: 0, seconds: 0, done: false,
    });
  });

  it("splits remaining time into days, hours, minutes and seconds", () => {
    const target = new Date("2026-12-18T09:00:00Z");
    const now = new Date("2026-12-15T06:28:55Z");
    expect(getTimeLeft(target, now)).toEqual({ days: 3, hours: 2, minutes: 31, seconds: 5, done: false });
  });

  it("stops at zero once the event has started", () => {
    const target = new Date("2026-12-18T09:00:00Z");
    expect(getTimeLeft(target, new Date("2026-12-19T00:00:00Z"))).toEqual({
      days: 0, hours: 0, minutes: 0, seconds: 0, done: true,
    });
  });
});
