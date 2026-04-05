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

// DELETE /api/admin/items/[id] — Delete product and all related data
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
        const itemId = new ObjectId(id);

        const client = await clientPromise;
        const db = client.db("elob2b");
        const itemsColl = db.collection("items");
        const usersColl = db.collection("users");

        // Find the product
        const item = await itemsColl.findOne({ _id: itemId });
        if (!item) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        // Find and update users who rated/reviewed this product
        const affectedUserIds = new Set<string>();
        (item.ratings || []).forEach((r: any) => affectedUserIds.add(r.userId));
        (item.reviews || []).forEach((r: any) => affectedUserIds.add(r.userId));

        for (const userId of affectedUserIds) {
            try {
                const userObjId = new ObjectId(userId);
                // Remove this item's records from user's givenRatings and reviews arrays
                await usersColl.updateOne(
                    { _id: userObjId },
                    {
                        $pull: {
                            givenRatings: { itemId: id },
                            reviews: { itemId: id },
                        } as any
                    }
                );
                // Recalculate user's averageRating
                const updatedUser = await usersColl.findOne({ _id: userObjId });
                const userRatings = updatedUser?.givenRatings || [];
                const userAvg = userRatings.length > 0
                    ? parseFloat((userRatings.reduce((acc: number, r: any) => acc + r.value, 0) / userRatings.length).toFixed(1))
                    : 0;
                await usersColl.updateOne({ _id: userObjId }, { $set: { averageRating: userAvg } });
            } catch {
                // Skip invalid ObjectId
            }
        }

        // Delete the product
        await itemsColl.deleteOne({ _id: itemId });

        return NextResponse.json({ message: "Product deleted." });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
