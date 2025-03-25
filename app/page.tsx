"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import { TestimonialSection } from "@/components/marketing/TestimonialSection";
import { useConfig } from "@/lib/config/useConfig";
import LoginForm from "@/components/LoginForm";

export default function LandingPage() {
  const { productConfig } = useConfig();
  
  // Feature section data
  const features = [
    {
      title: "AI-First Design",
      description: "Built with AI capabilities integrated from the ground up.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      )
    },
    {
      title: "Subscription Ready",
      description: "Complete Stripe integration with multiple pricing tiers.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      )
    },
    {
      title: "Secure Authentication",
      description: "Built-in authentication with email verification and social login.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      )
    },
    {
      title: "Email Integration",
      description: "Transactional emails with beautiful React Email templates.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      )
    },
    {
      title: "Fully Configurable",
      description: "Extensive configuration system for quick customization.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    },
    {
      title: "Responsive Design",
      description: "Beautiful UI that works perfectly on all devices.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z"
          />
        </svg>
      )
    }
  ];
  
  // Pricing section data
  const pricingTiers = [
    {
      name: "Free",
      description: "Get started with basic features",
      price: "$0",
      interval: "month",
      features: [
        { text: "Basic AI capabilities", included: true },
        { text: "10MB storage limit", included: true },
        { text: "Standard support", included: true },
        { text: "Advanced features", included: false },
        { text: "Priority support", included: false }
      ],
      buttonText: "Get Started",
      buttonLink: "/",
      buttonVariant: "outline"
    },
    {
      name: "Premium",
      description: "For professionals and small teams",
      price: "$9.99",
      interval: "month",
      features: [
        { text: "Advanced AI capabilities", included: true },
        { text: "50MB storage limit", included: true },
        { text: "Priority support", included: true },
        { text: "Unlimited exports", included: true },
        { text: "Team collaboration", included: false }
      ],
      buttonText: "Subscribe Now",
      buttonLink: "/",
      highlighted: true
    },
    {
      name: "Enterprise",
      description: "For larger teams and organizations",
      price: "$29.99",
      interval: "month",
      features: [
        { text: "Premium AI capabilities", included: true },
        { text: "Unlimited storage", included: true },
        { text: "24/7 dedicated support", included: true },
        { text: "Team collaboration features", included: true },
        { text: "Advanced analytics", included: true }
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      buttonVariant: "outline"
    }
  ];
  
  // Testimonial section data
  const testimonials = [
    {
      quote: "This template saved us weeks of development time. We were able to launch our product in record time.",
      author: "Sarah Johnson",
      role: "Founder",
      company: "TechStart"
    },
    {
      quote: "The AI integration is seamless and the subscription management just works. Highly recommended!",
      author: "Michael Chen",
      role: "CTO",
      company: "DataFlow"
    },
    {
      quote: "We've tried several templates, but Project Mosaic stands out with its clean code and thoughtful architecture.",
      author: "Emma Rodriguez",
      role: "Lead Developer",
      company: "CodeCraft"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection 
          title={productConfig?.name || "Project Mosaic"}
          description={productConfig?.description || "A powerful micro-SaaS template for building profitable products quickly."}
          primaryButtonText="Get Started"
          primaryButtonLink="/dashboard"
          secondaryButtonText="Learn More"
          secondaryButtonLink="#features"
        />
        
        {/* Features Section */}
        <FeatureSection 
          title="Key Features"
          description="Everything you need to build a successful micro-SaaS product"
          features={features}
        />
        
        {/* Pricing Section */}
        <PricingSection 
          title="Simple Pricing"
          description="Choose the plan that's right for you"
          tiers={pricingTiers}
        />
        
        {/* Testimonials Section */}
        <TestimonialSection 
          title="What Our Users Say"
          description="Don't just take our word for it - hear from some of our satisfied users"
          testimonials={testimonials}
        />
        
        {/* CTA Section */}
        <CTASection 
          title="Ready to Get Started?"
          description="Join thousands of users building successful micro-SaaS products with Project Mosaic."
          primaryButtonText="Sign Up Now"
          primaryButtonLink="/"
          secondaryButtonText="Contact Sales"
          secondaryButtonLink="/contact"
        />
        
        {/* Login Form Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6 max-w-md mx-auto">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold">Log In</h2>
                <p className="text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
