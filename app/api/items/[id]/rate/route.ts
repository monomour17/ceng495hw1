import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("elob2bauth");
        if (!sessionCookie) {
            return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
        }
        const user = JSON.parse(sessionCookie.value);

        const { id } = await params;
        const body = await request.json();
        const value = parseInt(body.value);
        if (isNaN(value) || value < 1 || value > 5) {
            return NextResponse.json({ error: "Geçersiz puan (1-5 arası olmalı)." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("elob2b");
        const itemsColl = db.collection("items");
        const usersColl = db.collection("users");

        const itemId = new ObjectId(id);
        const item = await itemsColl.findOne({ _id: itemId });
        if (!item) {
            return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
        }

        // Kullanıcının daha önce oy verip vermediğini kontrol et
        const existingRating = (item.ratings || []).find((r: any) => r.userId === user._id);

        if (existingRating) {
            // Üstüne yaz
            await itemsColl.updateOne(
                { _id: itemId, "ratings.userId": user._id },
                { $set: { "ratings.$.value": value } }
            );
        } else {
            // Yeni ekle
            await itemsColl.updateOne(
                { _id: itemId },
                { $push: { ratings: { userId: user._id, username: user.username, value } } } as any
            );
        }

        // Item ortalama rating'i yeniden hesapla
        const updatedItem = await itemsColl.findOne({ _id: itemId });
        const ratings = updatedItem?.ratings || [];
        const avg = ratings.length > 0
            ? parseFloat((ratings.reduce((acc: number, r: any) => acc + r.value, 0) / ratings.length).toFixed(1))
            : 0;
        await itemsColl.updateOne({ _id: itemId }, { $set: { rating: avg } });

        // Kullanıcının givenRatings'ini güncelle
        const userObjId = new ObjectId(user._id);
        const dbUser = await usersColl.findOne({ _id: userObjId });
        const existingUserRating = (dbUser?.givenRatings || []).find((r: any) => r.itemId === id);

        if (existingUserRating) {
            await usersColl.updateOne(
                { _id: userObjId, "givenRatings.itemId": id },
                { $set: { "givenRatings.$.value": value } }
            );
        } else {
            await usersColl.updateOne(
                { _id: userObjId },
                { $push: { givenRatings: { itemId: id, itemName: item.name, value } } } as any
            );
        }

        // Kullanıcı averageRating'i yeniden hesapla
        const updatedUser = await usersColl.findOne({ _id: userObjId });
        const userRatings = updatedUser?.givenRatings || [];
        const userAvg = userRatings.length > 0
            ? parseFloat((userRatings.reduce((acc: number, r: any) => acc + r.value, 0) / userRatings.length).toFixed(1))
            : 0;
        await usersColl.updateOne({ _id: userObjId }, { $set: { averageRating: userAvg } });

        return NextResponse.json({ message: "Puan verildi.", rating: avg });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
