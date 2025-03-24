import { useConfig } from "@/lib/config/useConfig";

const Footer = () => {
  const { productConfig } = useConfig();
  
  return (
    <footer className="bg-transparent text-white py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        {productConfig?.name || "Project Mosaic"} - Part of Project Mosaic 🧩
      </div>
    </footer>
  );
};

export default Footer;
