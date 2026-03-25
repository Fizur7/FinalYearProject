"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Camera, Upload, Navigation, CheckCircle, Clock, Truck, Leaf, Recycle, AlertTriangle, Trash2, RefreshCw, X, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Report {
  id: string; report_id: string; location_address?: string;
  waste_type?: string; status: string; priority: string;
  lat?: number; lng?: number; description?: string;
  assigned_unit?: string; created_at: string;
  driver_updates?: { image_path?: string; lat?: number; lng?: number; note?: string; timestamp: string }[];
}

const wasteColor: Record<string, string> = {
  organic: "bg-green-500", recyclable: "bg-blue-500",
  hazardous: "bg-orange-500", general: "bg-gray-500",
};
const WasteIcon = ({ type }: { type?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    organic: <Leaf className="w-4 h-4 text-white" />, recyclable: <Recycle className="w-4 h-4 text-white" />,
    hazardous: <AlertTriangle className="w-4 h-4 text-white" />, general: <Trash2 className="w-4 h-4 text-white" />,
  };
  return <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${wasteColor[type || "general"] || "bg-gray-500"}`}>{icons[type || "general"]}</div>;
};

export default function DriverPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Report[]>([]);
  const [history, setHistory] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Report | null>(null);
  const [updateType, setUpdateType] = useState<"update" | "complete">("update");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        api.driver.tasks() as Promise<Report[]>,
        api.driver.history() as Promise<Report[]>,
      ]);
      setTasks(t);
      setHistory(h);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "driver")) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => { if (user?.role === "driver") fetchTasks(); }, [fetchTasks, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Location access denied"),
    );
  };

  const handleSubmit = async () => {
    if (!activeTask) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      if (note) form.append("note", note);
      if (location) { form.append("lat", String(location.lat)); form.append("lng", String(location.lng)); }
      if (image) form.append("image", image);

      if (updateType === "complete") {
        await api.driver.complete(activeTask.report_id, form);
      } else {
        await api.driver.update(activeTask.report_id, form);
      }
      setActiveTask(null);
      setNote(""); setImage(null); setImagePreview(null); setLocation(null);
      fetchTasks();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "driver")) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (user && user.role !== "driver") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <Truck className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to registered drivers.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Driver Portal</h1>
              <p className="text-muted-foreground">Welcome, {user?.name} — manage your assigned tasks</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={fetchTasks} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Tasks", value: tasks.length, icon: Truck, color: "text-primary" },
              { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: Clock, color: "text-orange-500" },
              { label: "Completed", value: history.filter(t => t.status === "Completed").length, icon: CheckCircle, color: "text-green-500" },
            ].map((s, i) => (
              <Card key={i}><CardContent className="p-4">
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <Tabs defaultValue="tasks">
            <TabsList className="mb-6">
              <TabsTrigger value="tasks" className="gap-2"><Truck className="w-4 h-4" />Active Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><CheckCircle className="w-4 h-4" />History</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              {tasks.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No active tasks assigned to you</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="hover:shadow-md transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <WasteIcon type={task.waste_type} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold">{task.report_id}</span>
                                <Badge variant={task.priority === "high" ? "destructive" : "default"} className="text-xs">{task.priority}</Badge>
                                <Badge variant="secondary" className="text-xs">{task.status}</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                <MapPin className="w-3 h-3" />{task.location_address || "No location"}
                              </div>
                              {task.lat && task.lng && (
                                <p className="text-xs text-muted-foreground">GPS: {task.lat.toFixed(4)}, {task.lng.toFixed(4)}</p>
                              )}
                              {task.description && <p className="text-sm mt-2 text-muted-foreground">{task.description}</p>}
                              {task.driver_updates && task.driver_updates.length > 0 && (
                                <p className="text-xs text-primary mt-1">{task.driver_updates.length} update(s) submitted</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button size="sm" className="gap-1" onClick={() => { setActiveTask(task); setUpdateType("update"); }}>
                                <Camera className="w-3 h-3" /> Update
                              </Button>
                              <Button size="sm" variant="default" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => { setActiveTask(task); setUpdateType("complete"); }}>
                                <CheckCircle className="w-3 h-3" /> Complete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {history.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">No completed tasks yet</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {history.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <Card className="opacity-80">
                        <CardContent className="p-4 flex items-center gap-4">
                          <WasteIcon type={task.waste_type} />
                          <div className="flex-1">
                            <span className="font-mono text-sm font-semibold">{task.report_id}</span>
                            <p className="text-xs text-muted-foreground">{task.location_address}</p>
                          </div>
                          <Badge variant={task.status === "Completed" ? "default" : "secondary"}>{task.status}</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Update / Complete Dialog */}
      <Dialog open={!!activeTask} onOpenChange={() => { setActiveTask(null); setNote(""); setImage(null); setImagePreview(null); setLocation(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {updateType === "complete" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Camera className="w-5 h-5 text-primary" />}
              {updateType === "complete" ? "Mark as Completed" : "Submit Progress Update"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground font-mono">{activeTask?.report_id} — {activeTask?.location_address}</p>

            {/* Image upload */}
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors ${imagePreview ? "border-primary" : "border-muted"}`}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="max-h-40 mx-auto rounded-lg" />
                  <Button size="icon" variant="destructive" className="absolute top-1 right-1 w-6 h-6"
                    onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload photo from the site</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 flex-1" onClick={handleGetLocation}>
                <Navigation className="w-4 h-4" /> {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Capture Location"}
              </Button>
              {location && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            {/* Note */}
            <Textarea placeholder={updateType === "complete" ? "Describe the completed work..." : "Describe current progress..."} value={note} onChange={(e) => setNote(e.target.value)} className="resize-none" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTask(null)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || (!image && !location && !note)}
              className={`gap-2 ${updateType === "complete" ? "bg-green-600 hover:bg-green-700" : ""}`}>
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {updateType === "complete" ? "Mark Complete" : "Submit Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
