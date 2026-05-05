"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, MapPin, Clock, CheckCircle,
  Truck, Leaf, Recycle, AlertTriangle, Trash2,
  RefreshCw, Zap, Star, Trophy, ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Report {
  id: string; report_id: string; location_address?: string;
  waste_type?: string; status: string; priority: string; created_at: string;
}
interface Stats {
  total_reports: number; pending_reports: number; assigned_reports: number;
  in_progress_reports: number; completed_reports: number;
  completed_today: number; points: number; level: number;
}
interface WasteDist { type: string; count: number; }

const wasteColor: Record<string, string> = {
  organic: "bg-green-500", recyclable: "bg-blue-500",
  hazardous: "bg-orange-500", general: "bg-gray-500",
};
const WasteIcon = ({ type }: { type?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    organic: <Leaf className="w-5 h-5 text-white" />,
    recyclable: <Recycle className="w-5 h-5 text-white" />,
    hazardous: <AlertTriangle className="w-5 h-5 text-white" />,
    general: <Trash2 className="w-5 h-5 text-white" />,
  };
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${wasteColor[type || "general"] || "bg-gray-500"}`}>
      {icons[type || "general"]}
    </div>
  );
};


export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [wasteDist, setWasteDist] = useState<WasteDist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, w] = await Promise.all([
        api.dashboard.stats() as Promise<Stats>,
        api.dashboard.recentReports() as Promise<Report[]>,
        api.dashboard.wasteDistribution() as Promise<WasteDist[]>,
      ]);
      setStats(s); setReports(r); setWasteDist(w);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("validate credentials")) {
        localStorage.removeItem("token"); localStorage.removeItem("user");
        router.push("/login");
      }
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const totalWaste = wasteDist.reduce((a, b) => a + b.count, 0);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name} — here are your waste reports</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "My Reports", value: stats?.total_reports ?? 0, icon: BarChart3, gradient: "card-gradient-green", text: "text-white" },
              { label: "Pending", value: stats?.pending_reports ?? 0, icon: Clock, gradient: "card-gradient-orange", text: "text-white" },
              { label: "Completed", value: stats?.completed_reports ?? 0, icon: CheckCircle, gradient: "card-gradient-blue", text: "text-white" },
              { label: "In Progress", value: stats?.in_progress_reports ?? 0, icon: Truck, gradient: "bg-gradient-to-br from-purple-500 to-purple-600", text: "text-white" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className={`${s.gradient} rounded-2xl p-5 card-hover shadow-md`}>
                  <s.icon className="w-6 h-6 text-white/80 mb-3" />
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-white/80 mt-1">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Points & Level */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="hero-gradient rounded-2xl p-6 card-hover shadow-lg animate-pulse-glow">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8 text-white/90" />
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">+10 per report</span>
                </div>
                <p className="text-4xl font-bold text-white mt-2">{stats?.points ?? 0}</p>
                <p className="text-sm text-white/80 mt-1">Total Points Earned</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <Card className="h-full card-hover stat-card">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Star className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">Level {stats?.level ?? 1}</p>
                    <p className="text-sm text-muted-foreground">Completed today: <span className="font-semibold text-primary">{stats?.completed_today ?? 0}</span></p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Report status breakdown */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Report Status Overview</CardTitle>
                  <CardDescription>Current status of all your submitted reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: "Pending Review", value: stats?.pending_reports ?? 0, total: stats?.total_reports ?? 1, color: "bg-orange-500", icon: Clock },
                    { label: "Assigned to Driver", value: stats?.assigned_reports ?? 0, total: stats?.total_reports ?? 1, color: "bg-blue-500", icon: Truck },
                    { label: "In Progress", value: stats?.in_progress_reports ?? 0, total: stats?.total_reports ?? 1, color: "bg-yellow-500", icon: Zap },
                    { label: "Completed", value: stats?.completed_reports ?? 0, total: stats?.total_reports ?? 1, color: "bg-green-500", icon: CheckCircle },
                  ].map((s, i) => {
                    const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                              <s.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{s.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{s.value}</span>
                            <span className="text-muted-foreground text-sm ml-1">({pct}%)</span>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </motion.div>
                    );
                  })}
                  {(stats?.total_reports ?? 0) === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Submit your first report to see stats here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Waste classification */}
            <Card>
              <CardHeader>
                <CardTitle>My Waste Types</CardTitle>
                <CardDescription>Breakdown of your submitted reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wasteDist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No reports yet</p>
                ) : wasteDist.map((item, i) => {
                  const pct = totalWaste > 0 ? Math.round((item.count / totalWaste) * 100) : 0;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${wasteColor[item.type] || "bg-gray-500"} flex items-center justify-center`}>
                            {item.type === "organic" ? <Leaf className="w-4 h-4 text-white" /> :
                             item.type === "recyclable" ? <Recycle className="w-4 h-4 text-white" /> :
                             item.type === "hazardous" ? <AlertTriangle className="w-4 h-4 text-white" /> :
                             <Trash2 className="w-4 h-4 text-white" />}
                          </div>
                          <span className="font-medium capitalize">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{item.count}</span>
                          <span className="text-muted-foreground text-sm ml-1">({pct}%)</span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </motion.div>
                  );
                })}
                {totalWaste > 0 && (
                  <div className="pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Reports</span>
                    <span className="font-bold">{totalWaste}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent reports */}
          <Card className="stat-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Recent Reports</CardTitle>
                  <CardDescription>Your latest waste submissions — click to track</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/tracking")} className="gap-1 text-primary">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-14 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground opacity-40" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">No reports yet</p>
                    <p className="text-sm text-muted-foreground">Submit your first waste report to get started</p>
                  </div>
                  <Button onClick={() => router.push("/report")} className="gap-2">
                    <Leaf className="w-4 h-4" /> Report Waste
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report, i) => (
                    <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all cursor-pointer card-hover border border-transparent hover:border-border"
                      onClick={() => router.push(`/tracking?id=${report.report_id}`)}>
                      <WasteIcon type={report.waste_type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{report.report_id}</span>
                          <Badge variant={report.priority === "high" ? "destructive" : report.priority === "medium" ? "default" : "secondary"} className="text-xs">
                            {report.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{report.location_address || "No location"}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={
                          report.status === "Completed" ? "default" :
                          report.status === "In Progress" ? "secondary" :
                          report.status === "Assigned" ? "outline" : "destructive"
                        }>{report.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
}
