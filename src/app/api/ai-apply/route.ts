import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, ai_analysis } = body;

    if (!resume) {
      return NextResponse.json({ ok: false, message: "Resume is required" }, { status: 400 });
    }

    const updated = JSON.parse(JSON.stringify(resume));
    const changes: string[] = [];

    // 1. Summary
    if (ai_analysis?.summary_rewrite) {
      if (!updated.basics) updated.basics = {};
      updated.basics.summary = ai_analysis.summary_rewrite;
      changes.push("Summary rewritten");
    }

    // 2. Keywords
    if (Array.isArray(ai_analysis?.keyword_suggestions) && ai_analysis.keyword_suggestions.length) {
      if (!Array.isArray(updated.skills)) updated.skills = [];
      let skillsEntry = updated.skills.find((s: any) => s.name === "Skills");
      if (!skillsEntry) {
        skillsEntry = { name: "Skills", level: "", keywords: [] };
        updated.skills.push(skillsEntry);
      }
      if (!Array.isArray(skillsEntry.keywords)) skillsEntry.keywords = [];

      let added = 0;
      for (const suggestion of ai_analysis.keyword_suggestions) {
        const keyword = typeof suggestion === "string" ? suggestion : suggestion.keyword || "";
        if (keyword && !skillsEntry.keywords.includes(keyword)) {
          skillsEntry.keywords.push(keyword);
          added++;
        }
      }
      changes.push(`${added} keyword(s) added`);
    }

    // 3. Verbs
    if (Array.isArray(ai_analysis?.action_verb_upgrades) && ai_analysis.action_verb_upgrades.length) {
      if (!Array.isArray(updated.work)) updated.work = [];
      let upgradeCount = 0;
      for (const { from, to } of ai_analysis.action_verb_upgrades) {
        if (!from || !to) continue;
        for (const work of updated.work) {
          if (Array.isArray(work.highlights)) {
            work.highlights = work.highlights.map((h: string) => {
              if (typeof h === "string" && h.toLowerCase().includes(from.toLowerCase())) {
                upgradeCount++;
                return h.replace(new RegExp(from, "gi"), to);
              }
              return h;
            });
          }
        }
      }
      changes.push(`${upgradeCount} verb(s) upgraded`);
    }

    return NextResponse.json({ ok: true, resume: updated, changes });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
