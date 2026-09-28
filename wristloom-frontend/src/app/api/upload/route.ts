// ============================================================
// Wristloom — File / Photo Upload API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ error: err.message ?? 'File upload failed' }, { status: 500 });
  }
}
