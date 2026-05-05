"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search, MapPin, Clock, CheckCircle, AlertCircle, Truck,
  Leaf, Recycle, AlertTriangle, Trash2, Calendar, Brain,
  Phone, Loader2, ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface TimelineEntry { status: string; message: string; timestamp: string; }
interface Report {
  id: string; report_id: string; location_address?: string;
  waste_type?: string; status: string; priority: string;
  ai_confidence?: number; ai_results?: Record<string, number>;
  assigned_unit?: string; timeline: TimelineEntry[];
  created_at: string; description?: string; lat?: number; lng?: number;
}

const wasteColor: Record<string, string> = {
  organic: "bg-green-500", recyclable: "bg-blue-500",
  hazardous: "bg-orange-500", general: "bg-gray-500",
};
const WasteIcon = ({ type, large }: { type?: string; large?: boolean }) => {
  const icons: Record<string, React.ReactNode> = {
    organic: <Leaf className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />,
    recyclable: <Recycle className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />,
    hazardous: <AlertTriangle className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />,
    general: <Trash2 className={large ? "w-6 h-6 text-white" : "w-4 h-4 text-white"} />,
  };
  return (
    <div className={`${large ? "w-12 h-12 rounded-xl" : "w-10 h-10 rounded-lg"} flex items-center justify-center ${wasteColor[type || "general"] || "bg-gray-500"}`}>
      {icons[type || "general"]}
    </div>
  );
};

const statusProgress: Record<string, number> = {
  Pending: 10, Assigned: 35, "In Progress": 65, Completed: 100, Rejected: 0,
};

function TrackingContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [myReports, setMyReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchId, setSearchId] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await api.reports.list() as Report[];
      setMyReports(data);
      // Auto-select if came from report submission
      if (initialId) {
        const found = data.find(r => r.report_id === initialId);
        if (found) setSelectedReport(found);
        else {
          // fetch directly
          const detail = await api.reports.get(initialId) as Report;
          setSelectedReport(detail);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("validate credentials")) {
        localStorage.removeItem("token"); localStorage.removeItem("user");
        router.push("/login");
      }
    } finally { setLoadingReports(false); }
  }, [initialId, router]);

  useEffect(() => { if (!isLoading && !user) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) fetchMyReports(); }, [user, fetchMyReports]);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoadingDetail(true);
    try {
      const data = await api.reports.get(searchId.trim()) as Report;
      setSelectedReport(data);
    } catch { alert("Report not found"); }
    finally { setLoadingDetail(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Badge variant="secondary" className="mb-3">Report Tracking</Badge>
            <h1 className="text-3xl font-bold mb-2">Track Your Reports</h1>
            <p className="text-muted-foreground">Click any report below to see its full status and timeline.</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left — report list */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by Report ID..." className="pl-9 font-mono text-sm"
                    value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleSearch()} />
                </div>
                <Button size="sm" onClick={handleSearch} disabled={loadingDetail}>
                  {loadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* My reports list */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">My Reports ({myReports.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingReports ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : myReports.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <Trash2 className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-30" />
                      <p className="text-sm text-muted-foreground">No reports yet.</p>
                      <Button size="sm" className="mt-3" onClick={() => router.push("/report")}>Submit a Report</Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {myReports.map((r, i) => (
                        <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedReport(r)}
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedReport?.id === r.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                          <WasteIcon type={r.waste_type} />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-semibold">{r.report_id}</p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />{r.location_address || "No location"}
                            </p>
                            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={r.status === "Completed" ? "default" : r.status === "Rejected" ? "destructive" : "secondary"} className="text-xs shrink-0">
                            {r.status}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right — report detail */}
            <div className="lg:col-span-3">
              {!selectedReport ? (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <Search className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">Select a Report</h3>
                    <p className="text-muted-foreground text-sm">Click any report from the list to view its details and tracking timeline.</p>
                  </CardContent>
                </Card>
              ) : (
                <motion.div key={selectedReport.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <WasteIcon type={selectedReport.waste_type} large />
                          <div>
                            <CardTitle className="font-mono">{selectedReport.report_id}</CardTitle>
                            <CardDescription className="capitalize">{selectedReport.waste_type || "Unknown"} Waste</CardDescription>
                          </div>
                        </div>
                        <Badge variant={selectedReport.status === "Completed" ? "default" : selectedReport.status === "Rejected" ? "destructive" : "secondary"} className="text-sm">
                          {selectedReport.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div><p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{selectedReport.location_address || (selectedReport.lat ? `${selectedReport.lat.toFixed(4)}, ${selectedReport.lng?.toFixed(4)}` : "N/A")}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div><p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="text-sm font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {selectedReport.assigned_unit && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div><p className="text-xs text-muted-foreground">Assigned Unit</p>
                              <p className="text-sm font-medium">{selectedReport.assigned_unit}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div><p className="text-xs text-muted-foreground">Priority</p>
                            <p className="text-sm font-medium capitalize">{selectedReport.priority}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Collection Progress</span>
                          <span className="text-muted-foreground">{statusProgress[selectedReport.status] ?? 0}%</span>
                        </div>
                        <Progress value={statusProgress[selectedReport.status] ?? 0} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4 text-primary" />Status Timeline</CardTitle></CardHeader>
                    <CardContent>
                      {selectedReport.timeline.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
                      ) : (
                        <div className="relative">
                          {selectedReport.timeline.map((step, i) => (
                            <div key={i} className="flex gap-4 pb-5 last:pb-0">
                              <div className="relative flex flex-col items-center">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center z-10 bg-primary text-primary-foreground">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </div>
                                {i < selectedReport.timeline.length - 1 && <div className="absolute top-7 w-0.5 h-full bg-primary/20" />}
                              </div>
                              <div className="flex-1 pb-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{step.status}</p>
                                  <span className="text-xs text-muted-foreground">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{step.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Analysis */}
                  {selectedReport.ai_results && (
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain className="w-4 h-4 text-primary" />AI Analysis</CardTitle>
                        <CardDescription>YOLOv8 waste classification</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(selectedReport.ai_results).map(([type, val]) => (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm"><span className="capitalize">{type}</span><span>{val.toFixed(1)}%</span></div>
                            <Progress value={val} className="h-1.5" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
