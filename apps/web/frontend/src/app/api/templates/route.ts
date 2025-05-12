// src/app/api/templates/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;

    const templates = await prisma.template.findMany({
      where: industry ? { industry: decodeURIComponent(industry) } : {},
      orderBy: { industry: "asc" },
    });

    return NextResponse.json(templates);
  } catch (err) {
    console.error("GET /api/templates error:", err);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { industry, topic,  prompt } = await req.json();

    // basic validation
    if (!industry || !topic || !prompt ) {
      return NextResponse.json(
        { error: "industry, topic, name and prompt are required" },
        { status: 400 }
      );
    }

    const record = await prisma.template.create({
      data: { industry, topic ,prompt },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates error:", err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
