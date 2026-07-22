import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload, Download } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documents } from "@/lib/mock-data";

export const Route = createFileRoute("/site/documents")({
  head: () => ({ meta: [{ title: "Documents · Naushik Site" }] }),
  component: SiteDocuments,
});

function SiteDocuments() {
  return (
    <AppShell title="Site Documents">
      <PageHeader
        title="Drawings, BOQs, contracts & approvals"
        description="All controlled site documents in one place."
        actions={<Button size="sm"><Upload className="mr-1.5 h-3.5 w-3.5" />Upload</Button>}
      />

      <Card>
        <div className="border-b border-border p-4">
          <Tabs defaultValue="all" className="min-w-0 max-w-full">
            <TabsList className="flex w-full max-w-full overflow-x-auto sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="drawing">Drawings</TabsTrigger>
              <TabsTrigger value="boq">BOQs</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="inspection">Inspections</TabsTrigger>
              <TabsTrigger value="approval">Approvals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {documents.map((d) => (
              <li key={d.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{d.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{d.type} · {d.project} · {d.size} · {d.uploaded}</div>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Download"><Download className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}