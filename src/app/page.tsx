'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, GraduationCap, Users, ChatCircle as MessageCircle, CaretRight as ChevronRight,
  Star, List as Menu, X, ShieldCheck as Shield, Medal as Award, Target, TrendUp as TrendingUp, FileText,
  Heart, ChartBar as BarChart3, PaperPlaneRight as Send, Quotes as Quote, ArrowRight, CheckCircle, Clock, EnvelopeSimple as Mail, MapPin, Phone, Lightning as Zap, Check, Sparkle as Sparkles,
  FacebookLogo, InstagramLogo, XLogo, TiktokLogo as TikTokLogo, LinkedinLogo, YoutubeLogo, ArrowUp, CaretDown
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

// ==================== SEO STRUCTURED DATA ====================
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.cledumemoire.com/#organization",
      "name": "Clé du Mémoire",
      "url": "https://www.cledumemoire.com",
      "logo": "https://www.cledumemoire.com/favicon.png",
      "description": "Plateforme d'accompagnement académique premium pour la rédaction de mémoire au Sénégal.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dakar",
        "addressCountry": "SN"
      },
      "sameAs": [
        "https://linkedin.com/company/cle-du-memoire",
        "https://instagram.com/cle_du_memoire"
      ]
    },
    {
      "@type": "ProfessionalService",
      "name": "Coaching de mémoire Clé du Mémoire",
      "image": "https://www.cledumemoire.com/hero-graduate.png",
      "description": "Accompagnement personnalisé pour le choix du sujet, la rédaction et la soutenance de mémoires au Sénégal.",
      "provider": { "@id": "https://www.cledumemoire.com/#organization" },
      "priceRange": "$$"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment se déroule l'accompagnement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accompagnement est personnalisé et se déroule étape par étape, du choix du sujet à la préparation de la soutenance avec un coach dédié."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont les tarifs pour un mémoire ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nous proposons plusieurs packs allant de 50 000 FCFA à 150 000 FCFA selon le niveau d'accompagnement souhaité."
          }
        }
      ]
    }
  ]
};

const CustomFacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 320 512" fill="currentColor" className={`w-5 h-5 origin-center ${className || ''}`} style={{ transform: 'scale(1.3) translateY(18%)' }}>
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
  </svg>
);

const CustomLinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 448 512" fill="currentColor" className={`w-5 h-5 origin-center ${className || ''}`} style={{ transform: 'scale(1.15)' }}>
    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
  </svg>
);

const SenegalFlag = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 900 600" className={`w-5 h-auto rounded-[2px] shadow-sm ${className || ''}`}>
    <rect width="300" height="600" fill="#00853f" />
    <rect width="300" height="600" x="300" fill="#fdef42" />
    <rect width="300" height="600" x="600" fill="#e31b23" />
    <polygon points="450,222 485,330 393,263 507,263 415,330" fill="#00853f" />
  </svg>
);


// ==================== SOCIAL FAN ====================
function SocialFanLink({ settings, isMobile = false }: { settings: any, isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const platforms = [
    { id: 'facebook', Icon: CustomFacebookIcon, url: settings.facebookUrl, color: '#1877F2' },
    { id: 'instagram', Icon: InstagramLogo, url: settings.instagramUrl, color: '#E4405F' },
    { id: 'linkedin', Icon: CustomLinkedinIcon, url: settings.linkedinUrl, color: '#0A66C2' },
    { id: 'twitter', Icon: XLogo, url: settings.twitterUrl, color: '#000000' },
    { id: 'tiktok', Icon: TikTokLogo, url: settings.tiktokUrl, color: '#000000' },
    { id: 'youtube', Icon: YoutubeLogo, url: settings.youtubeUrl, color: '#FF0000' },
  ].filter(p => p.url && p.url !== '#');

  if (platforms.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5 ${isOpen
          ? 'text-accent bg-accent/10 ring-1 ring-accent/20'
          : 'text-text-secondary hover:text-primary hover:bg-bg-light'
          }`}
      >
        Réseaux
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <CaretDown className="w-3.5 h-3.5" weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[-1] cursor-default bg-black/[0.02] backdrop-blur-[1px]"
            />
            <div className={`absolute top-full left-1/2 -translate-x-1/2 ${isMobile ? 'mt-10' : 'mt-4'} pt-4`}>
              {platforms.map((p, idx) => {
                const total = platforms.length;
                const radius = isMobile ? 85 : 110;
                const startAngle = 30; // More closed fan for tighter look
                const endAngle = 150;
                const angle = total === 1 ? 90 : startAngle + (idx * (endAngle - startAngle) / (total - 1));
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <motion.a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: -45 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: x,
                      y: y,
                      rotate: 0
                    }}
                    exit={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 45 }}
                    whileHover={{ scale: 1.1, y: y - 5 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 250,
                      delay: idx * 0.04
                    }}
                    className="absolute top-0 left-0 -ml-6 -mt-6 w-12 h-12 rounded-full bg-white backdrop-blur-md shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15),0_10px_15px_-5px_rgba(0,0,0,0.05)] flex items-center justify-center text-primary group hover:bg-white border border-white/40 ring-1 ring-black/[0.03] transition-colors overflow-hidden"
                    title={p.id}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p.Icon
                      className="w-5 h-5 transition-all duration-300 group-hover:scale-110"
                      style={{ color: 'inherit' }}
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                      style={{ backgroundColor: p.color }}
                    />
                  </motion.a>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== NAVBAR ====================
function Navbar() {
  const { settings } = useGlobalSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section
      const sections = ['services', 'packs', 'testimonials', 'contact'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is near or above the top of the viewport, 
          // and the bottom is below the top of the viewport
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
            break;
          }
        }
      }

      // If we are at the very top, clear active section
      if (window.scrollY < 100) {
        current = '';
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Tarifs', href: '#packs' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-border/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center"
          >
            <Logo className="w-36 h-auto mt-1" variant="full" monochrome={false} />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative overflow-hidden group ${isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-accent hover:bg-accent/10'
                    }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Subtle active/hover bottom indicator */}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </a>
              );
            })}
            <SocialFanLink settings={settings} />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-200"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-accent text-primary px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-accent-dark transition-all duration-200 shadow-sm"
            >
              Commencer
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-primary hover:bg-bg-light transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-border/50"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-text-secondary hover:text-accent hover:bg-accent/10'
                      }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="pt-2 pb-2">
                <SocialFanLink settings={settings} isMobile />
              </div>
              <div className="pt-3 space-y-2 border-t border-border/50 mt-3">
                <Link href="/login" className="block px-4 py-2.5 text-center rounded-lg text-primary text-sm font-medium">
                  Connexion
                </Link>
                <Link href="/register" className="block px-4 py-2.5 text-center rounded-lg bg-accent text-primary text-sm font-semibold">
                  Commencer
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ==================== HERO ====================
function Hero() {
  const { settings } = useGlobalSettings();
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-primary" />

      {/* Subtle gradient orbs */}
      {/* <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" /> */}

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Graduate Image — Positioned absolutely, bleeding from right edge */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block absolute right-0 bottom-0 w-[55%] h-full pointer-events-none"
      >
        {/* The image with CSS mask to blend edges into the dark bg */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 80%, transparent 100%), linear-gradient(to top, transparent 0%, black 20%, black 100%)',
            maskComposite: 'intersect',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 80%, transparent 100%), linear-gradient(to top, transparent 0%, black 20%, black 100%)',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <img
            src="/hero-graduate.png"
            alt="Étudiante diplômée - Clé du Mémoire Sénégal"
            className="absolute bottom-0 right-[20%] h-[90%] w-auto object-contain object-bottom opacity-90 hover:opacity-100 scale-[1.2] transition-all duration-500"
          />
        </div>

        {/* Confetti around the image */}
        {[
          // Gold/Yellow confetti
          { top: '8%', left: '15%', delay: 0, w: 'w-3', h: 'h-3', color: 'bg-accent', round: true },
          { top: '12%', left: '55%', delay: 0.3, w: 'w-2', h: 'h-4', color: 'bg-accent', round: false },
          { top: '22%', left: '75%', delay: 0.8, w: 'w-3', h: 'h-2', color: 'bg-accent/90', round: false },
          { top: '32%', left: '25%', delay: 1.2, w: 'w-2.5', h: 'h-2.5', color: 'bg-accent', round: true },
          { top: '50%', left: '85%', delay: 0.5, w: 'w-2', h: 'h-3', color: 'bg-accent/80', round: false },
          { top: '65%', left: '18%', delay: 1.8, w: 'w-3', h: 'h-2', color: 'bg-accent', round: false },
          { top: '18%', left: '42%', delay: 2.1, w: 'w-2', h: 'h-2', color: 'bg-accent/70', round: true },
          // Blue confetti
          { top: '15%', left: '88%', delay: 0.4, w: 'w-2.5', h: 'h-1.5', color: 'bg-info', round: false },
          { top: '38%', left: '70%', delay: 1.5, w: 'w-2', h: 'h-2', color: 'bg-info/80', round: true },
          { top: '55%', left: '35%', delay: 0.9, w: 'w-3', h: 'h-1.5', color: 'bg-info/70', round: false },
          { top: '28%', left: '12%', delay: 2.3, w: 'w-2', h: 'h-3', color: 'bg-info', round: false },
          { top: '10%', left: '35%', delay: 0.6, w: 'w-2', h: 'h-2', color: 'bg-info-light', round: true },
          { top: '42%', left: '90%', delay: 1.0, w: 'w-2.5', h: 'h-1.5', color: 'bg-info/60', round: false },
          { top: '58%', left: '50%', delay: 1.7, w: 'w-2', h: 'h-3', color: 'bg-info-light/70', round: false },
          // White confetti
          { top: '20%', left: '60%', delay: 0.2, w: 'w-1.5', h: 'h-1.5', color: 'bg-white/50', round: true },
          { top: '35%', left: '45%', delay: 1.3, w: 'w-2', h: 'h-1', color: 'bg-white/40', round: false },
          { top: '48%', left: '22%', delay: 0.7, w: 'w-1.5', h: 'h-3', color: 'bg-white/30', round: false },
          { top: '60%', left: '65%', delay: 2.0, w: 'w-2', h: 'h-2', color: 'bg-white/40', round: true },
          { top: '25%', left: '92%', delay: 1.1, w: 'w-1.5', h: 'h-1.5', color: 'bg-white/50', round: true },
          { top: '70%', left: '80%', delay: 0.1, w: 'w-2', h: 'h-1.5', color: 'bg-white/30', round: false },
        ].map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.w} ${p.h} ${p.color} ${p.round ? 'rounded-full' : 'rounded-sm'}`}
            style={{ top: p.top, left: p.left }}
            animate={{
              y: [0, -20, 5, -10, 0],
              x: [0, 5, -5, 3, 0],
              opacity: [0.5, 1, 0.7, 1, 0.5],
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.1, 0.9, 1.05, 1],
            }}
            transition={{
              duration: 4 + (i % 5) * 0.8,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] mb-8 font-title"
          >
            <SenegalFlag className="shrink-0" />
            Plateforme N°1 au Sénégal
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold text-white leading-[1.1] sm:leading-[1.05] tracking-tight mb-6">
            Réussissez votre
            <br />
            <span className="text-accent">mémoire</span> avec
            <br />
            un expert dédié
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-xl mb-10 leading-relaxed font-light">
            Accompagnement personnalisé du choix du sujet à la soutenance.
            Plus de 50 étudiants nous font déjà confiance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/register" className="btn-liquid py-3 px-8 text-sm">
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#services" className="btn-outline py-3 px-8 text-sm">
              Découvrir nos services
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10">
            {[
              { value: '50+', label: 'Étudiants' },
              { value: '100%', label: 'Réussite' },
              { value: '5', label: 'Sur 5 ★' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60 mt-0.5 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wave separator */}
      <div className="absolute -bottom-[2px] left-0 right-0 z-20">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 100L48 90C96 80 192 60 288 50C384 40 480 40 576 45C672 50 768 60 864 65C960 70 1056 70 1152 62.5C1248 55 1344 40 1392 32.5L1440 25V100H0Z" fill="#FAFBFC" />
        </svg>
      </div>
    </section>
  );
}

// ==================== SERVICES ====================
function Services() {
  const services = [
    {
      num: '01',
      icon: Target,
      title: 'Choix du Sujet',
      description: 'Aide personnalisée pour trouver un sujet pertinent et original, en adéquation avec votre parcours.',
      span: 'lg:col-span-1',
    },
    {
      num: '02',
      icon: FileText,
      title: 'Rédaction Accompagnée',
      description: 'Suivi chapitre par chapitre avec relecture, corrections structurelles et mise en forme académique.',
      span: 'lg:col-span-1',
    },
    {
      num: '03',
      icon: BarChart3,
      title: 'Méthodologie',
      description: 'Cadrage méthodologique, problématique, revue de littérature et analyse des données.',
      span: 'lg:col-span-1',
    },
    {
      num: '04',
      icon: Award,
      title: 'Préparation Soutenance',
      description: 'Coaching intensif, slides professionnels, simulation devant jury et gestion du stress.',
      span: 'lg:col-span-1',
    },
    {
      num: '05',
      icon: MessageCircle,
      title: 'Support Continu',
      description: 'Messagerie directe avec votre accompagnateur. Réponses rapides et disponibilité permanente.',
      span: 'lg:col-span-1',
    },
    {
      num: '06',
      icon: Shield,
      title: 'Confidentialité',
      description: 'Vos documents et échanges sont entièrement sécurisés. Aucun partage, confidentialité garantie.',
      span: 'lg:col-span-1',
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-32 bg-bg-light isolate perspective-[1000px]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-16 opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
        >
          <p className="font-title text-accent text-xl font-semibold tracking-wide uppercase mb-4">Services</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Tout ce qu&apos;il faut pour réussir
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            De la première idée à la soutenance finale, un accompagnement expert à chaque étape.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`group relative opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform] ${service.span}`}
            >
              <div className="relative h-full bg-white rounded-2xl p-8 border border-border/50 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-5px_var(--color-accent)]/10 group-hover:border-accent/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between mb-8">
                  <BrandIcon icon={service.icon} size={48} className="group-hover:scale-110 group-hover:drop-shadow-sm transition-all duration-500" />
                  <span className="text-xs text-text-muted font-mono group-hover:text-accent transition-colors duration-500">{service.num}</span>
                </div>

                <h3 className="relative z-10 text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="relative z-10 text-text-secondary text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== PACKS ====================
function PacksSection() {
  const packs = [
    {
      name: 'Démarrage',
      price: '50 000',
      period: 'CFA',
      description: 'Pour bien démarrer votre mémoire',
      features: [
        'Choix du sujet pertinent et adapté',
        'Problématique claire et précise',
        'Plan détaillé et cohérent',
        'Rédaction du contexte et introduction',
        'Formulation des objectifs',
      ],
      installments: null,
      popular: false,
      dark: false,
    },
    {
      name: 'Complet',
      price: '150 000',
      period: 'CFA',
      installments: '100 000 + 50 000 CFA',
      description: 'Pour un accompagnement de A à Z',
      features: [
        'Tout le Pack Démarrage inclus',
        'Suivi complet de la rédaction',
        'Lecture approfondie et corrections',
        'PowerPoint professionnel',
        '5 séances de simulation soutenance',
      ],
      popular: true,
      dark: true,
    },
    {
      name: 'Rédaction',
      price: '100 000',
      period: 'CFA',
      installments: '75 000 + 25 000 CFA',
      description: 'Pour une rédaction de qualité',
      features: [
        'Suivi de la rédaction chapitre par chapitre',
        'Lecture approfondie et vérification',
        'Correction orthographe et grammaire',
      ],
      popular: false,
      dark: false,
    },
    {
      name: 'Soutenance',
      price: '65 000',
      period: 'CFA',
      description: 'Pour une soutenance professionnelle',
      features: [
        'PowerPoint esthétique et structuré',
        '5 séances de simulation soutenance',
        'Préparation aux questions du jury',
      ],
      installments: null,
      popular: false,
      dark: false,
    },
  ];

  return (
    <section id="packs" className="py-20 lg:py-32 bg-white relative overflow-hidden isolate perspective-[1000px]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16 opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
        >
          <p className="font-title text-accent text-xl font-semibold tracking-wide uppercase mb-4">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Des formules claires, sans surprise
          </h2>
          <p className="text-text-secondary text-lg">
            Choisissez la formule adaptée à votre besoin. Paiement en tranches disponible.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.name}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`relative opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform] ${pack.dark ? 'lg:scale-105 lg:-my-4' : ''}`}
            >
              <div className={`relative h-full rounded-2xl p-8 lg:px-8 flex flex-col transition-all duration-300 ${pack.dark
                ? 'bg-primary text-white border border-white/10 shadow-2xl shadow-primary/20 lg:py-12'
                : 'bg-white border border-border hover:border-border/80 hover:shadow-lg'
                }`}>
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-primary text-xs font-semibold px-4 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-1 ${pack.dark ? 'text-white' : 'text-primary'}`}>
                    Pack {pack.name}
                  </h3>
                  <p className={`text-sm ${pack.dark ? 'text-white/50' : 'text-text-secondary'}`}>
                    {pack.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold tracking-tight ${pack.dark ? 'text-white' : 'text-primary'}`}>
                      {pack.price}
                    </span>
                    <span className={`text-sm ${pack.dark ? 'text-white/40' : 'text-text-muted'}`}>
                      {pack.period}
                    </span>
                  </div>
                  {pack.installments && (
                    <p className={`text-xs mt-2 ${pack.dark ? 'text-white/30' : 'text-text-muted'}`}>
                      ou en 2 tranches : {pack.installments}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pack.dark ? 'text-accent' : 'text-success'}`} />
                      <span className={pack.dark ? 'text-white/70' : 'text-text-secondary'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pack.dark
                    ? 'bg-accent text-primary hover:bg-accent-dark'
                    : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                >
                  Choisir ce pack
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== HOW IT WORKS ====================
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Inscription',
      description: 'Créez votre compte et choisissez votre pack en quelques clics.',
      icon: Users,
    },
    {
      number: '02',
      title: 'Expert Assigné',
      description: 'Un accompagnateur qualifié est attribué selon votre domaine.',
      icon: GraduationCap,
    },
    {
      number: '03',
      title: 'Suivi Continu',
      description: 'Échangez, soumettez vos travaux et recevez des retours détaillés.',
      icon: MessageCircle,
    },
    {
      number: '04',
      title: 'Réussite',
      description: 'Soutenez avec confiance grâce à une préparation complète.',
      icon: Award,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white overflow-hidden relative isolate perspective-[1000px]" id="processus">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-transparent" />
      <div className="absolute -left-40 top-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 flex flex-col items-center justify-center gap-8 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.p
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              className="font-title text-accent text-xl font-semibold tracking-wide uppercase mb-4 opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
            >
              Processus
            </motion.p>
            <motion.h2
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6 opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
            >
              L&apos;excellence en <span className="text-accent">4 étapes</span>
            </motion.h2>
            <motion.p
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary text-lg leading-relaxed opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
            >
              Un parcours soigneusement conçu pour vous mener de l&apos;idée initiale à la soutenance finale avec assurance et brio.
            </motion.p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`relative group h-full opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform] ${index % 2 !== 0 ? 'lg:mt-16' : ''}`}
            >
              <div className="bg-white rounded-[2rem] p-8 border border-border shadow-lg shadow-black/[0.03] hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden min-h-[320px]">
                {/* Large Background Number - More subtle */}
                <div className="absolute -right-4 -bottom-6 text-9xl font-black text-bg-light/40 select-none transition-transform duration-500 group-hover:scale-110 group-hover:text-accent/5">
                  {step.number}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 relative inline-block self-start">
                    {/* Icon Container with glowing effect */}
                    <BrandIcon icon={step.icon} size={64} className="shadow-lg group-hover:scale-105 transition-transform duration-300" />
                    {/* Step number badge - More prominent */}
                    <div className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-accent text-primary text-sm font-black flex items-center justify-center shadow-xl transform rotate-12 group-hover:rotate-0 transition-all duration-300 border-2 border-white">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed font-medium mb-4 flex-grow">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS ====================
function Testimonials() {
  const testimonials = [
    {
      name: 'Mariama Sow',
      role: 'Master Marketing — UCAD',
      content: 'Grâce à Clé du Mémoire, j\'ai soutenu avec succès mon mémoire sur le marketing digital. Accompagnement exceptionnel.',
      avatar: 'MS',
    },
    {
      name: 'Ibrahima Fall',
      role: 'Master Informatique — ESP',
      content: 'Le suivi personnalisé m\'a permis de produire un mémoire de qualité. Je recommande vivement cette plateforme.',
      avatar: 'IF',
    },
    {
      name: 'Aminata Diallo',
      role: 'Master Finance — ISM',
      content: 'Plateforme intuitive et messagerie pratique. Mon accompagnatrice m\'a guidée efficacement malgré un planning serré.',
      avatar: 'AD',
    },
    {
      name: 'Ousmane Ndiaye',
      role: 'Master Droit — UGB',
      content: 'Le Pack Complet m\'a offert un accompagnement sans faille. La préparation à la soutenance a été déterminante.',
      avatar: 'ON',
    },
    {
      name: 'Fatou Diop',
      role: 'Licence Gestion — SupDeco',
      content: 'La qualité des relectures et les conseils méthodologiques ont fait toute la différence. Merci infiniment !',
      avatar: 'FD',
    },
    {
      name: 'Cheikh Tidiane',
      role: 'Master Management — BEM',
      content: 'Plateforme révolutionnaire pour les étudiants sénégalais. Je ne me suis jamais senti seul pendant la rédaction.',
      avatar: 'CT',
    },
  ];

  const row1 = [...testimonials];
  const row2 = [testimonials[3], testimonials[4], testimonials[5], testimonials[0], testimonials[1], testimonials[2]];

  const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
    <div className="bg-white rounded-2xl p-7 border border-border/50 flex flex-col justify-between w-[340px] sm:w-[400px] shrink-0 mx-2 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-shadow duration-300">
      <div>
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} weight="fill" className="w-3.5 h-3.5 text-accent" />
          ))}
        </div>
        <p className="text-text-primary text-sm leading-relaxed mb-6">
          &ldquo;{t.content}&rdquo;
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/[0.06] flex items-center justify-center text-primary font-semibold text-xs">
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-primary">{t.name}</div>
          <div className="text-xs text-text-muted">{t.role}</div>
        </div>
      </div>
    </div>
  );

  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="testimonials" className="section bg-white relative overflow-hidden isolate perspective-[1000px]">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center max-w-3xl mx-auto opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
        >
          <p className="font-title text-accent text-xl font-semibold tracking-wide uppercase mb-4">Témoignages</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Ils nous font confiance
          </h2>
          <p className="text-text-secondary text-lg">
            Découvrez les retours de nos étudiants.
          </p>
        </motion.div>
      </div>

      <div className="relative flex flex-col gap-4 py-2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <motion.div
          drag="x"
          dragConstraints={{ left: -1000, right: 1000 }}
          whileTap={{ cursor: "grabbing" }}
          className="flex w-max cursor-grab active:cursor-grabbing group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={() => setIsPaused(false)}
          onPanStart={() => setIsPaused(true)}
          onPanEnd={() => setIsPaused(false)}
        >
          <div className={`flex w-max animate-[marquee_60s_linear_infinite] ${isPaused ? '[animation-play-state:paused]' : ''} peer`}>
            <div className="flex w-max shrink-0">
              {row1.map((t, index) => <TestimonialCard key={`r1-a-${index}`} t={t} />)}
            </div>
            <div className="flex w-max shrink-0">
              {row1.map((t, index) => <TestimonialCard key={`r1-b-${index}`} t={t} />)}
            </div>
          </div>
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -1000, right: 1000 }}
          whileTap={{ cursor: "grabbing" }}
          className="flex w-max cursor-grab active:cursor-grabbing group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={() => setIsPaused(false)}
          onPanStart={() => setIsPaused(true)}
          onPanEnd={() => setIsPaused(false)}
        >
          <div className={`flex w-max animate-[marquee-reverse_60s_linear_infinite] ${isPaused ? '[animation-play-state:paused]' : ''} peer`}>
            <div className="flex w-max shrink-0">
              {row2.map((t, index) => <TestimonialCard key={`r2-a-${index}`} t={t} />)}
            </div>
            <div className="flex w-max shrink-0">
              {row2.map((t, index) => <TestimonialCard key={`r2-b-${index}`} t={t} />)}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== CTA ====================
function CTASection() {
  return (
    <section className="py-32 bg-primary relative overflow-hidden border-t border-white/5 isolate perspective-[1000px]">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-info/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-5xl mx-auto px-6 text-center opacity-0 translate-y-6 lg:translate-y-8 transform-gpu backface-hidden will-change-[opacity,transform]"
      >
        {/* Social Proof Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-accent text-xs font-bold mb-8 tracking-widest uppercase font-title">
          VOTRE RÉUSSITE COMMENCE ICI
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
          Transformez votre <span className="text-accent  decoration-accent/30 underline-offset-8">ambition</span>
          <br />
          en diplôme d&apos;excellence.
        </h2>

        <p className="text-white/50 text-lg sm:text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Ne laissez pas le stress de la rédaction freiner votre carrière.
          Profitez dès aujourd&apos;hui de l&apos;expertise premium de nos accompagnateurs dédiés.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-liquid py-4 px-12 text-sm font-bold shadow-2xl shadow-accent/20 hover:scale-105 transition-transform">
            <span>S&apos;inscrire maintenant</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <a href="#contact" className="text-white/60 hover:text-white text-sm font-semibold transition-colors px-8 py-4">
            Parler à un conseiller
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap justify-center gap-10 opacity-40 grayscale pointer-events-none">
          <div className="text-sm font-bold tracking-tighter text-white">UCAD</div>
          <div className="text-sm font-bold tracking-tighter text-white">UGB</div>
          <div className="text-sm font-bold tracking-tighter text-white">ISM GROUP</div>
          <div className="text-sm font-bold tracking-tighter text-white">ESTM DAKAR</div>
          <div className="text-sm font-bold tracking-tighter text-white">CFPC</div>

        </div>
      </motion.div>
    </section>
  );
}













function Contact() {
  const { settings } = useGlobalSettings();
  return (
    <section id="contact" className="section relative bg-bg-light overflow-hidden text-primary border-t border-border-light isolate perspective-[1000px] py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-10 sm:mb-16 opacity-0 translate-y-4 lg:translate-y-6 transform-gpu backface-hidden will-change-[opacity,transform]"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-4">
            Contactez-nous
          </h2>
        </motion.div>

        {/* Container */}
        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center w-full mt-6 sm:mt-10">

          {/* Left: Form Card */}
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[65%] bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2rem] shadow-xl p-6 sm:p-8 lg:p-12 z-10 relative opacity-0 lg:-translate-x-8 transform-gpu backface-hidden will-change-[opacity,transform] lg:-mr-12"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">Envoyez-nous un message</h3>
            <p className="text-text-secondary text-sm mb-6 sm:mb-10 max-w-lg">
              Vous avez une question ? Besoin d&apos;aide pour choisir le bon pack ? N&apos;hésitez pas à nous contacter.
            </p>

            <form className="space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary">Prénom</label>
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm placeholder:text-text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary">Nom</label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm placeholder:text-text-muted"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary">Email</label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm placeholder:text-text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary">Téléphone</label>
                  <div className="flex">
                    <div className="px-3 sm:px-4 border border-r-0 border-border rounded-l-xl bg-bg-light flex items-center justify-center text-sm font-medium text-primary cursor-not-allowed">
                      +221
                    </div>
                    <input
                      type="tel"
                      placeholder="00 000 00 00"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-r-xl border border-border bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pb-2 sm:pb-4">
                <label className="block text-sm font-bold text-primary">Message</label>
                <textarea
                  rows={4}
                  placeholder="Votre message..."
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm resize-none placeholder:text-text-muted"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white rounded-xl py-3 sm:py-4 px-8 sm:px-10 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto">
                  Envoyer
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right: Info Card */}
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-[40%] bg-primary text-white rounded-2xl sm:rounded-3xl lg:rounded-[2rem] shadow-2xl p-6 sm:p-8 lg:p-12 z-20 relative opacity-0 lg:translate-x-8 transform-gpu backface-hidden will-change-[opacity,transform] mt-6 lg:mt-0 flex flex-col"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-6 sm:mb-10 text-white/90">
              Bonjour ! Nous sommes toujours là pour vous aider.
            </h3>

            <div className="flex-1 space-y-3 sm:space-y-4">
              {[
                { icon: Phone, label: 'Hotline:', value: settings.contactPhone },
                { icon: MessageCircle, label: 'SMS / WhatsApp:', value: settings.contactPhone },
                { icon: Mail, label: 'Email:', value: settings.contactEmail },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-5 bg-white/10 border border-white/5 rounded-xl sm:rounded-[1.25rem] p-4 sm:p-5">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-white/60 mb-0.5">{item.label}</div>
                    <div className="font-semibold text-sm sm:text-base truncate">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <div className="text-sm font-bold text-white mb-4 sm:mb-6">Connectez-vous avec nous</div>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {[
                  { Icon: CustomFacebookIcon, href: settings.facebookUrl },
                  { Icon: InstagramLogo, href: settings.instagramUrl },
                  { Icon: XLogo, href: settings.twitterUrl },
                  { Icon: TikTokLogo, href: settings.tiktokUrl },
                  { Icon: CustomLinkedinIcon, href: settings.linkedinUrl },
                  { Icon: YoutubeLogo, href: settings.youtubeUrl },
                ].map(({ Icon, href }, idx) => (
                  <a
                    key={idx}
                    href={href && href !== '#' ? href : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary relative overflow-hidden group hover:scale-105 transition-transform duration-300 ${!href || href === '#' ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className="absolute inset-0 bg-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <Icon weight="fill" className="w-5 h-5 relative z-10" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  const { settings } = useGlobalSettings();
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo className="w-40 h-auto mb-5" variant="full" monochrome />
            <p className="text-white/30 text-sm leading-relaxed">
              La plateforme d&apos;accompagnement académique de référence au Sénégal.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {['Services', 'Tarifs', 'Témoignages', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-white/40 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Nos Packs</h4>
            <ul className="space-y-2.5">
              {['Pack Démarrage', 'Pack Rédaction', 'Pack Soutenance', 'Pack Complet'].map((pack) => (
                <li key={pack}>
                  <a href="#packs" className="text-white/40 hover:text-white text-sm transition-colors">
                    {pack}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li className="flex items-center gap-2 text-white/60"><Mail className="w-3.5 h-3.5" /> {settings.contactEmail}</li>
              <li className="flex items-center gap-2 text-white/60"><Phone className="w-3.5 h-3.5" /> {settings.contactPhone}</li>
              <li className="flex items-center gap-2 text-white/60"><MapPin className="w-3.5 h-3.5" /> {settings.contactAddress}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} {settings.platformName}. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-white/20">
            <a href="#" className="hover:text-white/50 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white/50 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white/50 transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== SCROLL TO TOP ====================
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center shadow-xl shadow-primary/15 hover:scale-110 hover:bg-accent-dark transition-all duration-200"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-5 h-5" weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ==================== MAIN PAGE ====================
import Loader from '@/components/Loader';
import Logo from '@/components/Logo';

export default function HomePage() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 1.5s
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Loader fullScreen show={initialLoading} text="Chargement de l'expérience..." />
      <div className={`transition-opacity duration-700 ${initialLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Navbar />
      </div>
      <div
        className={`transition-opacity duration-1000 ${initialLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <main>
          <Hero />
          <Services />
          <PacksSection />
          <HowItWorks />
          <Testimonials />
          <CTASection />
          <Contact />
          <Footer />
        </main>
        <ScrollToTop />
      </div>
    </>
  );
}
