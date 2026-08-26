import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, CountUp, Sparkline, CircularProgress, Button } from "@/components/ui-bits";
import { stats, commitActivity, heatmap, repos, blockers } from "@/lib/mock-data";
import * as Icons from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import type { GitHubUserProfile } from "@/lib/github-oauth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard · GitInsight AI" }, { name: "description", content: "Project health, commits, PRs, and AI blockers across your repositories." }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [userName, setUserName] = useState("Durga");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("github_user");
      if (cached) {
        try {
          const user: GitHubUserProfile = JSON.parse(cached);
          if (user.name || user.login) {
            setUserName(user.name || user.login);
          }
        } catch {}
      }
    }
  }, []);

  return (
    <AppShell>
      <PageHeader
        title={`Good Morning, ${userName} 👋`}
        subtitle="Here's what's happening across your projects today."
        actions={
          <>
            <Button variant="secondary">Sync now</Button>
            <Button>+ Add repository</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health */}
        <Card className="p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-2">Project Health Score</div>
          <CircularProgress value={92} label="Healthy Project" sublabel="Across 12 repositories" />
          <div className="mt-4 flex gap-2">
            <Badge tone="success">↑ 4% WoW</Badge>
            <Badge tone="brand">AI verified</Badge>
          </div>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = (Icons as any)[s.icon] ?? Icons.Activity;
            const up = s.trend >= 0;
            return (
              <Card key={s.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-xl bg-brand/10 grid place-items-center text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge tone={up ? "success" : "danger"}>
                    {up ? "↑" : "↓"} {Math.abs(s.trend)}%
                  </Badge>
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight">
                  <CountUp value={s.value} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                <div className="mt-2 -mx-1">
                  <Sparkline data={s.spark as unknown as number[]} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Project Progress</div>
              <div className="text-xs text-muted-foreground">Completion by module</div>
            </div>
            <Badge tone="brand">Live</Badge>
          </div>
          <div className="space-y-4">
            {repos.map((r, i) => {
              const colors = ["var(--color-brand)", "var(--color-brand-2)", "var(--color-accent-cyan)", "var(--color-warning)", "var(--color-success)", "var(--color-danger)"];
              return (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground">{r.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${r.progress}%`, background: `linear-gradient(90deg, ${colors[i % colors.length]}, color-mix(in oklab, ${colors[i % colors.length]} 60%, white))` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-1">AI Blockers</div>
          <div className="text-xs text-muted-foreground mb-4">Detected today</div>
          <div className="space-y-3">
            {blockers.map((b) => (
              <div key={b.title} className="rounded-xl border border-border p-3 hover:bg-accent/50 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium leading-snug">{b.title}</div>
                  <Badge tone={b.priority === "Critical" ? "danger" : b.priority === "High" ? "warning" : "brand"}>{b.priority}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{b.impact}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Commit Activity</div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand" />Commits</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-2" />PRs</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={commitActivity} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-2)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-brand-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="commits" stroke="var(--color-brand)" strokeWidth={2.2} fill="url(#g1)" />
                <Area type="monotone" dataKey="prs" stroke="var(--color-brand-2)" strokeWidth={2.2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-1">Contribution Heatmap</div>
          <div className="text-xs text-muted-foreground mb-4">Last 26 weeks</div>
          <div className="flex gap-1">
            {heatmap[0].map((_, col) => (
              <div key={col} className="flex flex-col gap-1">
                {heatmap.map((row, rowIdx) => {
                  const v = row[col];
                  const bg = ["bg-muted", "bg-brand/25", "bg-brand/45", "bg-brand/70", "bg-brand"][v];
                  return <div key={rowIdx} className={`h-3 w-3 rounded-sm ${bg}`} />;
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-brand/25" />
              <div className="h-3 w-3 rounded-sm bg-brand/45" />
              <div className="h-3 w-3 rounded-sm bg-brand/70" />
              <div className="h-3 w-3 rounded-sm bg-brand" />
            </div>
            <span>More</span>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="mt-6 p-0 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold">Repositories</div>
            <div className="text-xs text-muted-foreground">All monitored projects</div>
          </div>
          <Link to="/repositories" className="text-sm text-brand font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {["Repository", "Branch", "Commits", "PRs", "Issues", "Updated", "Status", ""].map((h) => (
                  <th key={h} className="text-left font-medium px-6 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repos.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/40 transition">
                  <td className="px-6 py-3 font-medium">{r.owner}/{r.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{r.branch}</td>
                  <td className="px-6 py-3">{r.commits}</td>
                  <td className="px-6 py-3">{r.prs}</td>
                  <td className="px-6 py-3">{r.issues}</td>
                  <td className="px-6 py-3 text-muted-foreground">{r.updated}</td>
                  <td className="px-6 py-3">
                    <Badge tone={r.status === "Healthy" ? "success" : r.status === "Delayed" ? "warning" : "danger"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Link to="/repositories/$id" params={{ id: r.id }} className="text-brand font-medium hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
