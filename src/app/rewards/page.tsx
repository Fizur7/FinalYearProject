"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Star, Crown, Gift, Zap, CheckCircle, Users, Award } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface LeaderboardEntry { rank: number; name: string; points: number; reports: number; }
interface UserStats { name: string; rank: number; points: number; total_reports: number; level: number; streak: number; }
interface RewardItem { id: string; name: string; points_cost: number; icon: string; available: boolean; }

export default function RewardsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lb, stats, rw] = await Promise.all([
        api.rewards.leaderboard() as Promise<LeaderboardEntry[]>,
        api.rewards.myStats() as Promise<UserStats>,
        api.rewards.list() as Promise<RewardItem[]>,
      ]);
      setLeaderboard(lb);
      setMyStats(stats);
      setRewards(rw);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("validate credentials")) {
        localStorage.removeItem("token"); localStorage.removeItem("user");
        router.push("/login");
      }
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { if (!isLoading && !user) router.push("/login"); }, [user, isLoading, router]);
  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleRedeem = async (reward: RewardItem) => {
    if (!myStats || myStats.points < reward.points_cost) return;
    setRedeemLoading(reward.id);
    try {
      await api.rewards.redeem(reward.id);
      fetchData();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setRedeemLoading(null); }
  };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">Citizen Rewards</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Earn Points, Get Rewards</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Submit verified waste reports to earn points and unlock exciting rewards.
            </p>
          </motion.div>

          {/* Stats row */}
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8" />
                    <Badge variant="secondary">Rank #{myStats?.rank ?? "—"}</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{myStats?.points ?? 0}</p>
                  <p className="text-sm opacity-90">Total Points</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card><CardContent className="p-6">
                <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                <p className="text-4xl font-bold mb-1">{myStats?.total_reports ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </CardContent></Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card><CardContent className="p-6">
                <Zap className="w-8 h-8 text-orange-500 mb-4" />
                <p className="text-4xl font-bold mb-1">{myStats?.streak ?? 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent></Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card><CardContent className="p-6">
                <Star className="w-8 h-8 text-yellow-500 mb-4" />
                <p className="text-4xl font-bold mb-1">Level {myStats?.level ?? 1}</p>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </CardContent></Card>
            </motion.div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="gap-2"><Trophy className="w-4 h-4" />Leaderboard</TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2"><Gift className="w-4 h-4" />Rewards</TabsTrigger>
            </TabsList>

            {/* LEADERBOARD */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div><CardTitle>City Leaderboard</CardTitle><CardDescription>Top contributors</CardDescription></div>
                        <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" />{leaderboard.length} participants</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No data yet — submit reports to appear here!</div>
                      ) : (
                        <div className="space-y-3">
                          {leaderboard.map((u, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                              className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${u.rank <= 3 ? "bg-gradient-to-r from-primary/10 to-transparent" : "bg-muted/50 hover:bg-muted"}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                u.rank === 1 ? "bg-yellow-500 text-white" : u.rank === 2 ? "bg-gray-400 text-white" : u.rank === 3 ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"
                              }`}>
                                {u.rank <= 3 ? (u.rank === 1 ? <Crown className="w-5 h-5" /> : <Medal className="w-5 h-5" />) : u.rank}
                              </div>
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.reports} reports</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{u.points.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">points</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Your Position</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <span className="text-3xl font-bold text-primary">#{myStats?.rank ?? "—"}</span>
                        </div>
                        <p className="font-semibold">{myStats?.name ?? user.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">{myStats?.points ?? 0} points</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>How to Earn</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { action: "Submit a report", points: "+10", icon: CheckCircle },
                        { action: "Verified report", points: "+10", icon: CheckCircle },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <item.icon className="w-5 h-5 text-primary" />
                          <span className="flex-1 text-sm">{item.action}</span>
                          <Badge variant="secondary">{item.points}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* REWARDS */}
            <TabsContent value="rewards">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Available Rewards</CardTitle><CardDescription>Redeem your points</CardDescription></div>
                    <Badge className="gap-1"><Trophy className="w-3 h-3" />{myStats?.points ?? 0} points available</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {rewards.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No rewards available at the moment.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rewards.map((reward, i) => (
                        <motion.div key={reward.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                          <Card className={`hover:shadow-lg transition-all ${!reward.available ? "opacity-50" : ""}`}>
                            <CardContent className="p-6 text-center">
                              <div className="text-5xl mb-4">{reward.icon}</div>
                              <h3 className="font-semibold mb-2">{reward.name}</h3>
                              <Badge variant="outline" className="mb-4">{reward.points_cost} points</Badge>
                              <Button className="w-full" disabled={!reward.available || (myStats?.points ?? 0) < reward.points_cost || redeemLoading === reward.id}
                                onClick={() => handleRedeem(reward)}>
                                {redeemLoading === reward.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                                 !reward.available ? "Out of Stock" :
                                 (myStats?.points ?? 0) < reward.points_cost ? `Need ${reward.points_cost - (myStats?.points ?? 0)} more` : "Redeem"}
                              </Button>
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
      <Footer />
    </div>
  );
}
