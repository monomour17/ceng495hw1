"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
        if (res.ok) {
            router.push("/");
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || "Kullanıcı adı veya şifre hatalı");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">

                <h1 className="text-3xl font-extrabold text-center mb-2">Hoş Geldin</h1>
                <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">Devam etmek için giriş yap.</p>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Örn: elo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition"
                    >
                        Giriş Yap
                    </button>
                </form>
                <p className="text-center text-sm text-zinc-500 mt-6">
                    Ana sayfaya <Link href="/" className="text-blue-500 hover:underline">geri dön</Link>.
                </p>
            </div>
        </main>
    );

}