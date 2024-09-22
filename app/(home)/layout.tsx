import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Bottombar, LeftSidebar, Topbar } from "@/components/shared";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GitConnect | Social Network for Developers",
  description:"GitConnect allows developers to create a profile/portfolio, share posts, and get help from others. Features include developer profiles, posts, likes/dislikes, and discussions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://git-connect-6bro.vercel.app/",
    title: "GitConnect | Social Network for Developers",
    description:"GitConnect allows developers to create a profile/portfolio, share posts, and get help from others. Features include developer profiles, posts, likes/dislikes, and discussions.",
    siteName: "GitConnect",
    images: [
      {
        url: "https://git-connect-6bro.vercel.app/assets/icons/logo.svg",
        width: 1200,
        height: 630,
        alt: "GitConnect Social Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GitConnectDev",
    title: "GitConnect | Social Network for Developers",
    description:"Join GitConnect today to create your profile, share your posts, and engage with the developer community.",
  },
  themeColor: "#4a4aec",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="copyright" content="GitConnect" />
        <meta name="keywords" content="GitConnect, Web Developer, Frontend Developer, Backend Developer, Full Stack Developer, Software Engineer, JavaScript, React.js, Node.js, HTML, CSS, SEO, Portfolio"/>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta property="og:site_name" content="GitConnect | Social Network for Developers"/>
        <meta property="og:url" content="https://git-connect-6bro.vercel.app/"/>
        <meta property="og:type" content="website"/>
        <meta property="og:title" content="GitConnect | Social Network for Developers"/>
        <meta property="og:locale" content="en_US"/>
        <meta property="og:description" content="Join GitConnect today to create your profile, share your posts, and engage with the developer community."/>
        <link rel="canonical" href="https://git-connect-6bro.vercel.app/"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex h-screen">
          <QueryProvider>
            <AuthProvider>
              <div className="w-full md:flex">
                <Topbar />
                <LeftSidebar />
                <section className="flex flex-1 h-full">{children}</section>
                <Bottombar />
              </div>
            </AuthProvider>
          </QueryProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}