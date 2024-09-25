import axios from "axios";
import { Repository } from "@/types";

export async function getGithubRepos(page: number, limit: number) {
  try {
    // Make the API request using Axios
    const response = await axios.get(`/api/github/repositories`, {
      params: { page, limit },
    });

    // Extract the repositories from the response data
    const repos = response.data.repos;

    // Return only the required fields
    return repos.map((repo: Repository) => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
    }));
  } catch (error) {
    // Handle error: axios automatically captures network or server issues
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || "Failed to fetch repositories";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}
