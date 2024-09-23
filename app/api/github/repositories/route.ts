import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("github_access_token")?.value;
    
    // Check if access token is present
    if (!accessToken) {
      return NextResponse.json({ error: "Access token is missing" }, { status: 401 });
    }

    // Extract page and limit from query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    // Calculate the offset for pagination
    const perPage = limit;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = (page - 1) * limit;

    const response = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Check if the response is okay
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Parse the response data
    const repositories = await response.json();
    // Return the repositories along with pagination info
    return NextResponse.json({
      repos: repositories,
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
