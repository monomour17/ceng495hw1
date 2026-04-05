import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("elob2bauth");
    return response;
}