import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Clé du Mémoire — Accompagnement académique premium au Sénégal",
  description: "Clé du Mémoire accompagne les étudiants du supérieur au Sénégal dans la rédaction de leur mémoire. Coaching personnalisé, suivi professionnel, réussite garantie.",
  keywords: ["mémoire", "sénégal", "accompagnement académique", "rédaction mémoire", "soutenance", "coaching étudiant"],
  openGraph: {
    title: "Clé du Mémoire — Votre clé vers la réussite académique",
    description: "Plateforme d'accompagnement académique premium pour les étudiants du supérieur au Sénégal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1a1a2e', color: '#fff', fontSize: '14px', fontWeight: '500' } }} />
      </body>
    </html>
  );
}
