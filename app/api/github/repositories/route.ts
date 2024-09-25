import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("github_access_token")?.value;
    
    // Extract page and limit from query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "4", 10);
    
    // If access token is missing, show message for users without a GitHub account
    if (!accessToken) {
      return NextResponse.json({
        error: "You don't have any GitHub repositories because you're not authenticated with GitHub."
      }, { status: 401 });
    }

    // If access token is present, fetch user-specific repositories
    const userReposResponse = await fetch(
      `https://api.github.com/user/repos?per_page=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    // Check if the user repo response is okay
    if (!userReposResponse.ok) {
      const error = await userReposResponse.json();
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const userRepositories = await userReposResponse.json();
    return NextResponse.json({
      repos: userRepositories,
      page,
      limit,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}