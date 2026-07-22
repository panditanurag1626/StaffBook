import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, action_verb_upgrades } = body;

    if (!resume) {
      return NextResponse.json({ ok: false, message: "Resume is required" }, { status: 400 });
    }

    if (!Array.isArray(action_verb_upgrades) || !action_verb_upgrades.length) {
      return NextResponse.json({ ok: false, message: "action_verb_upgrades is required" }, { status: 400 });
    }

    const updated = JSON.parse(JSON.stringify(resume));
    if (!Array.isArray(updated.work)) updated.work = [];

    let upgradeCount = 0;
    for (const { from, to } of action_verb_upgrades) {
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

    return NextResponse.json({
      ok: true,
      resume: updated,
      changes: [`${upgradeCount} verb(s) upgraded`],
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
