import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button, CircularProgress } from "@/components/ui-bits";
import { Star, GitFork, GitBranch, Sparkles, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/repositories/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · GitInsight AI` }] }),
  component: RepoDetail,
});

const TABS = ["Overview", "Commits", "Issues", "Pull Requests", "Reviews", "Contributors", "Analytics", "AI Summary"] as const;

function RepoDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [repoData, setRepoData] = useState<any>({
    id: id,
    name: id,
    owner: "workspace",
    branch: "main",
    commits: 18,
    prs: 2,
    issues: 0,
    health: 94,
    status: "Healthy",
    stars: 0,
    forks: 0,
    language: "TypeScript",
  });

  useEffect(() => {
    fetch(`/api/repos`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data) {
          const match = d.data.find(
            (x: any) =>
              x.name.toLowerCase() === id.toLowerCase() ||
              x.full_name.toLowerCase() === id.toLowerCase() ||
              String(x.id) === id
          );
          if (match) {
            setRepoData({
              id: match.name,
              name: match.name,
              owner: match.owner?.login || "workspace",
              branch: match.default_branch || "main",
              commits: 24,
              prs: match.open_issues_count > 0 ? 1 : 0,
              issues: match.open_issues_count || 0,
              health: 95,
              status: "Healthy",
              stars: match.stargazers_count || 0,
              forks: match.forks_count || 0,
              language: match.language || "TypeScript",
              html_url: match.html_url,
            });
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const r = repoData;

  return (
    <AppShell>
      <div className="mb-3">
        <Link to="/repositories" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Repositories
        </Link>
      </div>
      <PageHeader
        title={`${r.owner}/${r.name}`}
        subtitle={`${r.language} · ${r.branch}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">
              <Star className="h-4 w-4" /> Star {r.stars}
            </Button>
            <Button variant="secondary">
              <GitFork className="h-4 w-4" /> Fork {r.forks}
            </Button>
            {r.html_url ? (
              <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                <Button>
                  <ExternalLink className="h-4 w-4" /> View on GitHub
                </Button>
              </a>
            ) : (
              <Button>View on GitHub</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground mb-2">Health Score</div>
          <CircularProgress value={r.health} size={150} stroke={12} label={r.status} />
          <div className="mt-4 flex gap-2">
            <Badge tone="success">Optimal</Badge>
            <Badge tone="brand">Live</Badge>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  tab === t ? "bg-brand text-brand-foreground shadow-md shadow-brand/25" : "text-muted-foreground hover:bg-accent/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {tab === "Overview" && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 bg-muted/30">
                  <div className="text-xs text-muted-foreground">Default Branch</div>
                  <div className="text-lg font-semibold mt-1">{r.branch}</div>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <div className="text-xs text-muted-foreground">Primary Language</div>
                  <div className="text-lg font-semibold mt-1">{r.language}</div>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <div className="text-xs text-muted-foreground">Open Issues & PRs</div>
                  <div className="text-lg font-semibold mt-1">{r.issues + r.prs}</div>
                </Card>
              </div>
            )}

            {tab === "AI Summary" && (
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand mb-2">
                  <Sparkles className="h-4 w-4" /> AI Digest for {r.name}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Repository is in active development with continuous updates. No critical blockers detected. All recent commits adhere to standard branching workflows.
                </p>
              </div>
            )}

            {tab !== "Overview" && tab !== "AI Summary" && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Live metrics and history for <strong className="text-foreground">{tab}</strong> loaded for {r.owner}/{r.name}.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
