"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { 
  BookOpen, 
  Code, 
  Users, 
  Download, 
  ExternalLink, 
  Zap, 
  Palette, 
  Camera,
  Lightbulb,
  Github,
  Youtube,
  MessageCircle
} from "lucide-react"

const resourceCategories = [
  {
    id: "tutorials",
    title: "Tutorials & Guides",
    description: "Learn how to master Flux Kontext AI image generation",
    icon: BookOpen,
    resources: [
      {
        title: "Getting Started with Flux Kontext",
        description: "Complete beginner's guide to AI image generation",
        type: "Tutorial",
        link: "#",
        difficulty: "Beginner"
      },
      {
        title: "Advanced Prompt Engineering",
        description: "Master the art of crafting perfect prompts",
        type: "Guide",
        link: "#",
        difficulty: "Advanced"
      },
      {
        title: "Character Consistency Techniques",
        description: "Maintain character identity across generations",
        type: "Tutorial",
        link: "#",
        difficulty: "Intermediate"
      }
    ]
  },
  {
    id: "tools",
    title: "Developer Tools",
    description: "APIs, SDKs, and integration resources",
    icon: Code,
    resources: [
      {
        title: "Flux Kontext API Documentation",
        description: "Complete API reference and integration guide",
        type: "Documentation",
        link: "/resources/api",
        difficulty: "Developer"
      },
      {
        title: "Python SDK",
        description: "Official Python library for Flux Kontext",
        type: "SDK",
        link: "#",
        difficulty: "Developer"
      },
      {
        title: "ComfyUI Integration",
        description: "Use Flux Kontext with ComfyUI workflows",
        type: "Integration",
        link: "#",
        difficulty: "Intermediate"
      }
    ]
  },
  {
    id: "community",
    title: "Community Resources",
    description: "Connect with other AI artists and creators",
    icon: Users,
    resources: [
      {
        title: "Discord Community",
        description: "Join our active community of AI artists",
        type: "Community",
        link: "#",
        difficulty: "All Levels"
      },
      {
        title: "Prompt Library",
        description: "Curated collection of effective prompts",
        type: "Resource",
        link: "#",
        difficulty: "All Levels"
      },
      {
        title: "Showcase Gallery",
        description: "Inspiring creations from our community",
        type: "Gallery",
        link: "#",
        difficulty: "All Levels"
      }
    ]
  }
]

const featuredResources = [
  {
    title: "Flux Kontext Masterclass",
    description: "Comprehensive video course covering all aspects of AI image generation",
    image: "/placeholder-tutorial.jpg",
    duration: "4 hours",
    level: "All Levels",
    link: "#"
  },
  {
    title: "Style Transfer Guide",
    description: "Learn how to apply artistic styles to your AI-generated images",
    image: "/placeholder-style.jpg",
    duration: "45 min",
    level: "Intermediate",
    link: "#"
  },
  {
    title: "Commercial Use Best Practices",
    description: "Guidelines for using AI-generated images in commercial projects",
    image: "/placeholder-commercial.jpg",
    duration: "30 min",
    level: "Professional",
    link: "#"
  }
]

export function ResourcesContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="app-tint-badge inline-block mb-6 rounded-full px-4 py-2 text-sm">
            Free AI Image Generation Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Flux Kontext Resources Hub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to master AI image generation with Flux Kontext. 
            From beginner tutorials to advanced techniques and developer tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/generate" prefetch={true}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Zap className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
            </Link>
            <Link href="/resources/api" prefetch={true}>
              <Button variant="outline" size="lg" className="border-primary/20 bg-background/60 backdrop-blur-sm">
                <Code className="w-5 h-5 mr-2" />
                API Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="app-section-shell px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <div key={index} className="app-surface-card app-surface-card--interactive overflow-hidden rounded-2xl">
                <div className="aspect-video flex items-center justify-center bg-background/50">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="app-tint-badge rounded-full px-2 py-1 text-xs">
                      {resource.level}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {resource.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {resource.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Resource
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Browse by Category
          </h2>
          <div className="space-y-12">
            {resourceCategories.map((category) => (
              <div key={category.id} className="app-surface-card rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <div className="app-icon-surface mr-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.resources.map((resource, index) => (
                    <div key={index} className="app-surface-card app-surface-card--interactive rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                          {resource.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {resource.difficulty}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {resource.description}
                      </p>
                      <Link href={resource.link}>
                        <Button variant="ghost" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access Resource
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="app-section-shell px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="app-icon-surface mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Create your free Flux Kontext account
              </p>
            </div>
            <div className="text-center">
              <div className="app-icon-surface mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Learn Basics</h3>
              <p className="text-sm text-muted-foreground">
                Follow our beginner tutorials
              </p>
            </div>
            <div className="text-center">
              <div className="app-icon-surface mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Creating</h3>
              <p className="text-sm text-muted-foreground">
                Generate your first AI images
              </p>
            </div>
            <div className="text-center">
              <div className="app-icon-surface mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-2">Join Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other creators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with thousands of AI artists, share your creations, and learn from the best.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="app-surface-card app-surface-card--interactive rounded-2xl p-6 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Discord Server</h3>
              <p className="text-muted-foreground mb-4">
                Real-time chat, feedback, and collaboration with fellow creators.
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </Button>
            </div>
            <div className="app-surface-card app-surface-card--interactive rounded-2xl p-6 text-center">
              <Youtube className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">YouTube Channel</h3>
              <p className="text-muted-foreground mb-4">
                Video tutorials, tips, and showcases of amazing AI art.
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
            <div className="app-surface-card app-surface-card--interactive rounded-2xl p-6 text-center">
              <Github className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">GitHub</h3>
              <p className="text-muted-foreground mb-4">
                Open source tools, scripts, and community contributions.
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Repos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="app-cta-panel rounded-3xl px-6 py-12 text-center md:px-10">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to Start Creating?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of creators using Flux Kontext to bring their imagination to life.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/generate">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Palette className="mr-2 h-5 w-5" />
                  Start Creating Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-primary/20 bg-background/60 backdrop-blur-sm">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 
