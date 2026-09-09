import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export const metadata: Metadata = {
  title: "ElmurtadhosPortfolio | Portofolio Desainer Multidisiplin & Visual Artist",
  description:
    "Portofolio interaktif desainer multidisiplin, UI/UX, video editor, dan 3D visual artist dengan sentuhan visual dinamis dan elegan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#070f0b] text-[#ecfdf5] min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative">
        {/* Animated Interactive Dark Mint Background */}
        <AnimatedBackground />

        <PortfolioProvider>
          <Navbar />
          <div className="relative z-10 flex-1 flex flex-col w-full">
            {children}
          </div>
          <Footer />
        </PortfolioProvider>
      </body>
    </html>
  );
}
