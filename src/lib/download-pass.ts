/**
 * Generates and downloads a high-resolution, branded Team QR Attendance Pass image.
 */
export async function downloadTeamQrPass(team: {
  teamId: string;
  teamName: string;
  theme?: string;
  academicYear?: string;
}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 640;
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#080c18");
  gradient.addColorStop(0.5, "#0d1426");
  gradient.addColorStop(1, "#060912");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Neon Cyan Frame
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner Accent Frame
  ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Top Subheader
  ctx.textAlign = "center";
  ctx.fillStyle = "#00e5ff";
  ctx.font = "bold 13px monospace";
  ctx.fillText("DLIDES CLUB • AVANTHI INSTITUTE OF ENGG & TECH", width / 2, 65);

  // Event Main Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("HACK WITH AVANTHI 2026", width / 2, 102);

  // Badge Tag
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "bold 12px monospace";
  ctx.fillText("OFFICIAL TEAM ATTENDANCE PASS", width / 2, 128);

  // Horizontal divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(50, 150);
  ctx.lineTo(width - 50, 150);
  ctx.stroke();

  // Team ID
  ctx.fillStyle = "#00e5ff";
  ctx.font = "bold 32px monospace";
  ctx.fillText(team.teamId, width / 2, 195);

  // Team Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(team.teamName, width / 2, 235);

  // Theme & Year
  const subText = [team.theme ? `Theme: ${team.theme}` : null, team.academicYear].filter(Boolean).join(" • ");
  if (subText) {
    ctx.fillStyle = "#c084fc";
    ctx.font = "13px sans-serif";
    ctx.fillText(subText, width / 2, 265);
  }

  // QR Code Image
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    JSON.stringify({ teamId: team.teamId, name: team.teamName }),
  )}`;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = qrUrl;
    });

    const qrBoxSize = 250;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 295;

    // White rounded card background for QR
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrBoxX - 12, qrBoxY - 12, qrBoxSize + 24, qrBoxSize + 24);
    ctx.drawImage(img, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  } catch {
    // Fallback if image fails to load
    ctx.fillStyle = "#334155";
    ctx.fillRect(width / 2 - 125, 295, 250, 250);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    ctx.fillText("QR: " + team.teamId, width / 2, 420);
  }

  // Verification Tag
  ctx.fillStyle = "#34d399";
  ctx.font = "bold 13px monospace";
  ctx.fillText("● OFFICIAL CHECK-IN CREDENTIAL", width / 2, 605);

  // Instructions
  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px sans-serif";
  ctx.fillText("Present this QR pass at the venue registration desk for team check-in.", width / 2, 655);
  ctx.fillText("Valid for all team participants • AIET Campus, VZM", width / 2, 680);
  ctx.fillText("21 – 22 December 2026", width / 2, 705);

  // Bottom Security Token
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(50, 740);
  ctx.lineTo(width - 50, 740);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "10px monospace";
  ctx.fillText(`TOKEN: ${team.teamId} • VERIFIED REGISTRATION ENTRY PASS`, width / 2, 775);

  // Trigger Download
  const link = document.createElement("a");
  link.download = `HWA-Pass-${team.teamId}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
