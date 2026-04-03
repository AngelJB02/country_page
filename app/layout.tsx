import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Refugio Country Club | Eventos Exclusivos y Equitacion",
  description:
    "Descubre El Refugio, el espacio perfecto para bodas, eventos corporativos y clases de equitacion en un entorno natural unico. Celebraciones inolvidables rodeadas de naturaleza.",
  keywords: [
    "eventos",
    "bodas",
    "country club",
    "equitacion",
    "celebraciones",
    "corporativos",
    "naturaleza",
  ],
  openGraph: {
    title: "El Refugio Country Club",
    description: "Eventos unicos en un entorno natural exclusivo",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5A2B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
