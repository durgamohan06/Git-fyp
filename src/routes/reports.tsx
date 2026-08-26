import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui-bits";
import { FileText, Download, Share2, Calendar } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · GitInsight AI" }] }),
  component: Reports,
});

const reports = [
  { title: "Daily Report", desc: "Yesterday's activity across all repositories.", tone: "brand" as const, date: "Jul 15, 2026" },
  { title: "Weekly Report", desc: "7-day progress, velocity, and completed epics.", tone: "cyan" as const, date: "Week 28" },
  { title: "Sprint Report", desc: "Sprint 24 · burndown, carry-over, retro highlights.", tone: "warning" as const, date: "Sprint 24" },
  { title: "Monthly Report", desc: "June performance, contributors, and risk trends.", tone: "success" as const, date: "June 2026" },
];

function Reports() {
  return (
    <AppShell>
      <PageHeader
        title="Reports"
        subtitle="Generate, share, and export intelligence reports."
        actions={<Button>Generate Report</Button>}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((r) => (
          <Card key={r.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><FileText className="h-5 w-5" /></div>
              <Badge tone={r.tone}>Ready</Badge>
            </div>
            <div className="mt-4 font-semibold">{r.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {r.date}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" className="h-9 px-3"><Download className="h-4 w-4" /> PDF</Button>
              <Button variant="secondary" className="h-9 px-3"><Download className="h-4 w-4" /> CSV</Button>
              <Button variant="ghost" className="h-9 px-3"><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <div className="font-semibold mb-4">Recent exports</div>
        <div className="divide-y divide-border">
          {["Weekly-Report-W28.pdf", "Sprint-24-Retro.pdf", "Monthly-June-2026.csv", "Daily-2026-07-14.pdf"].map((f, i) => (
            <div key={f} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <div className="text-sm font-medium">{f}</div>
                  <div className="text-xs text-muted-foreground">Exported {i + 1}d ago · 2.{i}MB</div>
                </div>
              </div>
              <Button variant="ghost" className="h-9 px-3"><Download className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
