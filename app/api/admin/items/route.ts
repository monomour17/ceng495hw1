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

// POST /api/admin/items — Add new product
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, price, seller, image, category, condition, batteryLife, age, size, material } = body;

        if (!name || !description || !price || !seller || !category || !condition) {
            return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
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

        return NextResponse.json({ message: "Product added.", id: result.insertedId.toString() });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
