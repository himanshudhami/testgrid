import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Purchase Order App - TanStack DB Demo",
  description: "A high-performance purchase order management system powered by TanStack DB and React Data Grid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
