'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, GraduationCap, Users, MessageCircle, ChevronRight,
  Star, Menu, X, Shield, Award, Target, TrendingUp, FileText,
  Heart, BarChart3, Send, Quote, ArrowRight, CheckCircle, Clock, Mail, MapPin, Phone, Zap, Check, Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';

// ==================== NAVBAR ====================
function Navbar() {
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
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo className="w-28 h-auto" variant="icon" monochrome={false} />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-primary hover:bg-bg-light'
                    }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:text-primary transition-colors"
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
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-primary hover:bg-primary/5'
                      }`}
                  >
                    {link.label}
                  </a>
                );
              })}
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
            alt="Étudiant diplômé sénégalais"
            className="absolute bottom-0 right-[5%] h-[90%] w-auto object-contain object-bottom opacity-90 hover:opacity-100 transition-all duration-500"
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

      <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-32 w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] mb-8"
          >
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            Plateforme N°1 au Sénégal
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold text-white leading-[1.1] sm:leading-[1.05] tracking-tight mb-6">
            Réussissez votre
            <br />
            <span className="text-accent">mémoire</span> avec
            <br />
            un expert dédié
          </h1>

          <p className="text-base sm:text-lg text-white/40 max-w-lg mb-10 leading-relaxed font-light">
            Accompagnement personnalisé du choix du sujet à la soutenance.
            Plus de 500 étudiants nous font déjà confiance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/register" className="btn-primary py-3 px-8 text-sm">
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#services" className="btn-outline py-3 px-8 text-sm">
              Découvrir nos services
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10">
            {[
              { value: '500+', label: 'Étudiants' },
              { value: '95%', label: 'Réussite' },
              { value: '4.9', label: 'Sur 5 ★' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30 mt-0.5 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
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
    <section id="services" className="py-20 lg:py-32 bg-bg-light">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl mb-16"
        >
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-4">Services</p>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.05 }}
              className={`group relative bg-white rounded-2xl p-8 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${service.span}`}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-11 h-11 rounded-xl bg-primary/[0.04] flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300">
                  <service.icon className="w-5 h-5 text-primary/60 group-hover:text-accent transition-colors duration-300" />
                </div>
                <span className="text-xs text-text-muted font-mono">{service.num}</span>
              </div>

              <h3 className="text-lg font-semibold text-primary mb-2">
                {service.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {service.description}
              </p>
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
      period: 'FCFA',
      description: 'Idéal pour bien démarrer votre mémoire',
      features: [
        'Aide au choix du sujet',
        'Formulation de la problématique',
        'Élaboration du plan détaillé',
        'Recherche bibliographique guidée',
        '2 séances de coaching',
      ],
      popular: false,
      dark: false,
    },
    {
      name: 'Complet',
      price: '150 000',
      period: 'FCFA',
      installments: '100 000 + 50 000 FCFA',
      description: 'L\'accompagnement ultime, du début à la fin',
      features: [
        'Tout le Pack Démarrage',
        'Rédaction accompagnée complète',
        'Préparation soutenance',
        'Accompagnateur dédié',
        'Coaching illimité',
        'Priorité de traitement',
        'Garantie satisfaction',
      ],
      popular: true,
      dark: true,
    },
    {
      name: 'Rédaction',
      price: '100 000',
      period: 'FCFA',
      installments: '75 000 + 25 000 FCFA',
      description: 'Accompagnement complet de la rédaction',
      features: [
        'Accompagnement rédactionnel complet',
        'Relecture de chaque chapitre',
        'Corrections et suggestions',
        'Mise en forme académique',
        '6 séances de coaching',
        'Support WhatsApp illimité',
      ],
      popular: false,
      dark: false,
    },
    {
      name: 'Soutenance',
      price: '65 000',
      period: 'FCFA',
      description: 'Préparation intensive à la soutenance',
      features: [
        'Préparation des slides',
        'Simulation de soutenance',
        'Coaching prise de parole',
        'Anticipation des questions',
        '3 séances de simulation',
      ],
      popular: false,
      dark: false,
    },
  ];

  return (
    <section id="packs" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-4">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Des formules claires, sans surprise
          </h2>
          <p className="text-text-secondary text-lg">
            Choisissez la formule adaptée à votre besoin. Paiement en tranches disponible.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${pack.dark
                ? 'bg-primary text-white border border-white/10 shadow-2xl shadow-primary/20 lg:scale-105 lg:-my-4 lg:py-12'
                : 'bg-white border border-border hover:border-border/80 hover:shadow-lg'
                }`}
            >
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
    <section className="py-20 lg:py-32 bg-white overflow-hidden relative" id="processus">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-bg-light/50 to-transparent" />
      <div className="absolute -left-40 top-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center lg:text-left flex flex-col lg:flex-row gap-8 lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-4 mb-4"
            >
              <div className="w-12 h-px bg-accent"></div>
              <p className="text-accent text-sm font-bold tracking-widest uppercase">Processus</p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-primary mb-6 leading-tight"
            >
              L&apos;excellence en <span className="text-accent">4 étapes</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary text-lg sm:text-xl lg:max-w-xl mx-auto lg:mx-0"
            >
              Un parcours soigneusement conçu pour vous mener de l&apos;idée initiale à la soutenance finale avec assurance et brio.
            </motion.p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {/* Glowing connecting line */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.1, duration: 0.5, type: "tween" }}
              className={`relative group h-full ${index % 2 !== 0 ? 'lg:mt-16' : ''}`}
            >
              <div className="bg-white rounded-[2rem] p-8 border border-border shadow-lg shadow-black/[0.03] hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden min-h-[320px]">
                {/* Large Background Number - More subtle */}
                <div className="absolute -right-4 -bottom-6 text-9xl font-black text-bg-light/40 select-none transition-transform duration-500 group-hover:scale-110 group-hover:text-accent/5">
                  {step.number}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 relative inline-block self-start">
                    {/* Icon Container with glowing effect */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bg-light to-white border border-border flex items-center justify-center shadow-inner relative z-10 group-hover:border-accent/30 transition-colors">
                      <step.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300" />
                    </div>
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
            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
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

  return (
    <section id="testimonials" className="section bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-4">Témoignages</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Ils nous font confiance
          </h2>
          <p className="text-text-secondary text-lg">
            Découvrez les retours de nos étudiants.
          </p>
        </motion.div>
      </div>

      <div className="relative flex flex-col gap-4 group [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-2 overflow-hidden">
        <div className="flex w-max animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
          <div className="flex w-max shrink-0">
            {row1.map((t, index) => <TestimonialCard key={`r1-a-${index}`} t={t} />)}
          </div>
          <div className="flex w-max shrink-0">
            {row1.map((t, index) => <TestimonialCard key={`r1-b-${index}`} t={t} />)}
          </div>
        </div>
        <div className="flex w-max animate-[marquee-reverse_60s_linear_infinite] group-hover:[animation-play-state:paused]">
          <div className="flex w-max shrink-0">
            {row2.map((t, index) => <TestimonialCard key={`r2-a-${index}`} t={t} />)}
          </div>
          <div className="flex w-max shrink-0">
            {row2.map((t, index) => <TestimonialCard key={`r2-b-${index}`} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== CTA ====================
function CTASection() {
  return (
    <section className="py-32 bg-primary relative overflow-hidden border-t border-white/5">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-info/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-accent text-xs font-bold mb-8 tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            VOTRE RÉUSSITE COMMENCE ICI
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Transformez votre <span className="text-accent underline decoration-accent/30 underline-offset-8">ambition</span>
            <br />
            en diplôme d&apos;excellence.
          </h2>

          <p className="text-white/50 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Ne laissez pas le stress de la rédaction freiner votre carrière.
            Profitez dès aujourd&apos;hui de l&apos;expertise premium de nos accompagnateurs dédiés.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary py-4 px-12 text-sm font-bold shadow-2xl shadow-accent/20 hover:scale-105 transition-transform">
              S&apos;inscrire maintenant
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
            <a href="#contact" className="text-white/60 hover:text-white text-sm font-semibold transition-colors px-8 py-4">
              Parler à un conseiller
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap justify-center gap-10 opacity-40 grayscale pointer-events-none">
            <div className="text-sm font-bold tracking-tighter text-white">UCAD</div>
            <div className="text-sm font-bold tracking-tighter text-white">ESP DAKAR</div>
            <div className="text-sm font-bold tracking-tighter text-white">UGB ST-LOUIS</div>
            <div className="text-sm font-bold tracking-tighter text-white">ISM GROUP</div>
            <div className="text-sm font-bold tracking-tighter text-white">BEM SÉNÉGAL</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section relative bg-white overflow-hidden text-primary border-t border-border-light">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.02] to-transparent pointer-events-none" />
      <div className="absolute -left-64 bottom-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-px bg-accent"></div>
              <p className="text-accent text-sm font-bold tracking-widest uppercase">Contact</p>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-primary mb-6 leading-tight">
              Discutons de votre <span className="text-accent">projet</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-md">
              Notre équipe d&apos;experts est disponible pour répondre à vos questions et vous orienter vers la meilleure formule d&apos;accompagnement.
            </p>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'contact@cledumemoire.sn', sub: 'Réponse sous 24h', bg: 'bg-primary/[0.03]', text: 'text-primary' },
                { icon: Phone, label: '+221 77 000 00 00', sub: 'Lun-Ven, 9h-18h', bg: 'bg-primary/[0.03]', text: 'text-primary' },
                { icon: MapPin, label: 'Dakar, Sénégal', sub: 'Almadies, Point E', bg: 'bg-primary/[0.03]', text: 'text-primary' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white transition-all duration-300 border border-transparent hover:border-border hover:shadow-xl hover:shadow-black/[0.02] group cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} border border-border/50 flex items-center justify-center transform group-hover:scale-105 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.text} group-hover:text-accent transition-colors`} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-primary mb-1 group-hover:text-accent transition-colors">{item.label}</div>
                    <div className="text-sm text-text-muted font-medium">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Form decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-[2.5rem] transform translate-x-4 translate-y-4 -z-10" />

            <form className="bg-white rounded-[2rem] border border-border-light shadow-2xl shadow-black/[0.04] p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] pointer-events-none" />

              <h3 className="text-2xl font-bold text-primary mb-8">Envoyez-nous un message</h3>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Prénom</label>
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-light/50 focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-medium placeholder:text-text-muted/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Nom</label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-light/50 focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-medium placeholder:text-text-muted/70"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email professionnel</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-light/50 focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-medium placeholder:text-text-muted/70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-light/50 focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-medium resize-none placeholder:text-text-muted/70"
                />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-4 flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4 group">
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Envoyer le message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo className="w-32 h-auto mb-5" variant="icon" />
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
              {['Pack Démarrage', 'Pack Rédaction', 'Pack Complet'].map((pack) => (
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
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> contact@cledumemoire.sn</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +221 77 000 00 00</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Dakar, Sénégal</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs">
            © 2026 Clé du Mémoire. Tous droits réservés.
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

// ==================== MAIN PAGE ====================
import Loader from '@/components/Loader';

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
      </div>
    </>
  );
}
