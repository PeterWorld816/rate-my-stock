import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "주식 배우기 — 게임처럼 재밌게",
  description: "하루 5분, 퀴즈와 AI 매칭으로 배우는 주식 투자 기초. 무료, 재밌게, 쉽게.",
  openGraph: {
    title: "주식 배우기 📈",
    description: "Duolingo처럼 재밌게 배우는 주식 교육",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#F5F5F0]" style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
