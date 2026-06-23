import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rate My Stock — Find Your Stock Match",
  description: "AI matches your personality, vibe, and financial habits to the perfect stock. Not financial advice, just vibes.",
  openGraph: {
    title: "Rate My Stock 📈",
    description: "What stock are you? Find out in 30 seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
