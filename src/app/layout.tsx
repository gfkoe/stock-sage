import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { SessionProvider } from "next-auth/react";
import { SubscriptionProvider } from "@/components/SubscriptionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const APP_NAME = "Stock Sage";
const APP_DEFAULT_TITLE = "Stock Sage";
const APP_TITLE_TEMPLATE = "%s - Stock Sage";
const APP_DESCRIPTION = "A simple app to track your stocks.";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "./manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    shortcut: "./favicon.ico",
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }], //make 180x180 at some point
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SubscriptionProvider>
              <Header text="Stock Sage" />
              {children}
              <SpeedInsights />
            </SubscriptionProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
