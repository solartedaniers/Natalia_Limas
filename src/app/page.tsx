"use client";
import { MotionConfig } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Credentials } from "@/components/sections/Credentials";
import { Cv } from "@/components/sections/Cv";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main className="overflow-x-hidden">
        <Hero />
        <About />
        <Experience />
        <Credentials />
        <Cv />
        <Testimonials />
        <Contact />
      </main>
    </MotionConfig>
  );
}
