import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, keyword_suggestions } = body;

    if (!resume) {
      return NextResponse.json({ ok: false, message: "Resume is required" }, { status: 400 });
    }

    if (!Array.isArray(keyword_suggestions) || !keyword_suggestions.length) {
      return NextResponse.json({ ok: false, message: "keyword_suggestions is required" }, { status: 400 });
    }

    const updated = JSON.parse(JSON.stringify(resume));
    if (!Array.isArray(updated.skills)) updated.skills = [];

    let skillsEntry = updated.skills.find((s: any) => s.name === "Skills");
    if (!skillsEntry) {
      skillsEntry = { name: "Skills", level: "", keywords: [] };
      updated.skills.push(skillsEntry);
    }
    if (!Array.isArray(skillsEntry.keywords)) skillsEntry.keywords = [];

    const added: string[] = [];
    for (const suggestion of keyword_suggestions) {
      const keyword = typeof suggestion === "string" ? suggestion : suggestion.keyword || "";
      if (keyword && !skillsEntry.keywords.includes(keyword)) {
        skillsEntry.keywords.push(keyword);
        added.push(keyword);
      }
    }

    return NextResponse.json({
      ok: true,
      resume: updated,
      changes: [`${added.length} keyword(s) added`],
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
