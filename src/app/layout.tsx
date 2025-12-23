import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  subsets: ["latin", "thai"],
  variable: "--font-sarabun",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Disaster Ops - ศูนย์บัญชาการตอบโต้ภัยพิบัติ",
  description: "ระบบจัดการศูนย์พักพิงและทรัพยากรภัยพิบัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sans`} style={{ fontFamily: 'var(--font-sarabun), sans-serif' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
