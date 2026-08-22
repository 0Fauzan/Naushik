import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload, Download } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { getDocuments, createDocument, deleteDocument } from "@/server/documents";

export const Route = createFileRoute("/site/documents")({
  head: () => ({ meta: [{ title: "Documents · Naushik Site" }] }),
  loader: () => getDocuments(),
  component: SiteDocuments,
});

function SiteDocuments() {
  const router = useRouter();
  const dbDocuments = Route.useLoaderData();
  const documents = Array.isArray(dbDocuments) ? dbDocuments : [];

  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("drawing");

  const filteredDocs = filter === "all" 
    ? documents 
    : documents.filter((d) => d.type?.toLowerCase() === filter.toLowerCase());

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    setUploading(true);
    try {
      await createDocument({
        data: {
          name: file.name,
          type: docType,
          project: "Central",
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedBy: "Site Engineer",
        }
      });
      toast.success("Document uploaded successfully");
      setOpen(false);
      setFile(null);
      router.invalidate();
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell title="Site Documents">
      <PageHeader
        title="Drawings, BOQs, contracts & approvals"
        description="All controlled site documents in one place."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Upload className="mr-1.5 h-3.5 w-3.5" />Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>File</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drawing">Drawing</SelectItem>
                      <SelectItem value="boq">BOQ</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button disabled={uploading} onClick={handleUpload}>{uploading ? "Uploading..." : "Upload File"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <div className="border-b border-border p-4">
          <Tabs value={filter} onValueChange={setFilter} className="min-w-0 max-w-full">
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
          {filteredDocs.length > 0 ? (
            <ul className="divide-y divide-border">
              {filteredDocs.map((d) => (
                <li key={d.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{d.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.type} · {d.project} · {d.size} · {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : ""}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => toast(`Downloading ${d.name}...`)} variant="outline" size="icon" className="h-8 w-8" aria-label="Download"><Download className="h-3.5 w-3.5" /></Button>
                    <Button onClick={async () => {
                      await deleteDocument({ data: d.id });
                      toast.success("Document deleted");
                      router.invalidate();
                    }} variant="outline" size="icon" className="h-8 w-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No documents found in this category.
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}