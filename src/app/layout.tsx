import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import GroupMIFooter from "@/components/GroupMIFooter";
import AppSidebar from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import 'sweetalert2/dist/sweetalert2.min.css';

export const metadata: Metadata = {
  title: "SIGMI - Système d'Information GROUP MI",
  description: "Système d'information centralisé multi-pôles pour GROUP MI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
