import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrantSetu AI - Government Grant & NGO Audit Escrow Platform",
  description:
    "AI-Powered Scheme Matching, EXIF Field Audits, and CAG-Compliant CSR-2 Reporting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {/* GLOBAL EXECUTIVE NAVBAR */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center bg-cover justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              G
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                GrantSetu<span className="text-indigo-400">.AI</span>
              </span>
              <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                Govt-NGO Portal v2.6
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#matching"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden md:inline-block"
            >
              Scheme Matcher
            </a>
            <a
              href="#audit"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden md:inline-block"
            >
              EXIF Audit Engine
            </a>
            <a
              href="#geomap"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden md:inline-block"
            >
              Geo-Spatial Map
            </a>
            <a
              href="/api/pdf"
              target="_blank"
              download="Form_CSR2_Compliance.pdf"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>📄</span> Export CSR-2 PDF
            </a>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
