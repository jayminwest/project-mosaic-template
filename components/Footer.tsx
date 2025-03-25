import Link from "next/link";
import { useConfig } from "@/lib/config/useConfig";

const Footer = () => {
  const { productConfig } = useConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-lg font-semibold">{productConfig?.name || "Project Mosaic"}</div>
          <p className="text-sm text-muted-foreground mt-1">
            &copy; {currentYear} {productConfig?.name || "Project Mosaic"}. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
