import { getEnv } from "./env";

export interface SimplifiedRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  default_branch: string;
  open_issues_count: number;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubErrorResponse {
  error: string;
  message: string;
  status?: number;
}

/**
 * Extracts GitHub token from Authorization header, custom header, or environment variables.
 */
export function extractGitHubToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)github_token=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    if (authHeader.startsWith("token ") || authHeader.startsWith("Token ")) {
      return authHeader.slice(6).trim();
    }
    return authHeader.trim();
  }

  const customHeader = request.headers.get("x-github-token");
  if (customHeader) {
    return customHeader.trim();
  }

  // Fallback to environment variable
  return getEnv("GITHUB_ACCESS_TOKEN") || getEnv("GITHUB_TOKEN") || null;
}

/**
 * Fetches repositories for the authenticated user from the GitHub REST API.
 */
export async function fetchGitHubUserRepos(token: string): Promise<SimplifiedRepo[]> {
  const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=all", {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "GitInsight-AI",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorBody.message || `GitHub API error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const rawRepos = (await response.json()) as any[];

  return rawRepos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description ?? null,
    language: repo.language ?? "Unknown",
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    updated_at: repo.updated_at,
    html_url: repo.html_url,
    default_branch: repo.default_branch || "main",
    open_issues_count: repo.open_issues_count ?? 0,
    private: Boolean(repo.private),
    owner: {
      login: repo.owner?.login || "unknown",
      avatar_url: repo.owner?.avatar_url || "",
    },
  }));
}

/**
 * Handler for GET /api/repos
 */
export async function handleGetRepos(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed", message: "Only GET is supported on /api/repos" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = extractGitHubToken(request);

  if (!token) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message:
          "GitHub access token is required. Pass it via 'Authorization: Bearer <token>' header or define GITHUB_ACCESS_TOKEN in your .env file.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const repos = await fetchGitHubUserRepos(token);
    return new Response(JSON.stringify({ data: repos, count: repos.length }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    const status = err.status || 500;
    return new Response(
      JSON.stringify({
        error: "GitHub API Error",
        message: err.message || "Failed to fetch repositories from GitHub",
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Node / Connect middleware adapter for Vite dev server
 */
export async function nodeApiReposHandler(req: any, res: any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const cookieHeader = req.headers["cookie"] || "";
  let cookieToken: string | null = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)github_token=([^;]*)/);
    if (match && match[1]) cookieToken = decodeURIComponent(match[1]);
  }

  const authHeader = req.headers["authorization"] || req.headers["x-github-token"];
  let token = cookieToken || getEnv("GITHUB_ACCESS_TOKEN") || getEnv("GITHUB_TOKEN") || null;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (authHeader.startsWith("token ") || authHeader.startsWith("Token ")) {
      token = authHeader.slice(6).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Unauthorized",
        message:
          "GitHub access token is required. Pass it via 'Authorization: Bearer <token>' header or define GITHUB_ACCESS_TOKEN in your .env file.",
      })
    );
    return;
  }

  try {
    const repos = await fetchGitHubUserRepos(token);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ data: repos, count: repos.length }));
  } catch (err: any) {
    res.statusCode = err.status || 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "GitHub API Error",
        message: err.message || "Failed to fetch repositories from GitHub",
      })
    );
  }
}

