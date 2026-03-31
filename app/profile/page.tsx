import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import Link from "next/link";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("elob2bauth");
    if (!sessionCookie) redirect("/login");
    const sessionUser = JSON.parse(sessionCookie.value);
    if (sessionUser.role === "admin") redirect("/admin");

    const client = await clientPromise;
    const db = client.db("elob2b");
    const user = await db.collection("users").findOne({ _id: new ObjectId(sessionUser._id) });
    if (!user) redirect("/login");

    const renderStars = (rating: number) => {
        const full = Math.round(rating);
        return "★".repeat(full) + "☆".repeat(5 - full);
    };

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Üst bar */}
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-zinc-200 dark:border-zinc-800">
                    <Link href="/" className="text-blue-500 hover:underline font-semibold text-sm">← Ana Sayfaya Dön</Link>
                    <a href="/api/auth/logout" className="bg-red-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm">Çıkış Yap</a>
                </div>

                {/* Profil kartı */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-extrabold text-blue-600 dark:text-blue-300">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">{user.username}</h1>
                            <p className="text-zinc-500 text-sm">Normal Kullanıcı</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-yellow-500">{renderStars(user.averageRating || 0)}</p>
                            <p className="text-sm text-zinc-500 mt-1">Ortalama Puan: <span className="font-bold text-zinc-700 dark:text-zinc-300">{user.averageRating || 0} / 5</span></p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-blue-500">{(user.reviews || []).length}</p>
                            <p className="text-sm text-zinc-500 mt-1">Toplam Yorum</p>
                        </div>
                    </div>
                </div>

                {/* Verdiği puanlar */}
                {(user.givenRatings || []).length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">⭐ Verdiğim Puanlar ({user.givenRatings.length})</h2>
                        <div className="flex flex-col gap-2">
                            {user.givenRatings.map((r: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2.5">
                                    <Link href={`/items/${r.itemId}`} className="text-sm font-medium hover:text-blue-500 transition truncate max-w-xs">{r.itemName}</Link>
                                    <span className="text-yellow-500 font-bold shrink-0 ml-4">{"★".repeat(r.value)}{"☆".repeat(5 - r.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Yorumlar */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4">💬 Yorumlarım ({(user.reviews || []).length})</h2>
                    {(user.reviews || []).length === 0 ? (
                        <p className="text-zinc-500 text-sm">Henüz yorum yazmadınız.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {user.reviews.map((review: any, idx: number) => (
                                <div key={idx} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
                                    <Link href={`/items/${review.itemId}`} className="text-sm font-semibold text-blue-500 hover:underline">{review.itemName}</Link>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
