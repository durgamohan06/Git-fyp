import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button, CircularProgress } from "@/components/ui-bits";
import { repos, contributors, blockers, commitActivity } from "@/lib/mock-data";
import { Star, GitFork, GitBranch, Sparkles, ArrowLeft } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/repositories/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · GitInsight AI` }] }),
  component: RepoDetail,
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-20 text-muted-foreground">Repository not found.</div>
    </AppShell>
  ),
});

const TABS = ["Overview", "Commits", "Issues", "Pull Requests", "Reviews", "Contributors", "Analytics", "AI Summary"] as const;

function RepoDetail() {
  const { id } = Route.useParams();
  const r = repos.find((x) => x.id === id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  if (!r) throw notFound();

  return (
    <AppShell>
      <div className="mb-3">
        <Link to="/repositories" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Repositories
        </Link>
      </div>
      <PageHeader
        title={`${r.owner}/${r.name}`}
        subtitle={r.language + " · " + r.branch}
        actions={
          <>
            <Button variant="secondary"><Star className="h-4 w-4" /> Star {r.stars}</Button>
            <Button variant="secondary"><GitFork className="h-4 w-4" /> Fork {r.forks}</Button>
            <Button>View on GitHub</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="p-6 lg:col-span-1 flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-1">Health Score</div>
          <CircularProgress value={r.health} size={150} stroke={12} label={r.status} />
        </Card>
        <Card className="p-6 lg:col-span-3">
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  tab === t ? "bg-brand-gradient text-white shadow-md shadow-brand/25" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "AI Summary" ? <AISummary /> :
             tab === "Contributors" ? <Contribs /> :
             tab === "Analytics" ? <AnalyticsView /> :
             <GenericTab title={tab} repo={r.name} />}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="font-semibold mb-1">Blockers</div>
          <div className="text-xs text-muted-foreground mb-4">AI-detected risks for this repo</div>
          <div className="space-y-3">
            {blockers.map((b) => (
              <div key={b.title} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{b.title}</div>
                  <Badge tone={b.priority === "Critical" ? "danger" : b.priority === "High" ? "warning" : "brand"}>{b.priority}</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Impact: {b.impact}</div>
                <div className="mt-2 text-xs"><span className="font-medium">Suggested fix:</span> {b.fix}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Commit trend</div>
            <Badge tone="brand">30d</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={commitActivity}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="commits" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function AISummary() {
  const sections = [
    { title: "Daily Summary", tone: "brand" as const, text: "12 commits merged; PR #482 introduces passkey login. QA passed on 3 modules." },
    { title: "Weekly Summary", tone: "cyan" as const, text: "Sprint velocity up 14%. Auth module reached 82% completion." },
    { title: "Risks", tone: "danger" as const, text: "Frontend deploy failing on `dashboard-ui`. Migration `20240712` delayed by 2 days." },
    { title: "Completed Tasks", tone: "success" as const, text: "Passkey signup flow · OAuth token rotation · Rate-limit middleware." },
    { title: "Pending Tasks", tone: "warning" as const, text: "Session revocation UI · Audit log export · Password reset email templates." },
    { title: "Next Recommended Action", tone: "brand" as const, text: "Reassign PR #482 review to @priya-patel; target merge by EOD Thursday." },
  ];
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-brand/5 to-brand-2/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-brand-gradient grid place-items-center text-white"><Sparkles className="h-4 w-4" /></div>
        <div>
          <div className="font-semibold">GitInsight AI Summary</div>
          <div className="text-xs text-muted-foreground">Generated 2 minutes ago</div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-xl bg-card border border-border p-4">
            <Badge tone={s.tone}>{s.title}</Badge>
            <p className="mt-2 text-sm leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contribs() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contributors.map((c) => (
        <div key={c.name} className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-gradient text-white grid place-items-center font-semibold text-sm">{c.avatar}</div>
            <div className="min-w-0">
              <div className="font-medium truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground">Score {c.score} · {c.rating}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.commits}</div><div className="text-[10px] text-muted-foreground">Commits</div></div>
            <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.closed}</div><div className="text-[10px] text-muted-foreground">Closed</div></div>
            <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.reviews}</div><div className="text-[10px] text-muted-foreground">Reviews</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsView() {
  const data = commitActivity.slice(0, 12);
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
          <Line dataKey="commits" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
          <Line dataKey="prs" stroke="var(--color-brand-2)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GenericTab({ title, repo }: { title: string; repo: string }) {
  const rows = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `${title.replace(/s$/, "")} #${480 + i}: refine ${repo} flow`,
    author: contributors[i % contributors.length].name,
    time: `${i + 1}h ago`,
    status: ["Open", "Merged", "Review", "Draft"][i % 4],
  }));
  return (
    <div className="divide-y divide-border">
      {rows.map((r) => (
        <div key={r.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{r.title}</div>
            <div className="text-xs text-muted-foreground">by {r.author} · {r.time}</div>
          </div>
          <Badge tone={r.status === "Merged" ? "success" : r.status === "Draft" ? "default" : "brand"}>{r.status}</Badge>
        </div>
      ))}
    </div>
  );
}
