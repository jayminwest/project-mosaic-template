import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function HeroSection({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}: HeroSectionProps) {
  return (
    <section className="py-12 md:py-24 lg:py-32 xl:py-40 bg-background w-full">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              {description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={primaryButtonLink}>
              <Button size="lg">{primaryButtonText}</Button>
            </Link>
            {secondaryButtonText && secondaryButtonLink && (
              <Link href={secondaryButtonLink}>
                <Button variant="outline" size="lg">{secondaryButtonText}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
