import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Boss Made — Atlanta Couples Date Night",
  description:
    "The Gen-Z glassmorphic experience for Atlanta's best date nights. Live music, comedy, art, dancing, and vegetarian food — curated weekly.",
  openGraph: {
    title: "Boss Made — Atlanta Couples Date Night",
    description:
      "Curated Atlanta date nights: live music, comedy, art, dancing, and vegetarian food.",
    url: "https://bossmade-events.vercel.app",
    siteName: "Boss Made",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <div className="bg-blobs" aria-hidden="true">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>
        <div className="noise-bg" aria-hidden="true" />
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
