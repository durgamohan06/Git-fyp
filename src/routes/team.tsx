import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-bits";
import { contributors } from "@/lib/mock-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team Analytics · GitInsight AI" }] }),
  component: Team,
});

const pieData = [
  { name: "Bugs", value: 34, color: "var(--color-danger)" },
  { name: "Features", value: 48, color: "var(--color-brand)" },
  { name: "Chores", value: 18, color: "var(--color-warning)" },
  { name: "Docs", value: 12, color: "var(--color-accent-cyan)" },
];
const radar = [
  { skill: "Delivery", A: 92, B: 78 },
  { skill: "Quality", A: 88, B: 84 },
  { skill: "Reviews", A: 84, B: 70 },
  { skill: "Velocity", A: 79, B: 88 },
  { skill: "Impact", A: 90, B: 72 },
];
const timeline = [
  { month: "Feb", planned: 40, actual: 36 },
  { month: "Mar", planned: 55, actual: 52 },
  { month: "Apr", planned: 60, actual: 64 },
  { month: "May", planned: 70, actual: 68 },
  { month: "Jun", planned: 80, actual: 82 },
  { month: "Jul", planned: 90, actual: 87 },
];

function Team() {
  return (
    <AppShell>
      <PageHeader title="Team Analytics" subtitle="Developer productivity, contributions, and performance." />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-6">
        {contributors.map((c) => (
          <Card key={c.name} className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-gradient text-white grid place-items-center font-semibold shrink-0">{c.avatar}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">Productivity {c.score}</div>
              </div>
              <Badge tone="brand">{c.rating}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.commits}</div><div className="text-[10px] text-muted-foreground">Commits</div></div>
              <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.closed}</div><div className="text-[10px] text-muted-foreground">Issues</div></div>
              <div className="rounded-lg bg-muted/60 py-2"><div className="text-sm font-semibold">{c.reviews}</div><div className="text-[10px] text-muted-foreground">Reviews</div></div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1"><span>AI Productivity</span><span className="text-muted-foreground">{c.score}%</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-brand-gradient" style={{ width: `${c.score}%` }} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="font-semibold mb-4">Contribution comparison</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={contributors}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="commits" fill="var(--color-brand)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="reviews" fill="var(--color-brand-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-4">Issue distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-4">Developer performance</div>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name="Durga" dataKey="A" stroke="var(--color-brand)" fill="var(--color-brand)" fillOpacity={0.4} />
                <Radar name="Team avg" dataKey="B" stroke="var(--color-brand-2)" fill="var(--color-brand-2)" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-4">Project timeline</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={timeline}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="planned" fill="var(--color-muted-foreground)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actual" fill="var(--color-brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
