"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Hero() {
  const { scrollY } = useScroll({
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollY, [0, 300], [100, 0]);
  const y2 = useTransform(scrollY, [0, 300], [50, 0]);
  const y3 = useTransform(scrollY, [0, 300], [0, 0]);
  const y4 = useTransform(scrollY, [0, 300], [50, 0]);
  const y5 = useTransform(scrollY, [0, 300], [100, 0]);

  return (
    <Section
      id="hero"
      className="min-h-[100vh] w-full overflow-hidden bg-zinc-950"
    >
      <main className="mx-auto pt-16 sm:pt-24 md:pt-32 text-center relative px-4">
        <div className="relative">
          <motion.div
            initial={{ scale: 4.5, height: "80vh" }}
            animate={{ scale: 1, height: "10vh" }}
            transition={{
              scale: { delay: 0, duration: 1.8, ease: easeInOutCubic },
              height: { delay: 0, duration: 1.8, ease: easeInOutCubic },
            }}
            className="mb-16 relative z-20"
            style={{ transformOrigin: "top" }}
          >
            <div className="bg-blue-600 text-white text-xl font-bold p-4 h-20 w-20 flex items-center justify-center rounded-3xl mx-auto shadow-lg shadow-blue-600/20">
              <Icons.logo className="w-auto h-[40px]" />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute inset-0 top-20 z-10 text-zinc-100 font-bold text-lg"
          >
            Universal IR Remote
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: easeInOutCubic }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent"
          >
            One App. Every Remote.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeInOutCubic }}
            className="max-w-2xl mx-auto text-xl mb-8 font-medium text-balance text-zinc-400"
          >
            Transform your phone into a universal IR remote. Control all your
            devices from anywhere in the world with the Universal IR remote.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-blue-600 hover:bg-blue-700 text-white rounded-full group",
              )}
            >
              Get Started Free
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/remotes"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-blue-700 text-blue-700 rounded-full",
              )}
            >
              My Remotes
            </Link>
          </motion.div>
        </div>

        {/* Phone mockups - these will be your custom designs */}
        <div className="flex flex-nowrap items-center justify-center gap-4 sm:gap-8 h-auto sm:h-[500px] select-none">
        <motion.img
        src="/device3.png"
        alt="iPhone"
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ y: y1 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
        />
        <motion.img
        src="/device2.png"
        alt="iPhone"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ y: y2 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
        />
        <motion.img
        src="/device1.png"
        alt="iPhone"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ y: y3 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
        />
        <motion.img
        src="/device2.png"
        alt="iPhone"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ y: y4 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
        />
        <motion.img
        src="/device3.png"
        alt="iPhone"
        initial={{ opacity: 0, x: 200 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ y: y5 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
        />
        </div>
      </main>
    </Section>
  );
}
