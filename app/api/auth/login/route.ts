import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            // HATA 1 DÜZELDİ: { status: 400 } ayrıldı.
            return NextResponse.json({ error: "Kullanıcı adı ve şifre girmek gerekir." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("elob2b");
        const userscollection = db.collection("users");

        const user = await userscollection.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 401 });
        }

        // HATA 3 DÜZELDİ: bcrypt mantığı askıya alındı, şifre direkt kontrol ediliyor.
        if (password !== user.password) {
            return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
        }

        const sessiondata = {
            _id: user._id.toString(),
            username: user.username,
            role: user.role
        };

        const cookiestore = await cookies();
        cookiestore.set("elob2bauth", JSON.stringify(sessiondata), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });

        return NextResponse.json({ message: "Giriş başarılı." });

    } catch (error) {
        // HATA 2 DÜZELDİ: Try bloğu en son burada kapanıyor.
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
