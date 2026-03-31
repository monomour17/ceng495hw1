import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("elob2bauth");
    if (!sessionCookie) return null;
    const user = JSON.parse(sessionCookie.value);
    return user.role === "admin" ? user : null;
}

// POST /api/admin/items — Yeni ürün ekle
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, price, seller, image, category, condition, batteryLife, age, size, material } = body;

        if (!name || !description || !price || !seller || !category || !condition) {
            return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
        }

        const newItem: any = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            seller: seller.trim(),
            image: image?.trim() || "",
            category,
            condition,
            rating: 0,
            reviews: [],
            ratings: [],
        };

        if (category === "GPS Sport Watches" && batteryLife) newItem.batteryLife = batteryLife.trim();
        if ((category === "Antique Furniture" || category === "Vinyls") && age) newItem.age = age;
        if (category === "Running Shoes" && size) newItem.size = size;
        if ((category === "Antique Furniture" || category === "Running Shoes") && material) newItem.material = material.trim();

        const client = await clientPromise;
        const db = client.db("elob2b");
        const result = await db.collection("items").insertOne(newItem);

        return NextResponse.json({ message: "Ürün eklendi.", id: result.insertedId.toString() });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
