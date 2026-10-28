import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import GroupMIFooter from "@/components/GroupMIFooter";
import AppSidebar from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import 'sweetalert2/dist/sweetalert2.min.css';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SIGMI - Système d'Information GROUP MI",
  description: "Système d'information centralisé multi-pôles pour GROUP MI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <GlobalHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          <GroupMIFooter />
        </Providers>
      </body>
    </html>
  );
}
