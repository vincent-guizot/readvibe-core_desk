import { Suspense } from "react";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "ReadVibe — Temukan Buku Sesuai Suasana Hatimu & Vibe Card Generator",
  description: "Platform pembaca modern dengan kurasi AI emosional, kartu estetik 9:16 untuk media sosial, dan smart wishlist.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${dmSerif.variable} ${manrope.variable}`}>
      <body className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--rv-cream-paper)' }}>
        <Suspense fallback={<div className="p-3 bg-white border-bottom">Memuat...</div>}>
          <Navbar />
        </Suspense>
        <main className="flex-grow-1">
          <Suspense fallback={<div className="p-5 text-center">Memuat halaman...</div>}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
