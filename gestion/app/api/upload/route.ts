import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: "Aucun fichier fourni." }, { status: 400 });
        }

        const ext = file.name.split(".").pop();
        const uniqueName = `uploads/${crypto.randomUUID()}.${ext}`;

        const blob = await put(uniqueName, file, {
            access: "public",
        });

        return NextResponse.json({ success: true, path: blob.url });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Échec de l'upload." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { path } = await request.json();
        if (!path) {
            return NextResponse.json({ success: false, message: "Chemin invalide." }, { status: 400 });
        }

        await del(path);

        return NextResponse.json({ success: true, message: "Fichier supprimé avec succès." });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Échec de la suppression." }, { status: 500 });
    }
}