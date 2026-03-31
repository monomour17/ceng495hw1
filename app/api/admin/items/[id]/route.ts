import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("elob2bauth");
    if (!sessionCookie) return null;
    const user = JSON.parse(sessionCookie.value);
    return user.role === "admin" ? user : null;
}

// DELETE /api/admin/items/[id] — Ürünü ve ilgili tüm verileri sil
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { id } = await params;
        const itemId = new ObjectId(id);

        const client = await clientPromise;
        const db = client.db("elob2b");
        const itemsColl = db.collection("items");
        const usersColl = db.collection("users");

        // Ürünü bul
        const item = await itemsColl.findOne({ _id: itemId });
        if (!item) {
            return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
        }

        // Bu ürüne ait rating ve review veren kullanıcıları bul ve güncelle
        const affectedUserIds = new Set<string>();
        (item.ratings || []).forEach((r: any) => affectedUserIds.add(r.userId));
        (item.reviews || []).forEach((r: any) => affectedUserIds.add(r.userId));

        for (const userId of affectedUserIds) {
            try {
                const userObjId = new ObjectId(userId);
                // Kullanıcının givenRatings ve reviews array'lerinden bu item'a ait kayıtları sil
                await usersColl.updateOne(
                    { _id: userObjId },
                    {
                        $pull: {
                            givenRatings: { itemId: id },
                            reviews: { itemId: id },
                        } as any
                    }
                );
                // Kullanıcının averageRating'ini yeniden hesapla
                const updatedUser = await usersColl.findOne({ _id: userObjId });
                const userRatings = updatedUser?.givenRatings || [];
                const userAvg = userRatings.length > 0
                    ? parseFloat((userRatings.reduce((acc: number, r: any) => acc + r.value, 0) / userRatings.length).toFixed(1))
                    : 0;
                await usersColl.updateOne({ _id: userObjId }, { $set: { averageRating: userAvg } });
            } catch {
                // Geçersiz ObjectId'yi atla
            }
        }

        // Ürünü sil
        await itemsColl.deleteOne({ _id: itemId });

        return NextResponse.json({ message: "Ürün silindi." });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
