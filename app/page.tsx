import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import { TestimonialSection } from "@/components/marketing/TestimonialSection";
import { Footer } from "@/components/Footer";
import { 
  Rocket, 
  Zap, 
  Shield, 
  BarChart, 
  Code, 
  Users 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-grow">
        <HeroSection
          title="Project Mosaic"
          description="A powerful framework for building micro-SaaS products quickly and efficiently. Launch your next product in days, not months."
          primaryButtonText="Get Started"
          primaryButtonLink="/login"
          secondaryButtonText="Learn More"
          secondaryButtonLink="#features"
        />
        
        <FeatureSection
          title="Why Choose Project Mosaic?"
          description="Built with modern technologies and best practices to help you launch faster."
          features={[
            {
              title: "Rapid Development",
              description: "Complete product cycles in 1-2 weeks per product with our pre-built components and services.",
              icon: <Rocket className="h-8 w-8" />
            },
            {
              title: "AI-First Design",
              description: "Leverage AI capabilities throughout your product with our provider-agnostic interfaces.",
              icon: <Zap className="h-8 w-8" />
            },
            {
              title: "Secure Authentication",
              description: "Built-in authentication with email, password, and social providers via Supabase.",
              icon: <Shield className="h-8 w-8" />
            },
            {
              title: "Analytics Ready",
              description: "Track user engagement and conversion with integrated analytics components.",
              icon: <BarChart className="h-8 w-8" />
            },
            {
              title: "Developer Friendly",
              description: "Clean architecture and comprehensive documentation optimized for AI assistance.",
              icon: <Code className="h-8 w-8" />
            },
            {
              title: "Subscription Management",
              description: "Complete subscription system with Stripe integration and usage tracking.",
              icon: <Users className="h-8 w-8" />
            }
          ]}
        />
        
        <PricingSection
          title="Simple, Transparent Pricing"
          description="Choose the plan that's right for your project."
          tiers={[
            {
              name: "Free",
              description: "For personal projects and experimentation",
              price: "$0",
              interval: "forever",
              features: [
                { text: "Basic AI capabilities", included: true },
                { text: "10 resources limit", included: true },
                { text: "5MB storage", included: true },
                { text: "Community support", included: true },
                { text: "Advanced AI features", included: false },
                { text: "Priority support", included: false }
              ],
              buttonText: "Get Started",
              buttonLink: "/login",
              buttonVariant: "outline"
            },
            {
              name: "Premium",
              description: "For professionals and growing businesses",
              price: "$9.99",
              interval: "per month",
              features: [
                { text: "Advanced AI capabilities", included: true },
                { text: "100 resources limit", included: true },
                { text: "50MB storage", included: true },
                { text: "Priority support", included: true },
                { text: "Custom domain", included: true },
                { text: "Team collaboration", included: false }
              ],
              buttonText: "Start Free Trial",
              buttonLink: "/login",
              buttonVariant: "default",
              highlighted: true
            },
            {
              name: "Enterprise",
              description: "For teams and organizations",
              price: "Contact us",
              interval: "custom pricing",
              features: [
                { text: "Premium AI capabilities", included: true },
                { text: "Unlimited resources", included: true },
                { text: "Unlimited storage", included: true },
                { text: "24/7 dedicated support", included: true },
                { text: "Custom domain", included: true },
                { text: "Team collaboration", included: true }
              ],
              buttonText: "Contact Sales",
              buttonLink: "/contact",
              buttonVariant: "outline"
            }
          ]}
        />
        
        <TestimonialSection
          title="What Our Users Say"
          description="Join hundreds of satisfied developers building with Project Mosaic."
          testimonials={[
            {
              quote: "Project Mosaic helped me launch my SaaS in just one week. The pre-built components and services saved me months of development time.",
              author: "Sarah Johnson",
              role: "Indie Developer",
              avatar: "https://i.pravatar.cc/100?img=1"
            },
            {
              quote: "The AI integration is seamless and the subscription management just works out of the box. Highly recommended for any micro-SaaS project.",
              author: "Michael Chen",
              role: "Startup Founder",
              avatar: "https://i.pravatar.cc/100?img=2"
            },
            {
              quote: "As a solo developer, Project Mosaic has been a game-changer. I can focus on my product's unique value instead of reinventing the wheel.",
              author: "Alex Rodriguez",
              role: "Product Engineer",
              avatar: "https://i.pravatar.cc/100?img=3"
            }
          ]}
        />
        
        <CTASection
          title="Ready to Build Your Next Product?"
          description="Get started with Project Mosaic today and launch faster than ever."
          primaryButtonText="Start Building"
          primaryButtonLink="/login"
          secondaryButtonText="View Documentation"
          secondaryButtonLink="/docs"
        />
      </div>
      
      <Footer />
    </div>
  );
}
