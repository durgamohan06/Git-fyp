import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui-bits";
import { GitBranch, Star, GitFork, Search, Loader2, AlertCircle, RefreshCw, ExternalLink, Key } from "lucide-react";
import type { SimplifiedRepo } from "@/lib/github-api";

export const Route = createFileRoute("/repositories")({
  head: () => ({
    meta: [
      { title: "Repositories · GitInsight AI" },
      { name: "description", content: "All connected GitHub repositories with health, commits, and status." },
    ],
  }),
  component: Repositories,
});

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

function Repositories() {
  const [repos, setRepos] = useState<SimplifiedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [customToken, setCustomToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const fetchRepositories = async (tokenOverride?: string) => {
    setLoading(true);
    setError(null);

    try {
      const activeToken =
        tokenOverride !== undefined
          ? tokenOverride
          : typeof window !== "undefined"
            ? localStorage.getItem("github_token") || ""
            : "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/repos", { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP error ${res.status}`);
      }

      setRepos(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load repositories from GitHub API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("github_token") || "" : "";
    setCustomToken(savedToken);
    fetchRepositories(savedToken);
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (customToken.trim()) {
        localStorage.setItem("github_token", customToken.trim());
      } else {
        localStorage.removeItem("github_token");
      }
    }
    setShowTokenInput(false);
    fetchRepositories(customToken.trim());
  };

  // Extract unique languages for filter dropdown
  const languages: string[] = [
    "All",
    ...Array.from(new Set(repos.map((r) => r.language).filter((l): l is string => Boolean(l)))),
  ];

  // Filtered repositories based on search and language
  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = selectedLanguage === "All" || r.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <AppShell>
      <PageHeader
        title="Repositories"
        subtitle="All GitHub repositories connected to GitInsight AI via GitHub REST API."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowTokenInput((v) => !v)}>
              <Key className="h-4 w-4" /> {customToken ? "Update Token" : "Set Token"}
            </Button>
            <Button onClick={() => fetchRepositories()}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        }
      />

      {/* Optional Token Configuration Panel */}
      {showTokenInput && (
        <Card className="p-5 mb-6 border-brand/40 bg-brand/5" lift={false}>
          <form onSubmit={handleSaveToken} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">GitHub Personal Access Token</span>
              <span className="text-xs text-muted-foreground">Saved securely in browser session</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (or configure GITHUB_ACCESS_TOKEN in .env)"
                className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              <Button type="submit">Save & Connect</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can either enter a token here or set <code className="bg-muted px-1.5 py-0.5 rounded">GITHUB_ACCESS_TOKEN</code> in your server's <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file.
            </p>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6" lift={false}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter repositories by name or description…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === "All" ? "All languages" : lang}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 h-56 animate-pulse flex flex-col justify-between" lift={false}>
              <div>
                <div className="h-4 w-28 bg-muted rounded mb-2" />
                <div className="h-6 w-48 bg-muted rounded mb-3" />
                <div className="h-3 w-full bg-muted rounded mb-1.5" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="p-8 text-center border-danger/40 bg-danger/5 mb-6" lift={false}>
          <div className="h-12 w-12 rounded-2xl bg-danger/10 text-danger mx-auto grid place-items-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">GitHub Connection Error</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-5">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => setShowTokenInput(true)}>
              <Key className="h-4 w-4" /> Enter GitHub Token
            </Button>
            <Button variant="secondary" onClick={() => fetchRepositories()}>
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Success State */}
      {!loading && !error && filteredRepos.length === 0 && (
        <Card className="p-12 text-center" lift={false}>
          <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground mx-auto grid place-items-center mb-3">
            <GitBranch className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">No repositories found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm || selectedLanguage !== "All"
              ? "Try adjusting your search or language filters."
              : "No repositories were returned for this account."}
          </p>
        </Card>
      )}

      {!loading && !error && filteredRepos.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRepos.map((r) => (
            <Card key={r.id} className="p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground truncate">{r.owner?.login || "User"}</div>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold truncate text-foreground hover:text-brand transition inline-flex items-center gap-1 group"
                    >
                      <span className="truncate">{r.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </a>
                  </div>
                  <Badge tone={r.private ? "warning" : "success"}>{r.private ? "Private" : "Public"}</Badge>
                </div>

                <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                  {r.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      {r.language || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {r.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5" />
                      {r.forks_count}
                    </span>
                  </div>
                  <span className="text-[11px]">{formatRelativeTime(r.updated_at)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Branch: <code className="text-foreground font-medium">{r.default_branch}</code></span>
                  <Link
                    to="/repositories/$id"
                    params={{ id: r.name }}
                    className="text-xs text-brand font-medium hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
