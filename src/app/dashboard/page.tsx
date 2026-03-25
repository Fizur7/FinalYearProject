"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Users,
  Leaf,
  Recycle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Filter,
  Download,
  Target,
  Zap,
} from "lucide-react";

const recentReports = [
  { id: "RPT-A1B2C", location: "Main Street Junction", type: "Recyclable", status: "In Progress", time: "2 min ago", priority: "high" },
  { id: "RPT-D3E4F", location: "Central Park Area", type: "Organic", status: "Assigned", time: "5 min ago", priority: "medium" },
  { id: "RPT-G5H6I", location: "Market Square", type: "General", status: "Completed", time: "12 min ago", priority: "low" },
  { id: "RPT-J7K8L", location: "Railway Station", type: "Hazardous", status: "Pending", time: "18 min ago", priority: "high" },
  { id: "RPT-M9N0O", location: "Hospital Road", type: "Organic", status: "In Progress", time: "25 min ago", priority: "medium" },
  { id: "RPT-P1Q2R", location: "School Zone", type: "Recyclable", status: "Completed", time: "32 min ago", priority: "low" },
];

const collectionUnits = [
  { id: "CU-001", name: "Unit Alpha", status: "Active", currentTask: "RPT-A1B2C", location: "Main Street", load: 65 },
  { id: "CU-002", name: "Unit Beta", status: "Active", currentTask: "RPT-M9N0O", location: "Hospital Road", load: 42 },
  { id: "CU-003", name: "Unit Gamma", status: "En Route", currentTask: "RPT-D3E4F", location: "Central Park", load: 78 },
  { id: "CU-004", name: "Unit Delta", status: "Idle", currentTask: null, location: "Depot", load: 15 },
];

const wasteDistribution = [
  { type: "Organic", count: 342, color: "bg-green-500", icon: Leaf, percentage: 35 },
  { type: "Recyclable", count: 287, color: "bg-blue-500", icon: Recycle, percentage: 29 },
  { type: "General", count: 245, color: "bg-gray-500", icon: Trash2, percentage: 25 },
  { type: "Hazardous", count: 108, color: "bg-orange-500", icon: AlertTriangle, percentage: 11 },
];

const heatmapZones = [
  { zone: "Zone A - Downtown", intensity: 92, reports: 156, trend: "up" },
  { zone: "Zone B - Industrial", intensity: 78, reports: 98, trend: "down" },
  { zone: "Zone C - Residential", intensity: 65, reports: 87, trend: "up" },
  { zone: "Zone D - Commercial", intensity: 85, reports: 134, trend: "stable" },
  { zone: "Zone E - Suburbs", intensity: 45, reports: 52, trend: "down" },
];

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 982,
    pendingReports: 47,
    completedToday: 156,
    avgResponseTime: 28.4,
    validationRate: 87,
    activeUnits: 3,
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats({
        ...stats,
        totalReports: stats.totalReports + Math.floor(Math.random() * 5),
        completedToday: stats.completedToday + Math.floor(Math.random() * 3),
      });
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Municipal Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of waste reports and collection operations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Reports", value: stats.totalReports, icon: BarChart3, trend: "+12%", color: "text-primary" },
              { label: "Pending", value: stats.pendingReports, icon: Clock, trend: "-8%", color: "text-orange-500" },
              { label: "Completed Today", value: stats.completedToday, icon: CheckCircle, trend: "+23%", color: "text-green-500" },
              { label: "Avg Response", value: `${stats.avgResponseTime}s`, icon: Zap, trend: "-5%", color: "text-blue-500" },
              { label: "Validation Rate", value: `${stats.validationRate}%`, icon: Target, trend: "+2%", color: "text-purple-500" },
              { label: "Active Units", value: stats.activeUnits, icon: Truck, trend: "stable", color: "text-teal-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend.startsWith("+") ? (
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                        ) : stat.trend.startsWith("-") ? (
                          <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                        ) : null}
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Waste Distribution Heatmap</CardTitle>
                      <CardDescription>High-density overflow zones by region</CardDescription>
                    </div>
                    <Badge variant="outline">88% Accuracy</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {[...Array(25)].map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded-lg transition-all hover:scale-105 cursor-pointer"
                          style={{
                            backgroundColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`,
                          }}
                          title={`Zone ${i + 1}: ${Math.floor(intensity * 100)}% activity`}
                        />
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {heatmapZones.map((zone, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{zone.zone}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{zone.reports} reports</span>
                              {zone.trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
                              {zone.trend === "down" && <TrendingDown className="w-4 h-4 text-green-500" />}
                            </div>
                          </div>
                          <Progress value={zone.intensity} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Waste Classification</CardTitle>
                <CardDescription>Distribution by waste type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wasteDistribution.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{item.count}</span>
                        <span className="text-muted-foreground text-sm ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </motion.div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Classified</span>
                    <span className="font-bold">{wasteDistribution.reduce((a, b) => a + b.count, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest waste reports from citizens</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.map((report, i) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        report.type === "Organic" ? "bg-green-500" :
                        report.type === "Recyclable" ? "bg-blue-500" :
                        report.type === "Hazardous" ? "bg-orange-500" : "bg-gray-500"
                      }`}>
                        {report.type === "Organic" ? <Leaf className="w-5 h-5 text-white" /> :
                         report.type === "Recyclable" ? <Recycle className="w-5 h-5 text-white" /> :
                         report.type === "Hazardous" ? <AlertTriangle className="w-5 h-5 text-white" /> :
                         <Trash2 className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{report.id}</span>
                          <Badge variant={
                            report.priority === "high" ? "destructive" :
                            report.priority === "medium" ? "default" : "secondary"
                          } className="text-xs">
                            {report.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{report.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          report.status === "Completed" ? "default" :
                          report.status === "In Progress" ? "secondary" :
                          report.status === "Assigned" ? "outline" : "destructive"
                        }>
                          {report.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{report.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Collection Units</CardTitle>
                    <CardDescription>Active fleet status and assignments</CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collectionUnits.map((unit, i) => (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            unit.status === "Active" ? "bg-green-500" :
                            unit.status === "En Route" ? "bg-blue-500" : "bg-gray-400"
                          }`}>
                            <Truck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{unit.name}</p>
                            <p className="text-xs text-muted-foreground">{unit.id}</p>
                          </div>
                        </div>
                        <Badge variant={
                          unit.status === "Active" ? "default" :
                          unit.status === "En Route" ? "secondary" : "outline"
                        }>
                          {unit.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{unit.location}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Task</p>
                          <p className="font-mono">{unit.currentTask || "—"}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Capacity Load</span>
                          <span className="font-medium">{unit.load}%</span>
                        </div>
                        <Progress value={unit.load} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
