import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "./ClientProvider";
import NotificationSocketProvider from "@/utils/socket/NotificationSocketProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | MetingSync',
    default: 'MetingSync',
  },
  description: "Schedule and manage your meetings efficiently",
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          <NotificationSocketProvider />
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
