import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useConfig } from "@/lib/config/useConfig";

const Header = () => {
  const { productConfig } = useConfig();
  
  return (
    <header className="bg-transparent text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/"} className="text-xl font-bold">
          {productConfig?.name || "Project Mosaic"}
        </Link>

        <Link href="/profile">
          <UserCircle className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
