import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("elob2bauth");
  let user = null;
  if (sessionCookie) {
    user = JSON.parse(sessionCookie.value); // login olmuşsa tekrar giriş yap butonu olmasın diye
  }
  const params = await searchParams;
  const selectedcat = params.category;

  // Veritabanından Verileri Canlı Çekiyoruz
  const client = await clientPromise;
  const db = client.db("elob2b");
  const itemscoll = db.collection("items");

  const query = selectedcat ? { category: selectedcat } : {};
  const items = await itemscoll.find(query).toArray();

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <div className="max-w-6xl mx-auto">

        {/* --- ÜST BAŞLIK VE MENÜ --- */}
        <div className="flex justify-between items-center mb-10 border-b pb-4 border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-extrabold tracking-tight">EloB2B Market</h1>

          {/* Adam giriş yaptıysa  adını yaz, yapmadıysa Giriş Yap butonu çıksın */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <Link href="/admin" className="bg-amber-500 font-semibold text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition text-sm">
                  ⚡ Admin Paneli
                </Link>
              ) : (
                <Link href="/profile" className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-500 transition text-sm">
                  👤 {user.username}
                </Link>
              )}
              <a href="/api/auth/logout" className="bg-red-500 font-semibold text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm">
                Çıkış Yap
              </a>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 font-semibold text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition">
              Giriş Yap
            </Link>
          )}

        </div>


        {/* --- KATEGORİ FİLTRELERİ --- */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            Tümü
          </Link>
          <Link href="/?category=Vinyls" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            Vinyls (Plaklar)
          </Link>
          <Link href="/?category=Antique Furniture" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            Antique Furniture
          </Link>
          <Link href="/?category=GPS Sport Watches" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            GPS Sport Watches
          </Link>
          <Link href="/?category=Running Shoes" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            Running Shoes
          </Link>
          <Link href="/?category=Camping Tents" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full font-medium whitespace-nowrap hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
            Camping Tents
          </Link>
        </div>

        {/* --- ÜRÜN KARTLARI LİSTESİ --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id.toString()} className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition">

              {/* Ürün Görseli */}
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                  ★ {item.rating || 0}
                </div>
              </div>

              {/* Ürün Detayları */}
              <div className="flex flex-col flex-grow">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                  {item.description}
                </p>

                {/* Fiyat ve İncele Butonu */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ${item.price}
                  </span>
                  <Link href={`/items/${item._id.toString()}`} className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-blue-500 transition-colors">
                    İncele →
                  </Link>
                </div>
              </div>

            </div>
          ))}
          {/* Eğer Kategori Boşsa Uyarı Ver */}
          {items.length === 0 && (
            <p className="text-zinc-500 col-span-full pt-10 text-center">Bu kategoride hiç ürün bulunamadı.</p>
          )}
        </div>

      </div>
    </main>
  ); //hocam html bilmediğim için claude yardım etti
}
