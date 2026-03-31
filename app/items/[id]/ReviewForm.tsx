"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ itemId, existingReview }: { itemId: string; existingReview: string | null }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        setMessage("");
        const res = await fetch(`/api/items/${itemId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage(existingReview ? "✓ Yorumunuz güncellendi." : "✓ Yorumunuz eklendi.");
            setText("");
            router.refresh();
        } else {
            setMessage(data.error || "Hata oluştu.");
        }
        setLoading(false);
    };

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900">
            <h3 className="font-bold text-lg mb-3">
                {existingReview ? "Yorumunuzu Güncelleyin" : "Yorum Yazın"}
            </h3>
            {existingReview && (
                <div className="mb-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1">Mevcut yorumunuz:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{existingReview}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={existingReview ? "Güncellemek istediğiniz kısmı yazın..." : "Yorumunuzu yazın..."}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="self-start bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Kaydediliyor..." : existingReview ? "Güncelle" : "Yorum Yap"}
                </button>
            </form>
            {message && <p className="text-sm mt-2 text-emerald-600 dark:text-emerald-400">{message}</p>}
        </div>
    );
}
