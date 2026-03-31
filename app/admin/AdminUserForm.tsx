"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (res.ok) {
            setMessage("✓ Kullanıcı eklendi!");
            setIsError(false);
            form.reset();
            router.refresh();
        } else {
            setMessage(json.error || "Hata oluştu.");
            setIsError(true);
        }
        setLoading(false);
    };

    const inputCls = "w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input name="username" required placeholder="Kullanıcı Adı *" className={inputCls} />
            <input name="password" required placeholder="Şifre *" className={inputCls} />
            <select name="role" className={inputCls}>
                <option value="user">Normal Kullanıcı</option>
                <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
                {loading ? "Ekleniyor..." : "Kullanıcı Ekle"}
            </button>
            {message && <p className={`text-sm ${isError ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{message}</p>}
        </form>
    );
}
