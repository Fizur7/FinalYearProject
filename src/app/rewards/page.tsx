"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Target,
  Award,
  Zap,
  Clock,
  CheckCircle,
  Leaf,
  MapPin,
  ChevronRight,
} from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Priya Sharma", points: 2450, reports: 245, badge: "Eco Champion", avatar: "PS" },
  { rank: 2, name: "Rahul Kumar", points: 2180, reports: 218, badge: "Green Warrior", avatar: "RK" },
  { rank: 3, name: "Anita Devi", points: 1950, reports: 195, badge: "Clean Hero", avatar: "AD" },
  { rank: 4, name: "Vijay Singh", points: 1720, reports: 172, badge: "Eco Star", avatar: "VS" },
  { rank: 5, name: "Meena Patel", points: 1580, reports: 158, badge: "Green Guardian", avatar: "MP" },
  { rank: 6, name: "Suresh Reddy", points: 1420, reports: 142, badge: "Eco Ranger", avatar: "SR" },
  { rank: 7, name: "Lakshmi Nair", points: 1350, reports: 135, badge: "Clean Crusader", avatar: "LN" },
  { rank: 8, name: "Amit Joshi", points: 1280, reports: 128, badge: "Eco Scout", avatar: "AJ" },
];

const rewards = [
  { id: 1, name: "Movie Ticket", points: 500, icon: "🎬", available: true },
  { id: 2, name: "Coffee Voucher", points: 200, icon: "☕", available: true },
  { id: 3, name: "Bus Pass (1 Week)", points: 750, icon: "🚌", available: true },
  { id: 4, name: "Shopping Voucher", points: 1000, icon: "🛍️", available: true },
  { id: 5, name: "Eco T-Shirt", points: 300, icon: "👕", available: false },
  { id: 6, name: "Plant Sapling", points: 150, icon: "🌱", available: true },
];

const achievements = [
  { name: "First Report", description: "Submit your first waste report", icon: Star, unlocked: true, progress: 100 },
  { name: "Streak Master", description: "Report for 7 consecutive days", icon: Zap, unlocked: true, progress: 100 },
  { name: "Eco Warrior", description: "Submit 50 verified reports", icon: Medal, unlocked: false, progress: 72 },
  { name: "Community Hero", description: "Earn 1000 points total", icon: Crown, unlocked: false, progress: 85 },
  { name: "Speed Reporter", description: "Submit 5 reports in one day", icon: Clock, unlocked: true, progress: 100 },
  { name: "Zone Champion", description: "Be top reporter in your zone", icon: MapPin, unlocked: false, progress: 45 },
];

const userStats = {
  name: "John Doe",
  rank: 24,
  points: 850,
  totalReports: 85,
  validatedReports: 74,
  validationRate: 87,
  currentStreak: 5,
  bestStreak: 12,
  level: 8,
  levelProgress: 65,
  nextLevelPoints: 200,
};

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge variant="secondary" className="mb-4">Citizen Rewards</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Earn Points, Get Rewards
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Submit verified waste reports to earn points and unlock exciting rewards.
              Compete with fellow citizens on the leaderboard!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8" />
                    <Badge variant="secondary">Rank #{userStats.rank}</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{userStats.points}</p>
                  <p className="text-sm opacity-90">Total Points</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <Badge variant="outline">{userStats.validationRate}%</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{userStats.validatedReports}</p>
                  <p className="text-sm text-muted-foreground">Verified Reports</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-orange-500" />
                    <Badge variant="outline">Best: {userStats.bestStreak}</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{userStats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <Badge variant="outline">{userStats.nextLevelPoints} to go</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">Level {userStats.level}</p>
                  <Progress value={userStats.levelProgress} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2">
                <Gift className="w-4 h-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="w-4 h-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>City Leaderboard</CardTitle>
                          <CardDescription>Top contributors this month</CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Users className="w-3 h-3" />
                          1,247 participants
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaderboard.map((user, i) => (
                          <motion.div
                            key={user.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                              user.rank <= 3 ? "bg-gradient-to-r from-primary/10 to-transparent" : "bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              user.rank === 1 ? "bg-yellow-500 text-white" :
                              user.rank === 2 ? "bg-gray-400 text-white" :
                              user.rank === 3 ? "bg-orange-600 text-white" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {user.rank <= 3 ? (
                                user.rank === 1 ? <Crown className="w-5 h-5" /> :
                                <Medal className="w-5 h-5" />
                              ) : (
                                user.rank
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                              {user.avatar}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{user.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">{user.badge}</Badge>
                                <span className="text-xs text-muted-foreground">{user.reports} reports</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{user.points.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <span className="text-3xl font-bold text-primary">#{userStats.rank}</span>
                        </div>
                        <p className="font-semibold">{userStats.name}</p>
                        <p className="text-sm text-muted-foreground mb-4">{userStats.points} points</p>
                        <div className="text-xs text-muted-foreground">
                          <span className="text-primary font-medium">150 points</span> to reach #{userStats.rank - 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>How to Earn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { action: "Submit a report", points: "+5", icon: Leaf },
                        { action: "Verified report", points: "+10", icon: CheckCircle },
                        { action: "Daily streak bonus", points: "+15", icon: Zap },
                        { action: "First report of day", points: "+5", icon: Star },
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

            <TabsContent value="rewards">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Available Rewards</CardTitle>
                      <CardDescription>Redeem your points for exciting rewards</CardDescription>
                    </div>
                    <Badge className="gap-1">
                      <Trophy className="w-3 h-3" />
                      {userStats.points} points available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map((reward, i) => (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className={`hover:shadow-lg transition-all ${
                          !reward.available && "opacity-50"
                        }`}>
                          <CardContent className="p-6 text-center">
                            <div className="text-5xl mb-4">{reward.icon}</div>
                            <h3 className="font-semibold mb-2">{reward.name}</h3>
                            <Badge variant="outline" className="mb-4">{reward.points} points</Badge>
                            <Button
                              className="w-full"
                              disabled={!reward.available || userStats.points < reward.points}
                            >
                              {!reward.available ? "Out of Stock" :
                               userStats.points < reward.points ? `Need ${reward.points - userStats.points} more` :
                               "Redeem"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Achievements</CardTitle>
                      <CardDescription>Unlock badges by completing challenges</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className={`${!achievement.unlocked && "opacity-60"}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                <achievement.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{achievement.name}</h3>
                                  {achievement.unlocked && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                                <Progress value={achievement.progress} className="h-1.5" />
                                <p className="text-xs text-muted-foreground mt-1">{achievement.progress}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
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
