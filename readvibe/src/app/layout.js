import { Suspense } from "react";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "../styles/globals.css";
import ReduxProvider from "../redux/provider";
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
  title: "ReadVibe — Find Your Next Read. Feel Your Next Vibe.",
  description: "Curated by feeling, powered by thoughtful AI. Track ongoing reads, explore emotional book matches, and generate 9:16 social story cards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${manrope.variable}`}>
      <body className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--rv-cream-paper)' }}>
        <ReduxProvider>
          <Suspense fallback={<div className="p-3 bg-white border-bottom">Loading...</div>}>
            <Navbar />
          </Suspense>
          <main className="flex-grow-1">
            <Suspense fallback={<div className="p-5 text-center">Loading page...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
