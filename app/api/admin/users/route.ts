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

// POST /api/admin/users — Add new user
export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
        }

        const body = await request.json();
        const { username, password, role } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("elob2b");
        const usersColl = db.collection("users");

        // Username uniqueness check
        const existing = await usersColl.findOne({ username });
        if (existing) {
            return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
        }

        const newUser = {
            username: username.trim(),
            password: password,
            role: role === "admin" ? "admin" : "user",
            averageRating: 0,
            givenRatings: [],
            reviews: [],
        };

        const result = await usersColl.insertOne(newUser);
        return NextResponse.json({ message: "User added.", id: result.insertedId.toString() });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
