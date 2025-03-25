import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  interval: string;
  features: PricingFeature[];
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "outline";
  highlighted?: boolean;
}

interface PricingSectionProps {
  title: string;
  description: string;
  tiers: PricingTier[];
}

export function PricingSection({ title, description, tiers }: PricingSectionProps) {
  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{title}</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              {description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {tiers.map((tier, index) => (
            <div 
              key={index} 
              className={`flex flex-col p-6 bg-background border rounded-lg shadow-sm ${
                tier.highlighted ? "relative" : ""
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/{tier.interval}</span>
              </div>
              <ul className="mt-6 space-y-2">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-5 h-5 mr-2 ${
                        feature.included ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href={tier.buttonLink}>
                  <Button 
                    variant={tier.buttonVariant || "default"} 
                    className="w-full"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
