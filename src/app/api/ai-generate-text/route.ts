import { NextRequest, NextResponse } from "next/server";

const STRONG_VERBS: Record<number, string[]> = {
  1: ["Spearheaded", "Architected", "Engineered", "Optimized", "Delivered", "Led"],
  2: ["Migrated", "Automated", "Scaled", "Implemented", "Integrated", "Refactored"],
  3: ["Mentored", "Directed", "Championed", "Negotiated", "Orchestrated", "Pioneered"],
};

function generateBullets(resume: any, attempt: number): string {
  const work: any[] = resume?.work || [];
  const skills: string[] = resume?.skills?.[0]?.keywords || [];
  const lines: string[] = [];
  const verbs = STRONG_VERBS[attempt] || STRONG_VERBS[1];

  for (const job of work.slice(0, 3)) {
    const position = job.position || "Professional";
    const company = job.company || "the team";
    const existing = Array.isArray(job.highlights) ? job.highlights : [];
    const techMention = skills.length ? ` using ${skills.slice(0, 3).join(", ")}` : "";

    if (existing.length === 0) {
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      lines.push(`${verb} ${position.toLowerCase()} initiatives at ${company}${techMention}, driving measurable impact across key performance indicators.`);
    }

    for (const highlight of existing.slice(0, 2)) {
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      const cleaned = highlight.replace(/^[-•*]\s*/, "");
      if (/^[A-Z]/.test(cleaned) && !cleaned.startsWith(position)) {
        lines.push(`${verb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`);
      } else {
        lines.push(cleaned);
      }
    }
  }

  if (lines.length === 0 && skills.length > 0) {
    const verb = verbs[0];
    lines.push(`${verb} end-to-end development of scalable applications leveraging ${skills.slice(0, 4).join(", ")}.`);
    lines.push("Improved system performance and code quality through proactive refactoring and best practices adoption.");
  }

  if (lines.length === 0) {
    lines.push("Results-driven professional with a track record of delivering high-impact projects on time.");
    lines.push("Collaborated with cross-functional teams to define requirements and drive technical excellence.");
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, attempt_number } = body;

    if (!resume) {
      return NextResponse.json({ ok: false, message: "Resume is required" }, { status: 400 });
    }

    const attempt = attempt_number || 1;
    const generated_text = generateBullets(resume, attempt);

    return NextResponse.json({ ok: true, generated_text, attempt_number: attempt });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
