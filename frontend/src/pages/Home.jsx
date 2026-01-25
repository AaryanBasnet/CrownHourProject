import React from 'react';
import { useAuthStore } from '@store/authStore';

// UPDATED: Import from the specific 'home' directory using your alias
import {
  Hero,
  Marquee,
  Collection,
  Features,
  Craftsmanship,
  Testimonials,
  Gallery,
  Newsletter
} from '@components/home';

export const Home = () => {
  const { isLoggedIn } = useAuthStore();

  return (
    <main className="min-h-screen  overflow-x-hidden">

      {/* Primary Landing Area */}
      <Hero isLoggedIn={isLoggedIn} />

      {/* Social Proof / Brand Ticker */}
      <Marquee />

      {/* Main Product Showcase */}
      <Collection />

      {/* Brand Value & Education */}
      <Craftsmanship />

      {/* Trust Indicators (Why Choose Us) */}
      <Features />

      {/* Social Proof */}
      <Testimonials />

      {/* Visual Immersion */}
      <Gallery />

      {/* Final CTA */}
      <Newsletter />

    </main>
  );
};