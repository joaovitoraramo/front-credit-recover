// app/api/upload-avatar/route.ts
import {put} from "@vercel/blob";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const blob = await put(
        `avatars/user-${Date.now()}.webp`,
        file,
        {
            access: "public",
        }
    );

    return NextResponse.json({ url: blob.url });
}
