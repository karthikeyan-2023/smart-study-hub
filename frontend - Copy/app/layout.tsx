import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Head from "next/head";
import "./globals.css";
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Study Hub",
  description:
    "AI-powered learning assistant for students - Upload materials, ask questions, take quizzes",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2420" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className}`} suppressHydrationWarning>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove attributes injected by browser extensions that cause hydration mismatches
              document.querySelectorAll('[bis_skin_checked], [bis_register]').forEach(el => {
                el.removeAttribute('bis_skin_checked');
                el.removeAttribute('bis_register');
              });
            `,
          }}
        />
      </Head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
