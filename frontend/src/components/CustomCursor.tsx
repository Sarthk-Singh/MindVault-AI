import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const CustomCursor: React.FC = () => {
  const blurRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (blurRef.current) {
        gsap.to(blurRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "power2.out"
        });
      }
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    const onMouseEnterTarget = () => {
      if (blurRef.current) {
        gsap.to(blurRef.current, { width: 150, height: 150, duration: 0.3 });
      }
    };

    const onMouseLeaveTarget = () => {
      if (blurRef.current) {
        gsap.to(blurRef.current, { width: 400, height: 400, duration: 0.3 });
      }
    };

    const bindTargets = () => {
      const targets = document.querySelectorAll(
        "button, a, input, select, textarea, [role='button'], .magnetic-target, .cursor-pointer"
      );
      targets.forEach((el) => {
        // Remove first to avoid duplicate bindings
        el.removeEventListener("mouseenter", onMouseEnterTarget);
        el.removeEventListener("mouseleave", onMouseLeaveTarget);
        el.addEventListener("mouseenter", onMouseEnterTarget);
        el.addEventListener("mouseleave", onMouseLeaveTarget);
      });
    };

    bindTargets();

    const observer = new MutationObserver(bindTargets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
      const targets = document.querySelectorAll(
        "button, a, input, select, textarea, [role='button'], .magnetic-target, .cursor-pointer"
      );
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterTarget);
        el.removeEventListener("mouseleave", onMouseLeaveTarget);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={blurRef}
        className="custom-cursor hidden md:block"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          zIndex: 9999
        }}
      />
      <div
        ref={dotRef}
        className="cursor-dot hidden md:block"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "8px",
          height: "8px",
          background: "#fff",
          borderRadius: "50%",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          zIndex: 10000,
          boxShadow: "0 0 15px #0ea5e9"
        }}
      />
    </>
  );
};

export default CustomCursor;
