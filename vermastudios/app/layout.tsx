import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./components/ClientLayoutWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verma Studio | Premium Photography",
  description: "Capturing timeless moments with artistry and precision. Professional photography services for weddings, events, portraits, and commercial shoots.",
  keywords: "photography, studio, wedding, events, portraits, commercial, professional photographer",
  openGraph: {
    title: "Verma Studio | Premium Photography",
    description: "Capturing timeless moments with artistry and precision.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} data-scroll-behavior="smooth">
      <body
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
