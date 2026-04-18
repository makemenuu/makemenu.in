import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata = {
  title: "MakeMenu – QR Code Ordering System for Restaurants",
  description:
    "Create digital menus and accept QR-based orders instantly. Perfect for restaurants, cafés, and food stalls.",
  keywords: [
    "QR menu",
    "restaurant ordering system",
    "digital menu",
    "QR ordering",
    "contactless menu",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased page-fade`}>
        {children}
      </body>
    </html>
  );
}