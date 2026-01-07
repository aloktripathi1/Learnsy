"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Play,
  BookOpen,
  Target,
  Zap,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Github,
  Menu,
  X,
  Sparkles,
  Award,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSignIn = () => {
    router.push("/sign-in")
  }

  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Transform YouTube playlists into organized courses with clear progress tracking and navigation.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your learning journey with completion stats, streak calendars, and detailed analytics.",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
    },
    {
      icon: Zap,
      title: "Distraction-Free",
      description: "Clean interface designed for focus, with note-taking, bookmarks, and keyboard shortcuts.",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-500",
    },
  ]

  const stats = [
    { icon: Users, label: "Active Learners", value: "100+" },
    { icon: Clock, label: "Hours Learned", value: "250+" },
    { icon: TrendingUp, label: "Completion Rate", value: "85%" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-lg">
                <Play className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Learn<span className="text-primary">sy</span>
              </span>
            </div>

            {/* Desktop Sign In */}
            <div className="hidden sm:block">
              <Button onClick={handleSignIn} size="lg" className="gap-2 touch-target shadow-lg hover:shadow-xl transition-all">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="touch-target"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t pt-4">
              <Button onClick={handleSignIn} className="w-full gap-2 touch-target">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 text-center relative">
        <div className="container">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Transform Your Learning Journey</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Learn Smarter with
              <span className="text-primary block mt-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                YouTube Playlists
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-5xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Transform any YouTube playlist into a structured learning experience. Track progress, take notes, and stay
              focused without distractions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Button onClick={handleSignIn} size="lg" className="gap-2 touch-target text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Hero Image/Mockup */}
            <div className="mt-16 relative animate-fade-in-up animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl p-1 shadow-2xl">
                <div className="bg-background/95 backdrop-blur rounded-xl p-6 sm:p-8 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-muted rounded-md h-6"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-3">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg h-32 sm:h-48 flex items-center justify-center">
                        <Play className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                      </div>
                      <div className="bg-muted rounded h-3"></div>
                      <div className="bg-muted rounded h-3 w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-muted rounded h-8"></div>
                      <div className="bg-muted rounded h-8"></div>
                      <div className="bg-muted rounded h-8"></div>
                      <div className="bg-muted rounded h-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 border-y bg-gradient-to-br from-muted/30 via-muted/20 to-transparent backdrop-blur">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24">
          <div className="container">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Everything you need to learn effectively
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Powerful features designed to enhance your learning experience and help you achieve your goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden relative hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardHeader className="text-center relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Built for serious learners */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center bg-gradient-to-br from-muted/50 via-muted/30 to-transparent rounded-3xl p-8 sm:p-12 border shadow-lg">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <Badge variant="outline" className="mb-4">Why Choose Learnsy</Badge>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                    Built for serious learners
                  </h3>
                  <p className="text-muted-foreground">
                    Take control of your learning journey with professional-grade tools
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur border hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Progress Tracking</div>
                      <div className="text-sm text-muted-foreground">
                        Visual progress indicators and completion statistics
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur border hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Smart Notes</div>
                      <div className="text-sm text-muted-foreground">
                        Take notes linked to specific videos and topics
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur border hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Bookmarks</div>
                      <div className="text-sm text-muted-foreground">
                        Save important moments for quick reference
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur border hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Keyboard Shortcuts</div>
                      <div className="text-sm text-muted-foreground">
                        Navigate efficiently with keyboard controls
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-3xl"></div>
                <div className="relative bg-background/95 backdrop-blur rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Course Progress</div>
                    <Badge variant="secondary" className="text-xs">75% Complete</Badge>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-xl p-6 mb-4 flex items-center justify-center h-40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                    <Play className="h-16 w-16 text-primary relative z-10" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Videos Completed</span>
                      <span className="font-semibold">12 of 16</span>
                    </div>
                    <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full w-3/4 shadow-lg"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground">Streak</div>
                        <div className="text-sm font-bold">7 days</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground">Hours</div>
                        <div className="text-sm font-bold">24.5</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground">Notes</div>
                        <div className="text-sm font-bold">18</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-1 shadow-2xl">
              <div className="relative bg-gradient-to-br from-primary/95 to-primary rounded-3xl py-16 sm:py-20 px-6 sm:px-12 text-center overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30 mb-6">
                    <Award className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">Join the Learning Revolution</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
                    Ready to transform your learning?
                  </h2>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto">
                    Join thousands of learners who have already improved their study habits with Learnsy.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      onClick={handleSignIn} 
                      size="lg" 
                      variant="secondary"
                      className="gap-2 touch-target text-base px-8 py-6 shadow-xl hover:shadow-2xl transition-all bg-white text-primary hover:bg-white/90"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 sm:py-16 text-center border-t mt-16 sm:mt-24 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2.5 rounded-xl shadow-lg">
                <Play className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">
                Learn<span className="text-primary">sy</span>
              </span>
            </div>
            
            <p className="text-muted-foreground mb-6 text-base">
              © 2025 Learnsy. Built for focused learning.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pb-4">
              <span>Made with</span>
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
              <span>by</span>
              <a
                href="https://github.com/aloktripathi1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors touch-target font-medium"
              >
                <Github className="h-4 w-4" />
                Alok Tripathi
              </a>
            </div>
          </div>
        </footer>
    </div>
  )
}
