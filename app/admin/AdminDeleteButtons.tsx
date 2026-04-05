"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDeleteButtons({ type, id, name }: { type: "item" | "user"; id: string; name: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmMsg = type === "item"
            ? `The product "${name}" will be deleted. Are you sure?`
            : `The user "${name}" will be deleted. Are you sure?`;
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        const endpoint = type === "item" ? `/api/admin/items/${id}` : `/api/admin/users/${id}`;
        const res = await fetch(endpoint, { method: "DELETE" });
        if (res.ok) {
            router.refresh();
        } else {
            const json = await res.json();
            alert(json.error || "Delete operation failed.");
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="shrink-0 bg-red-100 text-red-600 hover:bg-red-200 font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
            {loading ? "..." : "Delete"}
        </button>
    );
}
