import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const host = req.headers.get("host"); 
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const redirectUrl = `${protocol}://${host}/profile/${state}`;

  // If no code is provided, return a 400 response
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }


 

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URL,
        }),
      }
    );

    // Parse the response as JSON
    const tokenData = await tokenResponse.json();

    // If no access token is provided, return a 400 error
    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Failed to obtain access token" },
        { status: 400 }
      );
    }
    cookies().set({
      name: 'github_access_token',
      value: tokenData.access_token,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: '/',
    })
    const redirectWithToken = `${redirectUrl}?access_token=${tokenData.access_token}`;
    const response = NextResponse.redirect(redirectWithToken);
    return response;
  } catch (error) {
    console.error(
      "Error exchanging authorization code for access token:",
      error
    );

    // Handle internal server errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
