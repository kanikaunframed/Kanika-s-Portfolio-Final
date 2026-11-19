import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LandingHero } from "./components/LandingHero";
import { Dock } from "./components/Dock";
import { Home } from "./components/Home";
import { About } from "./components/About";
import {
  Work,
  resolveDeepLinkFromSearch,
  clearDeepLinkParamsFromUrl,
  warmUpPortfolioAssets,
} from "./components/Work";
import { Contact } from "./components/Contact";
import {
  preloadAllMotionGraphicsAssets,
  PrewarmedCommercialAssetBank,
} from "./motionGraphics/preloadAssets";
import { preloadOfficeHeroAssets } from "./components/OfficeHeroShowcase";

export default function App() {
  const prefersReducedMotion = useReducedMotion();

  const [isLandingVisible, setIsLandingVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    const deepLink = resolveDeepLinkFromSearch(window.location.search);
    if (deepLink) return false;
    if (window.location.search) {
      clearDeepLinkParamsFromUrl();
    }
    return true;
  });

  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== "undefined") {
      const deepLink = resolveDeepLinkFromSearch(window.location.search);
      if (deepLink) return "work";
    }
    return "home";
  });

  useEffect(() => {
    const handlePopState = () => {
      const deepLink = resolveDeepLinkFromSearch(window.location.search);
      if (deepLink) {
        setIsLandingVisible(false);
        setActiveSection("work");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Start preloading & decoding all 2D commercial assets, office hero illustrations,
  // and first original mockups immediately in the background while the intro plays
  useEffect(() => {
    void preloadOfficeHeroAssets();
    void preloadAllMotionGraphicsAssets();
    const timer = window.setTimeout(() => {
      warmUpPortfolioAssets();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  const handleExplore = useCallback(() => {
    setIsLandingVisible(false);
  }, []);

  const handleReturnToLanding = useCallback(() => {
    clearDeepLinkParamsFromUrl();
    setActiveSection((prev) => (prev === "home" ? prev : "home"));
    setIsLandingVisible((prev) => (prev ? prev : true));
  }, []);

  return (
    <div className="relative bg-white h-[100dvh] w-full overflow-hidden flex flex-col">
      {/* GPU-Lightweight Ambient Background (pure #FFFFFF on Home so office canvas blends seamlessly) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-white select-none"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        aria-hidden="true"
      >
        {activeSection !== "home" && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 22% 22%, rgba(244, 244, 245, 0.85) 0%, rgba(244, 244, 245, 0) 55%), radial-gradient(circle at 78% 78%, rgba(228, 228, 231, 0.55) 0%, rgba(228, 228, 231, 0) 52%), radial-gradient(circle at 55% 42%, rgba(250, 250, 250, 0.9) 0%, rgba(255, 255, 255, 0) 50%)",
            }}
          />
        )}
      </div>

      {/* Main Portfolio Shell (pre-mounted underneath Intro for seamless zero-flash reveal) */}
      <div
        aria-hidden={isLandingVisible}
        className={isLandingVisible ? "pointer-events-none" : "contents"}
      >
        <Dock
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onReturnToLanding={handleReturnToLanding}
        />

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-0 z-10 pointer-events-none pt-[72px] md:pt-[88px] lg:pt-[100px]"
        >
          <div className="relative w-full h-full pointer-events-auto">
            <AnimatePresence mode={prefersReducedMotion ? "sync" : "wait"}>
              {activeSection === "home" && (
                <Home
                  key="home"
                  setActiveSection={setActiveSection}
                  isIntroActive={isLandingVisible}
                />
              )}
              {activeSection === "about" && <About key="about" />}
              {activeSection === "work" && <Work key="work" />}
              {activeSection === "contact" && (
                <Contact key="contact" setActiveSection={setActiveSection} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Cinematic Visual Identity Intro Curtain */}
      <AnimatePresence>
        {isLandingVisible && (
          <LandingHero key="landing-hero" onExplore={handleExplore} />
        )}
      </AnimatePresence>
      {/* Offscreen 1x1px Bitmap Cache Warmer so 2D commercials open at 0ms */}
      <PrewarmedCommercialAssetBank />
    </div>
  );
}
