"use client";

export default function LogoutButton({ className }: { className?: string }) {
    const handleLogout = async () => {
        await fetch("/api/auth/logout");
        window.location.href = "/";
    };

    return (
        <button onClick={handleLogout} className={className}>
            Log Out
        </button>
    );
}
