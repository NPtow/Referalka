import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function parseResumeText(file: File, buffer: Buffer): Promise<string | null> {
  const mimeType = file.type;
  let text = "";

  if (mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const result = await pdfParse(buffer);
    text = result.text;
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    return null;
  }

  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(req: NextRequest) {
  try {
    const appUser = await resolveCurrentAppUser();
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Файл должен быть до 15 MB" }, { status: 400 });
    }

    const lower = file.name.toLowerCase();
    if (!(lower.endsWith(".pdf") || lower.endsWith(".docx"))) {
      return NextResponse.json({ error: "Поддерживаются только PDF и DOCX" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(
      `resumes/${appUser.id}/${Date.now()}-${sanitizeFileName(file.name)}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
      }
    );

    const parsedText = await parseResumeText(file, buffer);

    return NextResponse.json({
      resumeFileUrl: blob.url,
      resumeFileName: file.name,
      resumeFileMime: file.type || null,
      resumeFileSize: file.size,
      resumeText: parsedText,
    });
  } catch (err) {
    console.error("[Profile Resume Upload]", err);
    return NextResponse.json({ error: "Не удалось загрузить резюме" }, { status: 500 });
  }
}
