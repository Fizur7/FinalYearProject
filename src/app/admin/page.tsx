"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Leaf, MapPin, Clock, CheckCircle, XCircle, Truck, Users, BarChart3, RefreshCw, AlertTriangle, Recycle, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Report {
  id: string; report_id: string; location_address?: string;
  waste_type?: string; status: string; priority: string;
  ai_confidence?: number; assigned_unit?: string; assigned_driver_id?: string;
  created_at: string; description?: string; lat?: number; lng?: number;
}
interface Driver { id: string; name: string; vehicle_id?: string; phone?: string; active_tasks: number; }

const wasteColor: Record<string, string> = {
  organic: "bg-green-500", recyclable: "bg-blue-500",
  hazardous: "bg-orange-500", general: "bg-gray-500",
};
const WasteIcon = ({ type }: { type?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    organic: <Leaf className="w-4 h-4 text-white" />,
    recyclable: <Recycle className="w-4 h-4 text-white" />,
    hazardous: <AlertTriangle className="w-4 h-4 text-white" />,
    general: <Trash2 className="w-4 h-4 text-white" />,
  };
  return <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${wasteColor[type || "general"] || "bg-gray-500"}`}>{icons[type || "general"]}</div>;
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, d] = await Promise.all([
        api.admin.reports(statusFilter) as Promise<Report[]>,
        api.admin.drivers() as Promise<Driver[]>,
      ]);
      setReports(r);
      setDrivers(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/admin-login");
    }
  }, [user, isLoading, router]);

  useEffect(() => { if (user?.role === "admin") fetchData(); }, [fetchData, user]);

  const handleApprove = async () => {
    if (!selectedReport || !selectedDriver) return;
    setActionLoading(true);
    try {
      await api.admin.approve(selectedReport.report_id, selectedDriver);
      setSelectedReport(null);
      fetchData();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (report: Report) => {
    if (!confirm("Reject this report?")) return;
    try {
      await api.admin.reject(report.report_id, "Does not meet criteria");
      fetchData();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed"); }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "Pending").length,
    assigned: reports.filter(r => r.status === "Assigned").length,
    inProgress: reports.filter(r => r.status === "In Progress").length,
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Portal</h1>
              <p className="text-muted-foreground">Approve citizen reports and assign to drivers</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Reports", value: stats.total, icon: BarChart3, color: "text-primary" },
              { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-orange-500" },
              { label: "Assigned", value: stats.assigned, icon: Truck, color: "text-blue-500" },
              { label: "In Progress", value: stats.inProgress, icon: CheckCircle, color: "text-green-500" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card><CardContent className="p-4">
                  <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="reports">
            <TabsList className="mb-6">
              <TabsTrigger value="reports" className="gap-2"><BarChart3 className="w-4 h-4" />Reports</TabsTrigger>
              <TabsTrigger value="drivers" className="gap-2"><Users className="w-4 h-4" />Drivers</TabsTrigger>
            </TabsList>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Citizen Reports</CardTitle><CardDescription>Review and assign reports to drivers</CardDescription></div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Pending", "Assigned", "In Progress", "Completed", "Rejected"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No {statusFilter.toLowerCase()} reports</div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report, i) => (
                        <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                          <WasteIcon type={report.waste_type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-semibold">{report.report_id}</span>
                              <Badge variant={report.priority === "high" ? "destructive" : report.priority === "medium" ? "default" : "secondary"} className="text-xs">{report.priority}</Badge>
                              <Badge variant="outline" className="text-xs capitalize">{report.waste_type}</Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" /><span className="truncate">{report.location_address || "No location"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(report.created_at).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={report.status === "Completed" ? "default" : report.status === "Rejected" ? "destructive" : "secondary"}>{report.status}</Badge>
                            {report.status === "Pending" && (
                              <>
                                <Button size="sm" className="gap-1" onClick={() => { setSelectedReport(report); setSelectedDriver(""); }}>
                                  <Truck className="w-3 h-3" /> Assign
                                </Button>
                                <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(report)}>
                                  <XCircle className="w-3 h-3" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drivers">
              <Card>
                <CardHeader><CardTitle>Active Drivers</CardTitle><CardDescription>Driver fleet status</CardDescription></CardHeader>
                <CardContent>
                  {drivers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No drivers registered</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {drivers.map((driver, i) => (
                        <motion.div key={driver.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                          <Card className="hover:shadow-md transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{driver.name[0]}</div>
                                <div><p className="font-semibold">{driver.name}</p><p className="text-xs text-muted-foreground">{driver.vehicle_id || "No vehicle"}</p></div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Active tasks</span>
                                <Badge variant={driver.active_tasks > 0 ? "default" : "secondary"}>{driver.active_tasks}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Assign Driver Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver — {selectedReport?.report_id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><span className="text-muted-foreground">Location:</span> {selectedReport?.location_address || "N/A"}</p>
              <p><span className="text-muted-foreground">Waste type:</span> <span className="capitalize">{selectedReport?.waste_type}</span></p>
              <p><span className="text-muted-foreground">Priority:</span> {selectedReport?.priority}</p>
            </div>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger><SelectValue placeholder="Select a driver..." /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.vehicle_id || "No vehicle"} ({d.active_tasks} active)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={!selectedDriver || actionLoading} className="gap-2">
              {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
              Approve & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
