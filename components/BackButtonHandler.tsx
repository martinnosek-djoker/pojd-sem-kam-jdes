"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * BackButtonHandler - Handles Android back button behavior
 *
 * When user presses hardware back button:
 * - If not on homepage: navigate back in history
 * - If on homepage: minimize app (don't exit completely)
 */
export default function BackButtonHandler() {
  const router = useRouter();

  useEffect(() => {
    // Only run on mobile/Capacitor environment
    if (typeof window === "undefined" || !(window as any).Capacitor) {
      return;
    }

    let backButtonListener: any;

    const setupBackButton = async () => {
      try {
        // Dynamically import App plugin from Capacitor
        const { App } = await import("@capacitor/app");

        // Listen to back button events (not an async function, no await needed)
        backButtonListener = App.addListener("backButton", () => {
          // Check if we're on the homepage
          const isHomepage = window.location.pathname === "/" || window.location.pathname === "";

          // Check if we have history to go back to
          const hasHistory = window.history.length > 1;

          if (!isHomepage && hasHistory) {
            // If we're not on homepage and have history, navigate back
            router.back();
          } else if (isHomepage) {
            // If we're on homepage, minimize the app instead of closing it
            App.minimizeApp();
          } else {
            // Fallback: go to homepage
            router.push("/");
          }
        });
      } catch (error) {
        console.error("Failed to setup back button handler:", error);
      }
    };

    setupBackButton();

    // Cleanup listener on unmount
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [router]);

  return null; // This component doesn't render anything
}
