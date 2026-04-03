import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Profilia",
  description: "Miroir de personnalité à partir de conversations exportées"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
