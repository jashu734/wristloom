// ============================================================
// Wristloom — File / Photo Upload API Route (Next.js)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to upload files' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (uploaded ${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 413 }
      );
    }

    const mimeType = file.type?.toLowerCase() || '';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WEBP, and HEIC images are accepted.' },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads for persistent access
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || '.jpg';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueName = `${cleanBase}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        url: `/uploads/${uniqueName}`,
        filename: uniqueName,
        size: file.size,
      });
    } catch (saveErr) {
      console.warn('Fallback to data URL:', saveErr);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ error: err.message ?? 'File upload failed' }, { status: 500 });
  }
}
