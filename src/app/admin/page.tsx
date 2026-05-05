"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Leaf, MapPin, Clock, CheckCircle, XCircle, Truck, Users, BarChart3, RefreshCw, AlertTriangle, Recycle, Trash2, Eye, Mail, Phone, User, FileText, Brain, Image as ImageIcon, Navigation, Plus, Pencil, Trash } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Report { id: string; report_id: string; location_address?: string; waste_type?: string; status: string; priority: string; ai_confidence?: number; ai_results?: Record<string, number>; assigned_unit?: string; assigned_driver_id?: string; created_at: string; description?: string; lat?: number; lng?: number; image_path?: string; timeline?: { status: string; message: string; timestamp: string }[]; driver_updates?: { image_path?: string; lat?: number; lng?: number; note?: string; timestamp: string; driver_name?: string }[]; citizen_name?: string; citizen_email?: string; citizen_phone?: string; citizen_location?: string; }
interface Driver { id: string; name: string; vehicle_id?: string; phone?: string; active_tasks: number; email: string; }
interface Citizen { id: string; name: string; email: string; phone: string; location: string; points: number; report_count: number; }

const wasteColor: Record<string, string> = { organic: "bg-green-500", recyclable: "bg-blue-500", hazardous: "bg-orange-500", general: "bg-gray-500" };

function WasteIcon({ type, large }: { type?: string; large?: boolean }) {
  const icons: Record<string, React.ReactNode> = { organic: <Leaf className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />, recyclable: <Recycle className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />, hazardous: <AlertTriangle className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />, general: <Trash2 className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} /> };
  return <div className={`${large ? "w-12 h-12 rounded-xl" : "w-8 h-8 rounded-lg"} flex items-center justify-center ${wasteColor[type || "general"] || "bg-gray-500"}`}>{icons[type || "general"]}</div>;
}

function F({ label, id, value, onChange, type = "text", placeholder = "" }: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></div>;
}

function Spinner() { return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />; }

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Data
  const [reports, setReports] = useState<Report[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Report dialogs
  const [detailReport, setDetailReport] = useState<Report | null>(null);
  const [assignReport, setAssignReport] = useState<Report | null>(null);
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");

  // Citizen dialogs
  const [citizenForm, setCitizenForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [editCitizen, setEditCitizen] = useState<Citizen | null>(null);
  const [editCitizenForm, setEditCitizenForm] = useState({ name: "", phone: "", location: "" });
  const [showAddCitizen, setShowAddCitizen] = useState(false);

  // Driver dialogs
  const [driverForm, setDriverForm] = useState({ name: "", email: "", password: "", phone: "", vehicle_id: "" });
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [editDriverForm, setEditDriverForm] = useState({ name: "", phone: "", vehicle_id: "" });
  const [showAddDriver, setShowAddDriver] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, d, c] = await Promise.all([
        api.admin.reports(statusFilter === "All" ? undefined : statusFilter) as Promise<Report[]>,
        api.admin.drivers() as Promise<Driver[]>,
        api.admin.citizens() as Promise<Citizen[]>,
      ]);
      setReports(r); setDrivers(d); setCitizens(c);
    } catch (e: unknown) {
      // Token expired or invalid — clear session and redirect to admin login
      if (e instanceof Error && e.message.includes("validate credentials")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/admin-login");
        return;
      }
      console.error(e);
    }
    finally { setLoading(false); }
  }, [statusFilter, router]);

  useEffect(() => { if (!isLoading && (!user || user.role !== "admin")) router.push("/admin-login"); }, [user, isLoading, router]);
  useEffect(() => { if (user?.role === "admin") fetchData(); }, [fetchData, user]);

  const act = async (fn: () => Promise<unknown>, onDone?: () => void) => {
    setActionLoading(true);
    try { await fn(); fetchData(); onDone?.(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1><p className="text-muted-foreground">Full CRUD — Reports · Citizens · Drivers</p></div>
            <Button variant="outline" className="gap-2" onClick={fetchData} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Reports", value: reports.length, icon: BarChart3, color: "text-primary" },
              { label: "Pending", value: reports.filter(r => r.status === "Pending").length, icon: Clock, color: "text-orange-500" },
              { label: "Citizens", value: citizens.length, icon: Users, color: "text-green-500" },
              { label: "Drivers", value: drivers.length, icon: Truck, color: "text-blue-500" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card><CardContent className="p-4"><s.icon className={`w-6 h-6 ${s.color} mb-2`} /><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="reports">
            <TabsList className="mb-6">
              <TabsTrigger value="reports" className="gap-2"><FileText className="w-4 h-4" />Reports</TabsTrigger>
              <TabsTrigger value="citizens" className="gap-2"><Users className="w-4 h-4" />Citizens ({citizens.length})</TabsTrigger>
              <TabsTrigger value="drivers" className="gap-2"><Truck className="w-4 h-4" />Drivers ({drivers.length})</TabsTrigger>
            </TabsList>

            {/* ── REPORTS TAB ── */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Reports</CardTitle><CardDescription>View · Approve · Edit · Delete</CardDescription></div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{["All","Pending","Assigned","In Progress","Completed","Rejected"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {reports.length === 0
                    ? <div className="text-center py-12 text-muted-foreground">No reports found</div>
                    : <div className="space-y-3">{reports.map((r, i) => (
                        <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                          <WasteIcon type={r.waste_type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-sm font-semibold">{r.report_id}</span>
                              <Badge variant={r.priority === "high" ? "destructive" : "default"} className="text-xs">{r.priority}</Badge>
                              <Badge variant="outline" className="text-xs capitalize">{r.waste_type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location_address || "No location"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><User className="w-3 h-3" />{r.citizen_name || "—"} · {new Date(r.created_at).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={r.status === "Completed" ? "default" : r.status === "Rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
                            <Button size="sm" variant="outline" onClick={async () => { const d = await api.admin.reportDetail(r.report_id) as Report; setDetailReport(d); }}><Eye className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditReport(r); }}><Pencil className="w-3 h-3" /></Button>
                            {r.status === "Pending" && <Button size="sm" onClick={() => { setAssignReport(r); setSelectedDriver(""); }}><Truck className="w-3 h-3 mr-1" />Assign</Button>}
                            {r.status === "Assigned" && <Button size="sm" variant="outline" onClick={() => { setAssignReport(r); setSelectedDriver(""); }}><Truck className="w-3 h-3 mr-1" />Re-assign</Button>}
                            {r.status === "Pending" && <Button size="sm" variant="destructive" onClick={() => act(() => api.admin.reject(r.report_id))}><XCircle className="w-3 h-3" /></Button>}
                            <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this report?")) act(() => api.admin.deleteReport(r.report_id)); }}><Trash className="w-3 h-3" /></Button>
                          </div>
                        </motion.div>
                      ))}</div>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── CITIZENS TAB ── */}
            <TabsContent value="citizens">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Citizens</CardTitle><CardDescription>Create · Edit · Delete</CardDescription></div>
                    <Button className="gap-2" onClick={() => { setCitizenForm({ name:"",email:"",password:"",phone:"",location:"" }); setShowAddCitizen(true); }}><Plus className="w-4 h-4" />Add Citizen</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {citizens.length === 0
                    ? <div className="text-center py-12 text-muted-foreground">No citizens registered</div>
                    : <div className="space-y-3">{citizens.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                          className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">{c.name[0].toUpperCase()}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{c.name}</p>
                            <div className="flex flex-wrap gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                              {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                              {c.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-center"><p className="text-sm font-bold text-primary">{c.report_count}</p><p className="text-xs text-muted-foreground">Reports</p></div>
                            <div className="text-center"><p className="text-sm font-bold text-orange-500">{c.points}</p><p className="text-xs text-muted-foreground">Points</p></div>
                            <Button size="sm" variant="outline" onClick={() => { setEditCitizen(c); setEditCitizenForm({ name: c.name, phone: c.phone, location: c.location }); }}><Pencil className="w-3 h-3" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Remove "${c.name}"?`)) act(() => api.admin.deleteCitizen(c.id)); }}><Trash className="w-3 h-3" /></Button>
                          </div>
                        </motion.div>
                      ))}</div>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── DRIVERS TAB ── */}
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Drivers</CardTitle><CardDescription>Create · Edit · Delete</CardDescription></div>
                    <Button className="gap-2" onClick={() => { setDriverForm({ name:"",email:"",password:"",phone:"",vehicle_id:"" }); setShowAddDriver(true); }}><Plus className="w-4 h-4" />Add Driver</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {drivers.length === 0
                    ? <div className="text-center py-12 text-muted-foreground">No drivers registered</div>
                    : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{drivers.map((d, i) => (
                        <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                          <Card className="hover:shadow-md transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-600">{d.name[0]}</div>
                                <div><p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.vehicle_id || "No vehicle"}</p></div>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{d.email}</p>
                                {d.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{d.phone}</p>}
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Active tasks</span>
                                <Badge variant={d.active_tasks > 0 ? "default" : "secondary"}>{d.active_tasks}</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setEditDriver(d); setEditDriverForm({ name: d.name, phone: d.phone || "", vehicle_id: d.vehicle_id || "" }); }}><Pencil className="w-3 h-3" />Edit</Button>
                                <Button size="sm" variant="destructive" className="gap-1" onClick={() => { if (confirm(`Remove driver "${d.name}"?`)) act(() => api.admin.deleteDriver(d.id)); }}><Trash className="w-3 h-3" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}</div>
                  }
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── ASSIGN DRIVER DIALOG ── */}
      <Dialog open={!!assignReport} onOpenChange={() => setAssignReport(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Driver — {assignReport?.report_id}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><span className="text-muted-foreground">Citizen:</span> {assignReport?.citizen_name}</p>
              <p><span className="text-muted-foreground">Location:</span> {assignReport?.location_address || "N/A"}</p>
              <p><span className="text-muted-foreground">Type:</span> <span className="capitalize">{assignReport?.waste_type}</span> · <span className="capitalize">{assignReport?.priority}</span> priority</p>
            </div>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger><SelectValue placeholder="Select a driver..." /></SelectTrigger>
              <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle_id || "No vehicle"} ({d.active_tasks} active)</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignReport(null)}>Cancel</Button>
            <Button disabled={!selectedDriver || actionLoading} onClick={() => act(() => api.admin.approve(assignReport!.report_id, selectedDriver), () => setAssignReport(null))} className="gap-2">
              {actionLoading ? <Spinner /> : <Truck className="w-4 h-4" />} Approve & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT REPORT DIALOG ── */}
      <Dialog open={!!editReport} onOpenChange={() => setEditReport(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Report — {editReport?.report_id}</DialogTitle></DialogHeader>
          {editReport && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={editReport.status} onValueChange={v => setEditReport({ ...editReport, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Pending","Assigned","In Progress","Completed","Rejected"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Priority</Label>
                <Select value={editReport.priority} onValueChange={v => setEditReport({ ...editReport, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high"].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <F label="Location" id="rloc" value={editReport.location_address || ""} onChange={v => setEditReport({ ...editReport, location_address: v })} placeholder="Location address" />
              <F label="Description" id="rdesc" value={editReport.description || ""} onChange={v => setEditReport({ ...editReport, description: v })} placeholder="Description" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReport(null)}>Cancel</Button>
            <Button disabled={actionLoading} onClick={() => act(() => api.admin.updateReport(editReport!.report_id, { status: editReport!.status, priority: editReport!.priority, location_address: editReport!.location_address, description: editReport!.description }), () => setEditReport(null))} className="gap-2">
              {actionLoading ? <Spinner /> : <CheckCircle className="w-4 h-4" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── REPORT DETAIL DIALOG ── */}
      <Dialog open={!!detailReport} onOpenChange={() => setDetailReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <WasteIcon type={detailReport?.waste_type} large />
              <span className="font-mono">{detailReport?.report_id}</span>
              <Badge variant={detailReport?.status === "Completed" ? "default" : detailReport?.status === "Rejected" ? "destructive" : "secondary"}>{detailReport?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          {detailReport && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" />Citizen</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {detailReport.citizen_name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {detailReport.citizen_email}</p>
                  {detailReport.citizen_phone && <p><span className="text-muted-foreground">Phone:</span> {detailReport.citizen_phone}</p>}
                  {detailReport.citizen_location && <p><span className="text-muted-foreground">Area:</span> {detailReport.citizen_location}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />Location</p><p className="font-medium">{detailReport.location_address || (detailReport.lat ? `${detailReport.lat.toFixed(4)}, ${detailReport.lng?.toFixed(4)}` : "N/A")}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground flex items-center gap-1 mb-1"><Clock className="w-3 h-3" />Submitted</p><p className="font-medium">{new Date(detailReport.created_at).toLocaleString()}</p></div>
                {detailReport.assigned_unit && <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground flex items-center gap-1 mb-1"><Truck className="w-3 h-3" />Assigned Unit</p><p className="font-medium">{detailReport.assigned_unit}</p></div>}
                {detailReport.description && <div className="p-3 rounded-lg bg-muted/50 col-span-2"><p className="text-muted-foreground mb-1">Description</p><p className="font-medium">{detailReport.description}</p></div>}
              </div>
              {detailReport.image_path && <div><p className="text-sm font-semibold flex items-center gap-2 mb-2"><ImageIcon className="w-4 h-4 text-primary" />Citizen Image</p><img src={`${BASE}/${detailReport.image_path}`} alt="report" className="w-full max-h-48 object-cover rounded-xl border" /></div>}
              {detailReport.ai_results && <div><p className="text-sm font-semibold flex items-center gap-2 mb-3"><Brain className="w-4 h-4 text-primary" />AI Analysis</p><div className="space-y-2">{Object.entries(detailReport.ai_results).map(([t, v]) => <div key={t} className="space-y-1"><div className="flex justify-between text-sm"><span className="capitalize">{t}</span><span>{v.toFixed(1)}%</span></div><Progress value={v} className="h-1.5" /></div>)}</div></div>}
              {detailReport.driver_updates && detailReport.driver_updates.length > 0 && (
                <div><p className="text-sm font-semibold flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-green-500" />Driver Updates</p>
                  <div className="space-y-3">{detailReport.driver_updates.map((u, i) => (
                    <div key={i} className="p-3 rounded-xl border bg-card space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground"><span className="font-medium text-foreground">{u.driver_name || "Driver"}</span><span>{new Date(u.timestamp).toLocaleString()}</span></div>
                      {u.note && <p className="text-sm">{u.note}</p>}
                      {u.lat && u.lng && <p className="text-xs text-muted-foreground flex items-center gap-1"><Navigation className="w-3 h-3" />GPS: {u.lat.toFixed(4)}, {u.lng.toFixed(4)}</p>}
                      {u.image_path && <img src={`${BASE}/${u.image_path}`} alt="driver update" className="w-full max-h-40 object-cover rounded-lg border" />}
                    </div>
                  ))}</div>
                </div>
              )}
              {detailReport.timeline && detailReport.timeline.length > 0 && (
                <div><p className="text-sm font-semibold flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-primary" />Timeline</p>
                  <div className="space-y-2">{detailReport.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1"><span className="font-medium">{t.status}</span><span className="text-muted-foreground"> — {t.message}</span></div>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(t.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailReport(null)}>Close</Button>
            {detailReport?.status === "Pending" && <Button onClick={() => { setAssignReport(detailReport); setDetailReport(null); setSelectedDriver(""); }} className="gap-2"><Truck className="w-4 h-4" />Assign Driver</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD CITIZEN DIALOG ── */}
      <Dialog open={showAddCitizen} onOpenChange={setShowAddCitizen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Add Citizen</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <F label="Full Name" id="cn" value={citizenForm.name} onChange={v => setCitizenForm(f => ({ ...f, name: v }))} placeholder="John Doe" />
            <F label="Email" id="ce" type="email" value={citizenForm.email} onChange={v => setCitizenForm(f => ({ ...f, email: v }))} placeholder="john@example.com" />
            <F label="Password" id="cp" type="password" value={citizenForm.password} onChange={v => setCitizenForm(f => ({ ...f, password: v }))} placeholder="Password" />
            <F label="Phone" id="cph" value={citizenForm.phone} onChange={v => setCitizenForm(f => ({ ...f, phone: v }))} placeholder="+91 98765 43210" />
            <F label="City / Area" id="cl" value={citizenForm.location} onChange={v => setCitizenForm(f => ({ ...f, location: v }))} placeholder="Chennai, Tamil Nadu" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCitizen(false)}>Cancel</Button>
            <Button disabled={actionLoading || !citizenForm.name || !citizenForm.email || !citizenForm.password} onClick={() => act(() => api.admin.createCitizen(citizenForm), () => setShowAddCitizen(false))} className="gap-2">
              {actionLoading ? <Spinner /> : <Plus className="w-4 h-4" />} Create Citizen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT CITIZEN DIALOG ── */}
      <Dialog open={!!editCitizen} onOpenChange={() => setEditCitizen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5" />Edit Citizen — {editCitizen?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <F label="Full Name" id="ecn" value={editCitizenForm.name} onChange={v => setEditCitizenForm(f => ({ ...f, name: v }))} />
            <F label="Phone" id="ecph" value={editCitizenForm.phone} onChange={v => setEditCitizenForm(f => ({ ...f, phone: v }))} />
            <F label="City / Area" id="ecl" value={editCitizenForm.location} onChange={v => setEditCitizenForm(f => ({ ...f, location: v }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCitizen(null)}>Cancel</Button>
            <Button disabled={actionLoading} onClick={() => act(() => api.admin.updateCitizen(editCitizen!.id, editCitizenForm), () => setEditCitizen(null))} className="gap-2">
              {actionLoading ? <Spinner /> : <CheckCircle className="w-4 h-4" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD DRIVER DIALOG ── */}
      <Dialog open={showAddDriver} onOpenChange={setShowAddDriver}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Add Driver</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <F label="Full Name" id="dn" value={driverForm.name} onChange={v => setDriverForm(f => ({ ...f, name: v }))} placeholder="Driver Name" />
            <F label="Email" id="de" type="email" value={driverForm.email} onChange={v => setDriverForm(f => ({ ...f, email: v }))} placeholder="driver@example.com" />
            <F label="Password" id="dp" type="password" value={driverForm.password} onChange={v => setDriverForm(f => ({ ...f, password: v }))} placeholder="Password" />
            <F label="Phone" id="dph" value={driverForm.phone} onChange={v => setDriverForm(f => ({ ...f, phone: v }))} placeholder="+91 98765 43210" />
            <F label="Vehicle ID" id="dv" value={driverForm.vehicle_id} onChange={v => setDriverForm(f => ({ ...f, vehicle_id: v }))} placeholder="TN-01-AB-1234" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDriver(false)}>Cancel</Button>
            <Button disabled={actionLoading || !driverForm.name || !driverForm.email || !driverForm.password} onClick={() => act(() => api.admin.createDriver(driverForm), () => setShowAddDriver(false))} className="gap-2">
              {actionLoading ? <Spinner /> : <Plus className="w-4 h-4" />} Create Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DRIVER DIALOG ── */}
      <Dialog open={!!editDriver} onOpenChange={() => setEditDriver(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5" />Edit Driver — {editDriver?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <F label="Full Name" id="edn" value={editDriverForm.name} onChange={v => setEditDriverForm(f => ({ ...f, name: v }))} />
            <F label="Phone" id="edph" value={editDriverForm.phone} onChange={v => setEditDriverForm(f => ({ ...f, phone: v }))} />
            <F label="Vehicle ID" id="edv" value={editDriverForm.vehicle_id} onChange={v => setEditDriverForm(f => ({ ...f, vehicle_id: v }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDriver(null)}>Cancel</Button>
            <Button disabled={actionLoading} onClick={() => act(() => api.admin.updateDriver(editDriver!.id, editDriverForm), () => setEditDriver(null))} className="gap-2">
              {actionLoading ? <Spinner /> : <CheckCircle className="w-4 h-4" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
