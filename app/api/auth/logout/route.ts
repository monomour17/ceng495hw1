import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
    const response = NextResponse.redirect(`${proto}://${host}/`);
    response.cookies.delete("elob2bauth");
    return response;
}