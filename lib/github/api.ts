export async function getGithubRepos(page: number, limit: number) {
  const response = await fetch(
    `/api/github/repositories?page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  );

  // Check if the response is okay
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch repositories");
  }

  // Parse the response data
  const { repos } = await response.json();

  // Return only the required fields
  return repos.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    avatar_url: repo.owner.avatar_url,
    html_url: repo.html_url,
  }));
}
