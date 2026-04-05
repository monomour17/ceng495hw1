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

// DELETE /api/admin/users/[id] — Delete user and all related data
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
        }

        const { id } = await params;
        const userObjId = new ObjectId(id);

        const client = await clientPromise;
        const db = client.db("elob2b");
        const usersColl = db.collection("users");
        const itemsColl = db.collection("items");

        const targetUser = await usersColl.findOne({ _id: userObjId });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // Prevent admin from deleting themselves
        if (id === admin._id) {
            return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
        }

        // Remove this user's ratings and reviews from all items
        await itemsColl.updateMany(
            {},
            {
                $pull: {
                    ratings: { userId: id },
                    reviews: { userId: id },
                } as any
            }
        );

        // Update item rating averages (affected items)
        const allItems = await itemsColl.find({}).toArray();
        for (const item of allItems) {
            const ratings = item.ratings || [];
            const avg = ratings.length > 0
                ? parseFloat((ratings.reduce((acc: number, r: any) => acc + r.value, 0) / ratings.length).toFixed(1))
                : 0;
            await itemsColl.updateOne({ _id: item._id }, { $set: { rating: avg } });
        }

        // Delete user
        await usersColl.deleteOne({ _id: userObjId });

        return NextResponse.json({ message: "User deleted." });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
