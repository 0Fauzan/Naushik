import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Bell, Settings2, Smartphone, Save, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getMe, updateProfile } from "@/server/auth";
import { RoleProvider } from "@/lib/role-context";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Naushik Site" }] }),
  loader: () => getMe(),
  component: SettingsPage,
  errorComponent: ({ error }) => {
    console.error("Settings Error:", error);
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-2xl font-bold">Settings Error</h1>
        <pre className="mt-4">{error.message}</pre>
        <pre className="text-sm mt-2 opacity-50">{error.stack}</pre>
      </div>
    );
  }
});

function SettingsPage() {
  const { user } = Route.useLoaderData();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || "");
  const [whatsappNotifications, setWhatsappNotifications] = useState(user?.whatsappNotifications || false);
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({ data: { name, email, whatsappNumber, whatsappNotifications } });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleProvider initial={user?.role === "admin" ? "admin" : "site"} initialUser={user}>
      <AppShell title="Settings">
        <PageHeader 
        title="Settings & Preferences" 
        description="Manage your account settings and notification preferences." 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
            <CardDescription>Update your personal details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" disabled />
              <p className="text-[10px] text-muted-foreground">Email address cannot be changed currently.</p>
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={saveProfile} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & WhatsApp Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            <CardDescription>Configure WhatsApp and system alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">WhatsApp Alerts</Label>
                  <p className="text-[10px] text-muted-foreground">Receive critical project updates via WhatsApp.</p>
                </div>
                <Switch 
                  checked={whatsappNotifications}
                  onCheckedChange={setWhatsappNotifications}
                />
              </div>
              
              {whatsappNotifications && (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-green-600" /> WhatsApp Number</Label>
                  <Input 
                    type="tel" 
                    value={whatsappNumber} 
                    onChange={e => setWhatsappNumber(e.target.value)} 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button variant="secondary" onClick={saveProfile} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppShell>
    </RoleProvider>
  );
}
