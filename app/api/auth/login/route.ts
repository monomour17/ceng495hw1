import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            // FIX 1: { status: 400 } separated.
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("elob2b");
        const userscollection = db.collection("users");

        const user = await userscollection.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 401 });
        }

        // FIX 3: bcrypt logic suspended, password is checked directly.
        if (password !== user.password) {
            return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
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

        return NextResponse.json({ message: "Login successful." });

    } catch (error) {
        // FIX 2: Try block closes here.
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
