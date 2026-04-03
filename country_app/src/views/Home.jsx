// src/views/Home.jsx - Modern Rustic Elegance Landing Page
import React from 'react';

// Landing Page Components
import {
  LandingNavbar,
  HeroSection,
  StatsSection,
  LandingAboutSection,
  LandingEventsSection,
  LandingContactSection,
  LandingFooter,
} from '../components/landing';

const Home = () => {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <LandingAboutSection />
      <LandingEventsSection />
      <LandingContactSection />
      <LandingFooter />
    </main>
  );
};

export default Home;
