import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui-bits";
import { repos } from "@/lib/mock-data";
import { GitBranch, Star, GitFork, Search } from "lucide-react";

export const Route = createFileRoute("/repositories")({
  head: () => ({ meta: [{ title: "Repositories · GitInsight AI" }, { name: "description", content: "All connected GitHub repositories with health, commits, and status." }] }),
  component: Repositories,
});

function Repositories() {
  return (
    <AppShell>
      <PageHeader
        title="Repositories"
        subtitle="All GitHub repositories connected to GitInsight AI."
        actions={<Button>+ Connect repository</Button>}
      />

      <Card className="p-4 mb-6" lift={false}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder="Filter repositories…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-background border border-border text-sm">
            <option>All languages</option><option>TypeScript</option><option>Python</option><option>Go</option>
          </select>
          <select className="h-10 px-3 rounded-lg bg-background border border-border text-sm">
            <option>All statuses</option><option>Healthy</option><option>Delayed</option><option>Blocked</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {repos.map((r) => (
          <Link key={r.id} to="/repositories/$id" params={{ id: r.id }} className="block">
            <Card className="p-5 h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{r.owner}</div>
                  <div className="font-semibold truncate">{r.name}</div>
                </div>
                <Badge tone={r.status === "Healthy" ? "success" : r.status === "Delayed" ? "warning" : "danger"}>{r.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand" />{r.language}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{r.stars}</span>
                <span className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{r.forks}</span>
                <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{r.branch}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1"><span>Health</span><span className="text-muted-foreground">{r.health}%</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-brand-gradient" style={{ width: `${r.health}%` }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{r.commits}</div><div className="text-[10px] text-muted-foreground">Commits</div></div>
                <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{r.prs}</div><div className="text-[10px] text-muted-foreground">PRs</div></div>
                <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{r.issues}</div><div className="text-[10px] text-muted-foreground">Issues</div></div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
