import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui-bits";
import { Github, Sparkles, Sun, Mic, Bell, Globe, Download, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · GitInsight AI" }] }),
  component: SettingsPage,
});

const sections = [
  { icon: Github, title: "GitHub Connection", desc: "Manage OAuth, installed repositories, and webhooks.", status: "Connected" },
  { icon: Sparkles, title: "AI Model", desc: "Choose the AI model powering summaries and insights.", status: "GPT-4o" },
  { icon: Sun, title: "Theme", desc: "Light, dark, or system preference.", status: "System" },
  { icon: Mic, title: "Voice Settings", desc: "Wake word, voice, and playback preferences.", status: "Enabled" },
  { icon: Bell, title: "Notifications", desc: "Email, push, Slack alerts.", status: "Email + Slack" },
  { icon: Globe, title: "Language", desc: "Interface and AI response language.", status: "English (US)" },
  { icon: Download, title: "Export Settings", desc: "Auto-export weekly reports to storage.", status: "Off" },
  { icon: User, title: "Profile", desc: "Name, avatar, timezone, and role.", status: "Durga · PM" },
];

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Configure GitInsight AI to fit your workflow." />

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center shrink-0"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{s.title}</div>
                    <Badge tone="brand">{s.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" className="h-9 px-3">Configure</Button>
                    <Button variant="ghost" className="h-9 px-3">Learn more</Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
