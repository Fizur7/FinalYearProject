"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Camera,
  Mic,
  MapPin,
  Zap,
  BarChart3,
  Trophy,
  ArrowRight,
  Check,
  Leaf,
  Recycle,
  AlertTriangle,
  Trash2,
  Brain,
  Route,
  Users,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Multi-Modal Reporting",
    description: "Report overflowing bins using images, text, or voice input for maximum accessibility.",
  },
  {
    icon: Brain,
    title: "YOLOv8 AI Detection",
    description: "Advanced deep learning model classifies waste types with 93.1% accuracy in real-time.",
  },
  {
    icon: Route,
    title: "Smart Task Assignment",
    description: "Geolocation-based routing assigns reports to nearest collection units in ~28 seconds.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Municipal authorities get live visualization of reports, status, and performance metrics.",
  },
  {
    icon: MapPin,
    title: "Predictive Analytics",
    description: "AI-powered heatmaps identify high-density waste zones with 88% accuracy.",
  },
  {
    icon: Trophy,
    title: "Citizen Rewards",
    description: "Gamification system rewards validated reports to encourage community participation.",
  },
];

const wasteTypes = [
  { name: "Organic", icon: Leaf, color: "bg-green-500", accuracy: "94.8%" },
  { name: "Recyclable", icon: Recycle, color: "bg-blue-500", accuracy: "93.2%" },
  { name: "Hazardous", icon: AlertTriangle, color: "bg-orange-500", accuracy: "90.8%" },
  { name: "General", icon: Trash2, color: "bg-gray-500", accuracy: "93.7%" },
];

const stats = [
  { value: "93.1%", label: "Classification Accuracy", icon: Target },
  { value: "28.4s", label: "Avg. Response Time", icon: Clock },
  { value: "87%", label: "Validation Rate", icon: Check },
  { value: "88%", label: "Predictive Accuracy", icon: TrendingUp },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="secondary" className="gap-2">
                <Zap className="w-3 h-3" />
                Powered by YOLOv8 Deep Learning
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                AI-Driven Urban{" "}
                <span className="text-gradient">Waste Management</span>{" "}
                Platform
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Transform your city&apos;s waste management with AI-powered detection,
                real-time tracking, and citizen engagement. Report overflowing bins
                and watch as our system automatically routes collection units for
                timely cleanup.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/report">
                  <Button size="lg" className="gap-2">
                    Report Waste Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2">
                    View Dashboard
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl rotate-6" />
                <div className="absolute inset-0 glass-card rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=600&fit=crop"
                    alt="Smart Waste Management"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass-card rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">AI Detection Active</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </div>
                      <div className="flex gap-2">
                        {wasteTypes.map((type, i) => (
                          <div key={i} className={`${type.color} px-2 py-1 rounded text-xs text-white`}>
                            {type.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 glass-card rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">YOLOv8</p>
                      <p className="font-semibold text-sm">93.1% Accuracy</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Response</p>
                      <p className="font-semibold text-sm">28.4 seconds</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Performance Metrics</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Proven Results in Urban Environments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform delivers exceptional accuracy and speed, validated
              through extensive testing with 5,000+ urban waste images.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete Waste Management Solution
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From citizen reporting to AI classification and municipal coordination,
              our platform covers every aspect of modern waste management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">AI Classification</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              YOLOv8 Waste Detection & Classification
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our deep learning model accurately identifies and classifies waste into
              four categories, enabling efficient segregation and collection.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wasteTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`${type.color} p-4`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{type.name} Waste</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">F1-Score</span>
                      <Badge variant="secondary">{type.accuracy}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple Reporting Process
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Camera, title: "Capture", desc: "Take a photo of the overflowing bin" },
              { icon: Brain, title: "AI Analysis", desc: "YOLOv8 detects and classifies waste" },
              { icon: MapPin, title: "Geolocation", desc: "Nearest collection unit assigned" },
              { icon: Check, title: "Resolution", desc: "Track progress until cleanup" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Join the Clean City Movement
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Be part of the solution. Report overflowing bins, earn rewards, and help
              create cleaner, healthier urban environments for everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Users className="w-4 h-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/report">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white text-white hover:bg-white/10">
                  <Camera className="w-4 h-4" />
                  Report Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
