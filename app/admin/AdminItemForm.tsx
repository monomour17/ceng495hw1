"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Vinyls", "Antique Furniture", "GPS Sport Watches", "Running Shoes", "Camping Tents"];

export default function AdminItemForm() {
    const router = useRouter();
    const [category, setCategory] = useState("Vinyls");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch("/api/admin/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (res.ok) {
            setMessage("✓ Product added!");
            setIsError(false);
            form.reset();
            setCategory("Vinyls");
            router.refresh();
        } else {
            setMessage(json.error || "An error occurred.");
            setIsError(true);
        }
        setLoading(false);
    };

    const inputCls = "w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input name="name" required placeholder="Product Name *" className={inputCls} />
            <textarea name="description" required placeholder="Description *" rows={2} className={inputCls + " resize-none"} />
            <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" min="0" step="0.01" required placeholder="Price ($) *" className={inputCls} />
                <input name="seller" required placeholder="Seller *" className={inputCls} />
            </div>
            <input name="image" placeholder="Image URL (optional)" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
                <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="condition" className={inputCls}>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                </select>
            </div>

            {/* Category-specific fields */}
            {category === "GPS Sport Watches" && (
                <input name="batteryLife" placeholder="Battery Life (e.g. 14 Days)" className={inputCls} />
            )}
            {(category === "Antique Furniture" || category === "Vinyls") && (
                <input name="age" type="number" placeholder="Age (years)" className={inputCls} />
            )}
            {category === "Running Shoes" && (
                <input name="size" placeholder="Size (e.g. 42)" className={inputCls} />
            )}
            {(category === "Antique Furniture" || category === "Running Shoes") && (
                <input name="material" placeholder="Material (e.g. Wood, Leather)" className={inputCls} />
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? "Adding..." : "Add Product"}
            </button>
            {message && <p className={`text-sm ${isError ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{message}</p>}
        </form>
    );
}
