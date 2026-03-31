import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminItemForm from "./AdminItemForm";
import AdminUserForm from "./AdminUserForm";
import AdminDeleteButtons from "./AdminDeleteButtons";

export default async function AdminPage() {
    // Admin kontrolü
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("elob2bauth");
    if (!sessionCookie) redirect("/login");
    const user = JSON.parse(sessionCookie.value);
    if (user.role !== "admin") redirect("/");

    const client = await clientPromise;
    const db = client.db("elob2b");
    const items = await db.collection("items").find({}).sort({ name: 1 }).toArray();
    const users = await db.collection("users").find({}).sort({ username: 1 }).toArray();

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Üst bar */}
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-zinc-200 dark:border-zinc-800">
                    <div>
                        <Link href="/" className="text-blue-500 hover:underline text-sm">← Ana Sayfa</Link>
                        <h1 className="text-3xl font-extrabold mt-1">Admin Paneli</h1>
                    </div>
                    <a href="/api/auth/logout" className="bg-red-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm">Çıkış Yap</a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* SOL: Item yönetimi */}
                    <div className="flex flex-col gap-6">

                        {/* Yeni ürün formu */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">➕ Yeni Ürün Ekle</h2>
                            <AdminItemForm />
                        </div>

                        {/* Mevcut ürünler listesi */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">🗑️ Ürün Sil ({items.length})</h2>
                            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item._id.toString()} className="flex items-center justify-between gap-3 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-zinc-400">{item.category} · ${item.price}</p>
                                        </div>
                                        <AdminDeleteButtons type="item" id={item._id.toString()} name={item.name} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ: User yönetimi */}
                    <div className="flex flex-col gap-6">

                        {/* Yeni kullanıcı formu */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">➕ Yeni Kullanıcı Ekle</h2>
                            <AdminUserForm />
                        </div>

                        {/* Mevcut kullanıcılar listesi */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">🗑️ Kullanıcı Sil ({users.length})</h2>
                            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                                {users.map((u) => (
                                    <div key={u._id.toString()} className="flex items-center justify-between gap-3 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">{u.username}</p>
                                            <p className="text-xs text-zinc-400">
                                                {u.role === "admin" ? "⚡ Admin" : "👤 Kullanıcı"}
                                                {" · "} Ort. Puan: {u.averageRating ?? 0}
                                            </p>
                                        </div>
                                        {u.role !== "admin" && (
                                            <AdminDeleteButtons type="user" id={u._id.toString()} name={u.username} />
                                        )}
                                        {u.role === "admin" && (
                                            <span className="text-xs text-zinc-400 italic">Silinemez</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
