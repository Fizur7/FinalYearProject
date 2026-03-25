"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Leaf,
  Recycle,
  AlertTriangle,
  Trash2,
  ChevronRight,
  Calendar,
  User,
  Brain,
  Navigation,
  Phone,
} from "lucide-react";

const mockReports = [
  {
    id: "RPT-LQ7X9K",
    location: "Main Street Junction, Block A",
    type: "Recyclable",
    status: "In Progress",
    submittedAt: "2024-01-15 09:23 AM",
    assignedUnit: "Unit Alpha (CU-001)",
    estimatedArrival: "~15 mins",
    progress: 65,
    timeline: [
      { status: "Submitted", time: "09:23 AM", completed: true },
      { status: "AI Analysis", time: "09:23 AM", completed: true },
      { status: "Validated", time: "09:24 AM", completed: true },
      { status: "Assigned", time: "09:24 AM", completed: true },
      { status: "En Route", time: "09:30 AM", completed: true },
      { status: "Collection", time: "Pending", completed: false },
      { status: "Completed", time: "Pending", completed: false },
    ],
    aiAnalysis: { organic: 12, recyclable: 78, hazardous: 3, general: 7 },
    points: 10,
  },
  {
    id: "RPT-M3N8P2",
    location: "Central Park Area, Near Fountain",
    type: "Organic",
    status: "Assigned",
    submittedAt: "2024-01-15 09:18 AM",
    assignedUnit: "Unit Gamma (CU-003)",
    estimatedArrival: "~25 mins",
    progress: 45,
    timeline: [
      { status: "Submitted", time: "09:18 AM", completed: true },
      { status: "AI Analysis", time: "09:18 AM", completed: true },
      { status: "Validated", time: "09:19 AM", completed: true },
      { status: "Assigned", time: "09:20 AM", completed: true },
      { status: "En Route", time: "Pending", completed: false },
      { status: "Collection", time: "Pending", completed: false },
      { status: "Completed", time: "Pending", completed: false },
    ],
    aiAnalysis: { organic: 85, recyclable: 8, hazardous: 2, general: 5 },
    points: 10,
  },
  {
    id: "RPT-K9J4H7",
    location: "Market Square, Stall 45",
    type: "General",
    status: "Completed",
    submittedAt: "2024-01-15 08:45 AM",
    assignedUnit: "Unit Beta (CU-002)",
    estimatedArrival: "Completed",
    progress: 100,
    timeline: [
      { status: "Submitted", time: "08:45 AM", completed: true },
      { status: "AI Analysis", time: "08:45 AM", completed: true },
      { status: "Validated", time: "08:46 AM", completed: true },
      { status: "Assigned", time: "08:47 AM", completed: true },
      { status: "En Route", time: "08:52 AM", completed: true },
      { status: "Collection", time: "09:05 AM", completed: true },
      { status: "Completed", time: "09:12 AM", completed: true },
    ],
    aiAnalysis: { organic: 15, recyclable: 22, hazardous: 5, general: 58 },
    points: 10,
  },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [searchId, setSearchId] = useState(initialId);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(
    initialId ? mockReports.find((r) => r.id === initialId) || mockReports[0] : null
  );

  const handleSearch = () => {
    const found = mockReports.find((r) => r.id.toLowerCase().includes(searchId.toLowerCase()));
    setSelectedReport(found || null);
  };

  const getWasteIcon = (type: string) => {
    switch (type) {
      case "Organic": return Leaf;
      case "Recyclable": return Recycle;
      case "Hazardous": return AlertTriangle;
      default: return Trash2;
    }
  };

  const getWasteColor = (type: string) => {
    switch (type) {
      case "Organic": return "bg-green-500";
      case "Recyclable": return "bg-blue-500";
      case "Hazardous": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge variant="secondary" className="mb-4">Report Tracking</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Track Your Waste Report
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your report ID to see real-time status updates and collection progress.
            </p>
          </motion.div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter Report ID (e.g., RPT-LQ7X9K)"
                    className="pl-10"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  Track
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <span className="text-sm text-muted-foreground">Try:</span>
                {mockReports.map((report) => (
                  <Button
                    key={report.id}
                    variant="ghost"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => {
                      setSearchId(report.id);
                      setSelectedReport(report);
                    }}
                  >
                    {report.id}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedReport ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${getWasteColor(selectedReport.type)} flex items-center justify-center`}>
                          {(() => {
                            const Icon = getWasteIcon(selectedReport.type);
                            return <Icon className="w-6 h-6 text-white" />;
                          })()}
                        </div>
                        <div>
                          <CardTitle className="font-mono">{selectedReport.id}</CardTitle>
                          <CardDescription>{selectedReport.type} Waste</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          selectedReport.status === "Completed" ? "default" :
                          selectedReport.status === "In Progress" ? "secondary" : "outline"
                        }
                        className="text-sm"
                      >
                        {selectedReport.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedReport.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="font-medium">{selectedReport.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Truck className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned Unit</p>
                          <p className="font-medium">{selectedReport.assignedUnit}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Arrival</p>
                          <p className="font-medium">{selectedReport.estimatedArrival}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Collection Progress</span>
                        <span className="text-sm text-muted-foreground">{selectedReport.progress}%</span>
                      </div>
                      <Progress value={selectedReport.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Status Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {selectedReport.timeline.map((step, i) => (
                        <div key={i} className="flex gap-4 pb-6 last:pb-0">
                          <div className="relative flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                            </div>
                            {i < selectedReport.timeline.length - 1 && (
                              <div className={`absolute top-8 w-0.5 h-full ${
                                step.completed ? "bg-primary" : "bg-muted"
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <p className={`font-medium ${!step.completed && "text-muted-foreground"}`}>
                                {step.status}
                              </p>
                              <span className="text-sm text-muted-foreground">{step.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Analysis
                    </CardTitle>
                    <CardDescription>YOLOv8 classification results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedReport.aiAnalysis).map(([type, value]) => {
                      const Icon = getWasteIcon(type.charAt(0).toUpperCase() + type.slice(1));
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm capitalize">{type}</span>
                            </div>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Points Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-3xl font-bold text-primary">+{selectedReport.points}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Points will be credited upon verification
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Report Selected</h3>
                <p className="text-muted-foreground">
                  Enter a report ID above to track your waste report status.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
