"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RateForm({ itemId, currentRating }: { itemId: string; currentRating: number | null }) {
    const [selected, setSelected] = useState<number>(currentRating ?? 0);
    const [hover, setHover] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleRate = async (value: number) => {
        setLoading(true);
        setMessage("");
        setSelected(value);
        const res = await fetch(`/api/items/${itemId}/rate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage(`✓ Puanınız kaydedildi (${value}/5)`);
            router.refresh();
        } else {
            setMessage(data.error || "Hata oluştu.");
        }
        setLoading(false);
    };

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900">
            <p className="text-sm font-semibold mb-3">
                {currentRating ? `Mevcut puanınız: ${currentRating}/5 — Güncellemek için tıklayın:` : "Bu ürünü puanlayın:"}
            </p>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        disabled={loading}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className={`text-3xl transition-transform hover:scale-110 disabled:opacity-50 ${star <= (hover || selected) ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-600"}`}
                    >
                        ★
                    </button>
                ))}
            </div>
            {message && <p className="text-sm mt-2 text-emerald-600 dark:text-emerald-400">{message}</p>}
        </div>
    );
}
