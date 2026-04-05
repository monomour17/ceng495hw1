import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/", request.nextUrl));
    response.cookies.delete("elob2bauth");
    return response;
}