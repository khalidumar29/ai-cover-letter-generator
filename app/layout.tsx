import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator",
  description:
    "Create focused, editable cover letters from your resume and a job description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
