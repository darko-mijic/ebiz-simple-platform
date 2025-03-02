"use client";

import { Button } from "../components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart3, Calendar, FileText, PieChart, Shield, Users } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Financial Analytics",
    description: "Get real-time insights into your business finances with interactive dashboards and reports."
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Automatically process invoices and receipts with AI-powered document recognition."
  },
  {
    icon: PieChart,
    title: "Cash Flow Management",
    description: "Track incoming and outgoing transactions across all your bank accounts in one place."
  },
  {
    icon: Shield,
    title: "Compliant & Secure",
    description: "EU-compliant financial data handling with bank-level encryption and security."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Collaborate with your accountant and team members with customizable access controls."
  },
  {
    icon: Calendar,
    title: "Tax Preparation",
    description: "Prepare for tax season easily with automated categorization and reporting."
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EBIZ-Saas</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">Testimonials</Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/auth">
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth?register=true">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl">
            Financial Management Platform for European SMBs
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Automate your financial processes, gain real-time insights, and stay compliant with EU regulations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/auth?register=true">
                Start Your Free 30-Day Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl w-full">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-muted-foreground">European Businesses</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-bold text-primary mb-2">€10M+</p>
              <p className="text-muted-foreground">Transactions Processed</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-muted-foreground">Uptime Reliability</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to streamline financial operations for small to medium-sized businesses across the EU.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
                <div className="p-2 rounded-full bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Financial Operations?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join hundreds of businesses that use EBIZ-Saas to streamline their financial processes and make data-driven decisions.
          </p>
          <Button size="lg" variant="secondary" className="font-semibold" asChild>
            <Link href="/auth?register=true">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-12 bg-muted/40">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <PieChart className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">EBIZ-Saas</span>
            </div>
            <div className="flex flex-wrap gap-8 justify-center">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EBIZ-Saas. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 