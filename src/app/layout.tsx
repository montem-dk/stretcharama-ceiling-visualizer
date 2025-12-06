import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "Stretcharama Ceiling Visualizer",
  description: "AI-powered ceiling design visualizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
