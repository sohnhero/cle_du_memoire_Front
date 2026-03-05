import type { Metadata } from "next";
import { Poppins, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cledumemoire.com"),
  title: {
    default: "Clé du Mémoire",
    template: "%s | Clé du Mémoire"
  },
  description: "Clé du Mémoire accompagne les étudiants du supérieur au Sénégal dans la rédaction de leur mémoire. Coaching personnalisé, suivi professionnel et réussite académique garantie.",
  keywords: [
    "mémoire de fin d'études", "accompagnement mémoire Sénégal", "coaching académique Dakar",
    "rédaction mémoire", "aide soutenance", "correction mémoire Sénégal", "thèse Sénégal",
    "UCAD mémoire", "coaching étudiant Sénégal", "Clé du Mémoire"
  ],
  authors: [{ name: "Clé du Mémoire Team" }],
  creator: "Clé du Mémoire",
  publisher: "Clé du Mémoire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Clé du Mémoire — Votre clé vers la réussite académique",
    description: "Plateforme d'accompagnement académique premium pour les étudiants du supérieur au Sénégal. Réussissez votre mémoire avec un expert dédié.",
    url: "https://www.cledumemoire.com",
    siteName: "Clé du Mémoire",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 800,
        height: 800,
        alt: "Logo Clé du Mémoire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clé du Mémoire — Accompagnement académique premium",
    description: "Réussissez votre mémoire au Sénégal avec un accompagnement expert personnalisé.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`scroll-smooth ${poppins.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className={poppins.className}>
        <AuthProvider>
          <MaintenanceGuard>
            {children}
          </MaintenanceGuard>
        </AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1a1a2e', color: '#fff', fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-poppins)' } }} />
      </body>
    </html>
  );
}


