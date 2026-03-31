import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import RateForm from "./RateForm";
import ReviewForm from "./ReviewForm";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Session kontrolü
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("elob2bauth");
    let user = null;
    if (sessionCookie) {
        user = JSON.parse(sessionCookie.value);
    }

    // Item çek
    let item;
    try {
        const client = await clientPromise;
        const db = client.db("elob2b");
        item = await db.collection("items").findOne({ _id: new ObjectId(id) });
    } catch {
        notFound();
    }
    if (!item) notFound();

    const userExistingRating = user
        ? (item.ratings || []).find((r: any) => r.userId === user._id)?.value ?? null
        : null;

    const userExistingReview = user
        ? (item.reviews || []).find((r: any) => r.userId === user._id)?.text ?? null
        : null;

    const renderStars = (rating: number) => {
        const full = Math.round(rating);
        return "★".repeat(full) + "☆".repeat(5 - full);
    };

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Üst bar */}
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-zinc-200 dark:border-zinc-800">
                    <Link href="/" className="text-blue-500 hover:underline font-semibold">← Ana Sayfaya Dön</Link>
                    {user ? (
                        <span className="text-sm text-zinc-500">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.username}</span>
                            {user.role === "admin" && " (Yetkili)"}
                            {" · "}
                            {user.role !== "admin" && <Link href="/profile" className="text-blue-500 hover:underline">Profilim</Link>}
                            {user.role === "admin" && <Link href="/admin" className="text-blue-500 hover:underline">Admin Paneli</Link>}
                            {" · "}
                            <a href="/api/auth/logout" className="text-red-500 hover:underline">Çıkış Yap</a>
                        </span>
                    ) : (
                        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">Giriş Yap</Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Sol: Görsel */}
                    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Sağ: Detaylar */}
                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{item.category}</span>
                        <h1 className="text-3xl font-extrabold leading-tight">{item.name}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">{item.description}</p>

                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${item.price}</div>

                        {/* Detay tablosu */}
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400 w-36">Satıcı</td>
                                        <td className="px-4 py-2.5">{item.seller}</td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Durum</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.condition === "new" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                {item.condition === "new" ? "Yeni" : "İkinci El"}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Puan</td>
                                        <td className="px-4 py-2.5">
                                            <span className="text-yellow-500 font-bold">{renderStars(item.rating || 0)}</span>
                                            <span className="ml-2 text-zinc-500 text-xs">({(item.ratings || []).length} oy)</span>
                                        </td>
                                    </tr>
                                    {item.batteryLife && (
                                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                            <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Batarya</td>
                                            <td className="px-4 py-2.5">{item.batteryLife}</td>
                                        </tr>
                                    )}
                                    {item.age !== undefined && (
                                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                            <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Yaş</td>
                                            <td className="px-4 py-2.5">{item.age} yıl</td>
                                        </tr>
                                    )}
                                    {item.size !== undefined && (
                                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                            <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Numara</td>
                                            <td className="px-4 py-2.5">{item.size}</td>
                                        </tr>
                                    )}
                                    {item.material && (
                                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                            <td className="px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">Malzeme</td>
                                            <td className="px-4 py-2.5">{item.material}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Rate formu — sadece login olmuş normal kullanıcılar */}
                        {user && user.role !== "admin" && (
                            <RateForm itemId={id} currentRating={userExistingRating} />
                        )}
                        {!user && (
                            <p className="text-sm text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
                                Puan vermek ve yorum yazmak için <Link href="/login" className="text-blue-500 hover:underline">giriş yapın</Link>.
                            </p>
                        )}
                    </div>
                </div>

                {/* Review formu */}
                {user && user.role !== "admin" && (
                    <div className="mt-10">
                        <ReviewForm itemId={id} existingReview={userExistingReview} />
                    </div>
                )}

                {/* Yorumlar listesi */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold mb-4">Yorumlar ({(item.reviews || []).length})</h2>
                    {(item.reviews || []).length === 0 ? (
                        <p className="text-zinc-500">Henüz yorum yapılmamış.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {(item.reviews || []).map((review: any, idx: number) => (
                                <div key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-blue-500">{review.username}</span>
                                        <span className="text-xs text-zinc-400">{new Date(review.createdAt).toLocaleDateString("tr-TR")}</span>
                                    </div>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
