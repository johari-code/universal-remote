"use client";

import { Section } from "@/components/section";
import { easeOutCubic } from "@/lib/animation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Smartphone,
  Wifi,
  Zap,
  Globe,
  Shield,
  Sparkles,
  Radio,
  Home,
  Settings
} from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Universal Compatibility",
    description: "Works with 95% of IR devices including TVs, ACs, set-top boxes, and more",
    color: "from-blue-500 to-blue-600"
  },
{
  icon: Wifi,
  title: "Remote Access",
  description: "Control your home devices from anywhere in the world via internet",
  color: "from-purple-500 to-purple-600"
},
{
  icon: Zap,
  title: "Instant Learning",
  description: "Clone any remote in seconds with our AI-powered learning mode",
  color: "from-green-500 to-green-600"
},
{
  icon: Home,
  title: "Smart Home Ready",
  description: "Integrates seamlessly with your existing smart home ecosystem",
  color: "from-orange-500 to-orange-600"
},
{
  icon: Shield,
  title: "Secure & Private",
  description: "End-to-end encryption keeps your device controls safe",
  color: "from-red-500 to-red-600"
},
{
  icon: Sparkles,
  title: "Custom Layouts",
  description: "Design your perfect remote with drag-and-drop simplicity",
  color: "from-indigo-500 to-indigo-600"
}
];

export function FeatureScroll() {
  const containerRef = useRef(null);
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Phone animations
  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: phone1Ref,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: phone2Ref,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: phone3Ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress1, [0, 0.5], [150, 0], {
    ease: easeOutCubic,
  });
  const y2 = useTransform(scrollYProgress2, [0.1, 0.6], [200, 0], {
    ease: easeOutCubic,
  });
  const y3 = useTransform(scrollYProgress3, [0.2, 0.7], [250, 0], {
    ease: easeOutCubic,
  });

  const scale1 = useTransform(scrollYProgress1, [0, 0.5], [0.9, 1]);
  const scale2 = useTransform(scrollYProgress2, [0.1, 0.6], [0.9, 1]);
  const scale3 = useTransform(scrollYProgress3, [0.2, 0.7], [0.9, 1]);

  const opacity1 = useTransform(scrollYProgress1, [0, 0.3], [0.3, 1]);
  const opacity2 = useTransform(scrollYProgress2, [0.1, 0.4], [0.3, 1]);
  const opacity3 = useTransform(scrollYProgress3, [0.2, 0.5], [0.3, 1]);

  return (
    <Section
    id="features"
    className="py-24 bg-zinc-950 relative overflow-hidden"
    >
    <div className="container px-4 sm:px-10 mx-auto" ref={containerRef}>
    {/* Section Header */}
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="text-center mb-16"
    >
    <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
    Powerful Features
    </h2>
    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
    Everything you need to control your world, built into one revolutionary app
    </p>
    </motion.div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
    {features.map((feature, index) => (
      <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative group"
      >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
      <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
      <feature.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-100 mb-2">
      {feature.title}
      </h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
      {feature.description}
      </p>
      </div>
      </motion.div>
    ))}
    </div>

    {/* Phone Mockups Section */}
    <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="text-center mb-12"
    >
    <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-zinc-100">
    See It In Action
    </h3>
    <p className="text-zinc-400 max-w-xl mx-auto">
    Beautiful interfaces designed for every device in your home
    </p>
    </motion.div>

    {/* Phone Mockups Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mx-auto select-none max-w-5xl">
    <motion.div
    ref={phone1Ref}
    style={{ y: y1, scale: scale1, opacity: opacity1 }}
    className="relative"
    >
    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent rounded-[3rem] blur-3xl" />
    <div className="relative w-full max-w-[280px] h-[560px] mx-auto bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] border border-zinc-700 p-3">
    <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] flex flex-col items-center justify-center p-6">
    <Smartphone className="w-12 h-12 text-blue-500 mb-4" />
    <h4 className="text-zinc-300 font-semibold mb-2">TV Remote</h4>
    <p className="text-zinc-600 text-xs text-center">
    Smart TV controls with channel guide
    </p>
    </div>
    </div>
    </motion.div>

    <motion.div
    ref={phone2Ref}
    style={{ y: y2, scale: scale2, opacity: opacity2 }}
    className="relative"
    >
    <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent rounded-[3rem] blur-3xl" />
    <div className="relative w-full max-w-[280px] h-[560px] mx-auto bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] border border-zinc-700 p-3">
    <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] flex flex-col items-center justify-center p-6">
    <Settings className="w-12 h-12 text-purple-500 mb-4" />
    <h4 className="text-zinc-300 font-semibold mb-2">AC Control</h4>
    <p className="text-zinc-600 text-xs text-center">
    Climate control with scheduling
    </p>
    </div>
    </div>
    </motion.div>

    <motion.div
    ref={phone3Ref}
    style={{ y: y3, scale: scale3, opacity: opacity3 }}
    className="relative"
    >
    <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 to-transparent rounded-[3rem] blur-3xl" />
    <div className="relative w-full max-w-[280px] h-[560px] mx-auto bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] border border-zinc-700 p-3">
    <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] flex flex-col items-center justify-center p-6">
    <Home className="w-12 h-12 text-green-500 mb-4" />
    <h4 className="text-zinc-300 font-semibold mb-2">Home Hub</h4>
    <p className="text-zinc-600 text-xs text-center">
    All devices in one dashboard
    </p>
    </div>
    </div>
    </motion.div>
    </div>

    {/* Stats Section */}
    <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-8"
    >
    {[
      { number: "10K+", label: "Active Users" },
      { number: "50K+", label: "Devices Connected" },
      { number: "99.9%", label: "Uptime" },
      { number: "4.8", label: "App Rating" }
    ].map((stat, index) => (
      <div key={index} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
      {stat.number}
      </div>
      <div className="text-zinc-500 text-sm">{stat.label}</div>
      </div>
    ))}
    </motion.div>
    </div>
    </Section>
  );
}
