import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FolderKanban, Building2, AlertOctagon, Users, ShoppingCart, Wallet, TrendingUp, ChevronRight, Plus, UserPlus,
  CalendarDays, CloudLightning, ShieldCheck, Gift, Check, Clock, MoreVertical, Edit, Trash
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { getProjects } from "@/server/projects";
import { getNotes, createNote, updateNote, deleteNote } from "@/server/notes";
import { getMetrics } from "@/server/metrics";
import { getAuditLogs } from "@/server/audit";
import { getMaterialRequests, createMaterialRequest } from "@/server/procurement";
import { getMeetings, updateMeetingStatus } from "@/server/meetings";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Naushik" }] }),
  loader: async () => {
    const [projects, notes, metrics, auditLogs, materialRequests, meetings] = await Promise.all([
      getProjects(),
      getNotes(),
      getMetrics(),
      getAuditLogs(),
      getMaterialRequests(),
      getMeetings(),
    ]);
    return { projects, notes, metrics, auditLogs, materialRequests, meetings };
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const { user } = useRole();
  const projects = Array.isArray(loaderData.projects) ? loaderData.projects : [];
  const notes = Array.isArray(loaderData.notes) ? loaderData.notes : [];
  const auditLogs = Array.isArray(loaderData.auditLogs) ? loaderData.auditLogs : [];
  const materialRequests = Array.isArray(loaderData.materialRequests) ? loaderData.materialRequests : [];
  const meetings = Array.isArray(loaderData.meetings) ? loaderData.meetings : [];
  const nextMeeting = meetings.find((m: any) => m.status === "pending");
  const active = projects.filter((p: any) => p.status === "active").length;
  const delayed = projects.filter((p: any) => p.status === "delayed").length;
  const pending = materialRequests.filter((m: any) => m.status === "pending").length;
  const totalBudget = projects.reduce((acc: number, p: any) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc: number, p: any) => acc + (p.spent || 0), 0);
  const budgetUtilized = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc: number, p: any) => acc + (p.progress || 0), 0) / projects.length) : 0;
  const firstName = user.name;

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [localLogs, setLocalLogs] = useState(auditLogs);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [requestItemName, setRequestItemName] = useState("");
  const [requestQty, setRequestQty] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!requestItemName || !requestQty) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await createMaterialRequest({ data: { item: requestItemName, qty: Number(requestQty) } });
      toast.success("Request submitted!");
      setIsAddRequestOpen(false);
      setRequestItemName("");
      setRequestQty("");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleMeetingStatus = async (status: string, toastMessage: string) => {
    if (!nextMeeting) return;
    setIsUpdatingMeeting(true);
    try {
      await updateMeetingStatus({ data: { id: nextMeeting.id, status } });
      toast.success(toastMessage);
      if (status === "rescheduled") setIsRescheduleOpen(false);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to update meeting");
    } finally {
      setIsUpdatingMeeting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      if (editingNoteId) {
        await updateNote({ data: { id: editingNoteId, content: noteContent } });
        toast.success("Note updated successfully");
      } else {
        await createNote({ data: { content: noteContent, author: user.name } });
        toast.success("Note created successfully");
      }
      setNoteOpen(false);
      setNoteContent("");
      setEditingNoteId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote({ data: id });
      toast.success("Note deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete note");
    }
  };

  const openEditNote = (id: number, currentContent: string) => {
    setEditingNoteId(id);
    setNoteContent(currentContent);
    setNoteOpen(true);
  };

  const openNewNote = () => {
    setEditingNoteId(null);
    setNoteContent("");
    setNoteOpen(true);
  };

  return (
    <AppShell title="Portfolio Dashboard">
      {/* Top Section */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-8 mb-10 items-start">
        <div className="max-w-xl">
          <div className="mb-6 flex flex-col gap-1.5">
            <span className="text-xl font-medium text-muted-foreground flex items-center gap-2">
              Hi, {firstName}! <span>👨🏻‍💻</span>
            </span>
            <h1 className="text-4xl font-bold tracking-tight">
              What are your plans for today?
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4 shrink-0 overflow-x-auto pb-4">
          <Dialog open={noteOpen} onOpenChange={(open) => {
            setNoteOpen(open);
            if (!open) {
              setEditingNoteId(null);
              setNoteContent("");
            }
          }}>
            <DialogTrigger asChild>
              <Card onClick={openNewNote} className="flex flex-col items-center justify-center w-36 h-40 shrink-0 bg-sidebar/5 hover:bg-sidebar/10 border-2 border-dashed border-sidebar/20 cursor-pointer shadow-none transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-2 shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground mt-2">New Note</span>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingNoteId ? "Edit Note" : "Create New Note"}</DialogTitle>
                <DialogDescription>Jot down a quick thought or reminder. It will be saved to your dashboard.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="content">Note Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Type your note here..."
                    className="col-span-3 min-h-[120px]"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={submittingNote} onClick={handleSaveNote}>
                  {submittingNote ? "Saving..." : "Save Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {notes.slice(0, 5).map((note: any) => (
            <Card key={note.id} className="relative group flex flex-col justify-between w-48 h-40 shrink-0 p-4 shadow-sm border border-border/50 bg-background/50 backdrop-blur-xl hover:shadow-md transition-shadow">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditNote(note.id, note.content)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-xs font-medium text-foreground line-clamp-5 leading-relaxed break-words">
                {note.content}
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-4 border-t border-border/50 pt-2 shrink-0">
                <span className="truncate pr-2">{note.author}</span>
                <span className="shrink-0">{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
         {/* Notifications / Activity */}
         <Card className="xl:col-span-1 flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
               <div className="flex items-center justify-between">
                 <CardTitle>Recent Activity</CardTitle>
                 <Button onClick={() => setLocalLogs([])} variant="ghost" size="sm" className="text-xs h-7">Clear</Button>
               </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
               <div className="space-y-4">
                 {localLogs.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">No recent activity.</div>
                 ) : (
                    localLogs.slice(0, 3).map((a, i) => (
                      <div key={a.id} className={cn("p-3 rounded-2xl", i === 0 ? "bg-background shadow-glass" : "hover:bg-accent/50")}>
                        <div className="flex justify-between items-start mb-1">
                           <div className="font-semibold text-sm">{a.user}</div>
                           <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {a.date ? new Date(a.date).toLocaleDateString() : ""}
                           </div>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                           {a.action} <span className="font-medium text-foreground">{a.entity}</span>
                        </div>
                      </div>
                    ))
                 )}
               </div>
            </CardContent>
         </Card>

         {/* Assignments / Requests */}
         <Card className="xl:col-span-1 flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
               <div className="flex items-center justify-between">
                 <CardTitle>Material Requests</CardTitle>
                 <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                   <Link to="/admin/procurement">Edit</Link>
                 </Button>
               </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col">
               <div className="space-y-4 flex-1">
                  {materialRequests.filter(m => m.status === "pending").slice(0, 2).map((m) => (
                    <div key={m.id}>
                       <div className="flex gap-2 mb-2">
                          <StatusBadge value={m.priority} />
                          <StatusBadge value="pending" />
                       </div>
                       <h4 className="font-bold text-sm mb-2">{m.item} ({m.qty}{m.unit ? ` ${m.unit}` : ''})</h4>
                       <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{m.project}</span>
                          <span>{m.requestedBy}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <Dialog open={isAddRequestOpen} onOpenChange={setIsAddRequestOpen}>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="w-full mt-4 rounded-xl border-dashed bg-accent/50 text-foreground">
                     <Plus className="mr-2 h-4 w-4" /> Add new request
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[425px]">
                   <DialogHeader>
                     <DialogTitle>Material Request</DialogTitle>
                     <DialogDescription>Submit a new material request.</DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                       <Label>Item Name</Label>
                       <Input placeholder="e.g. Cement bags" value={requestItemName} onChange={(e) => setRequestItemName(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <Label>Quantity</Label>
                       <Input type="number" placeholder="0" value={requestQty} onChange={(e) => setRequestQty(e.target.value)} />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button disabled={isSubmittingRequest} onClick={handleSubmitRequest}>{isSubmittingRequest ? "Submitting..." : "Submit Request"}</Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
            </CardContent>
         </Card>

         {/* Calendar / Schedule */}
         <Card className="xl:col-span-2 flex flex-col">
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                 <CardTitle>Top Projects Progress</CardTitle>
                 <Link to="/admin/projects" className="text-xs font-medium text-brand hover:underline px-3 py-1">View all</Link>
               </div>
            </CardHeader>
            <CardContent className="pt-2">
               <div className="space-y-5">
                  {projects.slice(0, 3).map((p) => (
                    <div key={p.id} className="group flex items-center justify-between py-2">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                             <h4 className="font-bold text-sm">{p.name}</h4>
                             <p className="text-xs text-muted-foreground">{p.manager} · {p.location}</p>
                          </div>
                       </div>
                       
                       <div className="flex-1 h-[1px] bg-border/40 group-hover:bg-border transition-colors mx-4"></div>
                       
                       <div className="flex flex-col items-end shrink-0">
                          <div className="font-bold text-sm">{p.progress}%</div>
                          <div className="text-[10px] text-muted-foreground">{p.status}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
         {/* Today Tasks */}
         <Card className="xl:col-span-2 flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
               <CardTitle>Portfolio KPIs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
               <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-semibold">Budget Utilised</span>
                       <span className="font-bold">{budgetUtilized}%</span>
                    </div>
                    <Progress value={budgetUtilized} className="h-2 bg-accent" />
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-semibold">Active Projects</span>
                       <span className="font-bold">{active} / {projects.length}</span>
                    </div>
                    <Progress value={(active / projects.length) * 100} className="h-2 bg-accent [&>div]:bg-success" />
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-semibold">Delayed Projects</span>
                       <span className="font-bold">{delayed} / {projects.length}</span>
                    </div>
                    <Progress value={(delayed / projects.length) * 100} className="h-2 bg-accent [&>div]:bg-destructive" />
                 </div>
               </div>
            </CardContent>
         </Card>

         {/* Premium Banner */}
         <Card className="xl:col-span-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            
            <div className="mb-6 relative">
               <div className="h-20 w-20 bg-white/20 backdrop-blur-md text-white rounded-3xl rotate-12 flex items-center justify-center shadow-xl border border-white/20">
                  <Gift className="h-10 w-10 -rotate-12 drop-shadow-md" />
               </div>
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight drop-shadow-sm">Go Premium!</h3>
            <p className="text-sm text-white/90 mb-6 leading-relaxed font-medium">
              Gain access to a range of exclusive benefits designed to enhance your user experience.
            </p>
            <Dialog open={isPremiumOpen} onOpenChange={setIsPremiumOpen}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-full font-bold shadow-md bg-white text-purple-700 hover:bg-white/90 transition-all">
                  Find out more
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upgrade to Premium</DialogTitle>
                  <DialogDescription>Unlock advanced features and priority support.</DialogDescription>
                </DialogHeader>
                <div className="py-6 text-center space-y-4">
                  <Gift className="h-12 w-12 text-purple-500 mx-auto" />
                  <p className="text-sm font-medium">Coming soon!</p>
                </div>
              </DialogContent>
            </Dialog>
         </Card>

         {/* Circular Stats & Board Meeting */}
         <div className="xl:col-span-1 flex flex-col gap-6">
            <Card className="flex-1 flex items-center justify-around p-4">
               <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-2">
                     <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-accent" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * avgProgress) / 100} className="text-success" strokeLinecap="round" />
                     </svg>
                     <span className="absolute text-xs font-bold">{avgProgress}%</span>
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overall</div>
                  <div className="text-sm font-bold">Efficiency</div>
               </div>
               <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-2">
                     <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-accent" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * budgetUtilized) / 100} className="text-gold" strokeLinecap="round" />
                     </svg>
                     <span className="absolute text-xs font-bold">{budgetUtilized}%</span>
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Budget</div>
                  <div className="text-sm font-bold">Utilised</div>
               </div>
            </Card>

            {nextMeeting ? (
               <Card className="p-5 flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold">{nextMeeting.title}</h3>
                        <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
                           <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                 <DialogTitle>Meeting Details</DialogTitle>
                                 <DialogDescription>{new Date(nextMeeting.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</DialogDescription>
                              </DialogHeader>
                              <div className="py-4 text-sm space-y-2">
                                 <p><strong>Attendees:</strong> {nextMeeting.attendees || "Not specified"}</p>
                              </div>
                           </DialogContent>
                        </Dialog>
                     </div>
                     <div className="text-xs text-primary font-medium flex items-center gap-1 mb-3">
                        <span className="h-2 w-2 rounded-full bg-primary"></span> {new Date(nextMeeting.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                     </div>
                     <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {nextMeeting.attendees ? `Meeting with ${nextMeeting.attendees}` : "No attendees specified"}
                     </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                     <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-8">Reschedule</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                           <DialogHeader>
                              <DialogTitle>Reschedule Meeting</DialogTitle>
                              <DialogDescription>Propose a new time for {nextMeeting.title}.</DialogDescription>
                           </DialogHeader>
                           <div className="py-4 space-y-2">
                              <Label>New Date & Time</Label>
                              <Input type="datetime-local" />
                           </div>
                           <DialogFooter>
                              <Button disabled={isUpdatingMeeting} onClick={() => handleMeetingStatus("rescheduled", "Reschedule request sent")}>{isUpdatingMeeting ? "Sending..." : "Send Request"}</Button>
                           </DialogFooter>
                        </DialogContent>
                     </Dialog>
                     <Button disabled={isUpdatingMeeting} onClick={() => handleMeetingStatus("accepted", "Invite accepted")} size="sm" className="flex-1 rounded-xl text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glass">Accept invite</Button>
                  </div>
               </Card>
            ) : (
               <Card className="p-5 flex flex-col justify-center items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                     <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-sm">No upcoming meetings</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">You have a clear schedule for now.</p>
               </Card>
            )}
         </div>
      </div>
    </AppShell>
  );
}