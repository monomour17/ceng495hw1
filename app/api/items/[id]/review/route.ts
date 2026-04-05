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
            return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
        }
        const user = JSON.parse(sessionCookie.value);

        const { id } = await params;
        const body = await request.json();
        const { text } = body;
        if (!text || text.trim() === "") {
            return NextResponse.json({ error: "Review cannot be empty." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("elob2b");
        const itemsColl = db.collection("items");
        const usersColl = db.collection("users");

        const itemId = new ObjectId(id);
        const item = await itemsColl.findOne({ _id: itemId });
        if (!item) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        const existingReviewIndex = (item.reviews || []).findIndex((r: any) => r.userId === user._id);
        const now = new Date().toISOString();

        if (existingReviewIndex !== -1) {
            // Update existing review with "Edit: " prefix
            const existingText = item.reviews[existingReviewIndex].text;
            const updatedText = existingText + " Edit: " + text.trim();
            await itemsColl.updateOne(
                { _id: itemId, "reviews.userId": user._id },
                { $set: { "reviews.$.text": updatedText, "reviews.$.updatedAt": now } }
            );

            // Also update the user's reviews
            const userObjId = new ObjectId(user._id);
            const dbUser = await usersColl.findOne({ _id: userObjId });
            const userReviewIndex = (dbUser?.reviews || []).findIndex((r: any) => r.itemId === id);
            if (userReviewIndex !== -1) {
                const existingUserText = dbUser!.reviews[userReviewIndex].text;
                const updatedUserText = existingUserText + " Edit: " + text.trim();
                await usersColl.updateOne(
                    { _id: userObjId, "reviews.itemId": id },
                    { $set: { "reviews.$.text": updatedUserText } }
                );
            }

            return NextResponse.json({ message: "Review updated." });
        } else {
            // Add new review
            const newReview = {
                userId: user._id,
                username: user.username,
                text: text.trim(),
                createdAt: now,
            };
            await itemsColl.updateOne(
                { _id: itemId },
                { $push: { reviews: newReview } } as any
            );

            // Add to user's reviews array
            await usersColl.updateOne(
                { _id: new ObjectId(user._id) },
                { $push: { reviews: { itemId: id, itemName: item.name, text: text.trim() } } } as any
            );

            return NextResponse.json({ message: "Review added." });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
