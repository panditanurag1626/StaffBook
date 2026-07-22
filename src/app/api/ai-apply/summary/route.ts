import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, summary_rewrite, summary } = body;

    if (!resume) {
      return NextResponse.json({ ok: false, message: "Resume is required" }, { status: 400 });
    }

    const newSummary = summary_rewrite || summary;
    if (!newSummary) {
      return NextResponse.json({ ok: false, message: "summary_rewrite is required" }, { status: 400 });
    }

    const updated = JSON.parse(JSON.stringify(resume));
    if (!updated.basics) updated.basics = {};
    updated.basics.summary = newSummary;

    return NextResponse.json({ ok: true, resume: updated, changes: ["Summary rewritten"] });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
