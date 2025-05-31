import { tick } from 'svelte';

interface ThemeTransitionOptions {
  isLightFun: () => boolean;
  toggleTheme: () => void;
}

export function createThemeTransition({ isLightFun, toggleTheme }: ThemeTransitionOptions) {
  const toggleThemeWithAnimation = async (buttonElement: HTMLElement) => {
    if (!document.startViewTransition || !buttonElement) {
      toggleTheme();
      return;
    }

    const isLight = isLightFun();

    try {
      const rect = buttonElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(rect.left, window.innerWidth - rect.left),
        Math.max(rect.top, window.innerHeight - rect.top),
      );

      // Remove existing ripple if any
      document.getElementById("rainbow-ripple-svg")?.remove();

      // Create SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", "rainbow-ripple-svg");
      Object.assign(svg.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "2000",
      });

      // Create gradient
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const radialGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
      radialGradient.setAttribute("id", "rainbowGradient");
      radialGradient.setAttribute("r", "1");

      const colorStops = [
        { offset: "0%", color: "#E0FFFF", opacity: "0.9" },
        { offset: "5%", color: "#BFFFFF", opacity: "0.85" },
        { offset: "10%", color: "#9FFFFF", opacity: "0.8" },
        { offset: "15%", color: "#80EEFF", opacity: "0.75" },
        { offset: "20%", color: "#60DDFF", opacity: "0.6" },
        { offset: "25%", color: "#40CCFF", opacity: "0.4" },
        { offset: "30%", color: "#20BBFF", opacity: "0.2" },
        { offset: "35%", color: "#00AAFF", opacity: "0.1" },
        { offset: "40%", color: "#60DDFF", opacity: isLight ? "0.05" : "0.8" },
        { offset: "45%", color: "#C0FFFF", opacity: isLight ? "0.03" : "0.6" },
        { offset: "50%", color: "#FFFFFF", opacity: isLight ? "0.02" : "0.4" },
        { offset: "55%", color: "#FFFFDD", opacity: isLight ? "0.03" : "0.3" },
        { offset: "60%", color: "#FFFFAA", opacity: isLight ? "0.05" : "0.8" },
        { offset: "65%", color: "#FFFF80", opacity: "0.1" },
        { offset: "70%", color: "#FFEE60", opacity: "0.2" },
        { offset: "75%", color: "#FFDD40", opacity: "0.3" },
        { offset: "80%", color: "#FFCC20", opacity: "0.4" },
        { offset: "85%", color: "#FFBB00", opacity: "0.5" },
        { offset: "90%", color: "#FFAA00", opacity: "0.6" },
        { offset: "95%", color: "#FF9900", opacity: "0.7" },
        { offset: "100%", color: "#FF8800", opacity: "0.8" },
      ];

      radialGradient.innerHTML = colorStops
        .map(
          (stop) =>
            `<stop offset="${stop.offset}" stop-color="${stop.color}" stop-opacity="${stop.opacity}" />`,
        )
        .join("\n");

      defs.appendChild(radialGradient);
      svg.appendChild(defs);

      // Create circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", "0");
      circle.setAttribute("fill", "url(#rainbowGradient)");
      circle.style.opacity = "0.7";
      circle.style.mixBlendMode = "screen";
      svg.appendChild(circle);

      // Add transition styles
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        ::view-transition-old(root) { z-index: var(--transition-z-index-old); }
        ::view-transition-new(root) { z-index: var(--transition-z-index-new); }
      `;
      document.head.appendChild(styleElement);

      // Start view transition
      const transition = document.startViewTransition(async () => {
        toggleTheme();
        await tick(); // Svelte equivalent of flushSync
        document.body.appendChild(svg);
      });

      await transition.ready;

      // Set z-index properties
      document.documentElement.style.setProperty(
        "--transition-z-index-new",
        isLight ? "998" : "999",
      );
      document.documentElement.style.setProperty(
        "--transition-z-index-old",
        isLight ? "999" : "998",
      );

      const duration = 800;
      const easing = "ease-in-out";
      const blurEdgeRatio = Math.min(maxRadius * 0.15, 30);

      // Generate keyframes for the mask animation
      const generateKeyframes = () => {
        const steps = 800;
        const keyframes = [];

        keyframes.push({
          maskImage: `radial-gradient(circle at ${x}px ${y}px, white 0px, white 0px, transparent ${blurEdgeRatio}px)`,
          easing: "ease-in-out",
        });

        for (let i = 1; i < steps; i++) {
          const p = i / steps;
          const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          const sinP = Math.sin(p * Math.PI);
          const currentRadius = eased * maxRadius;

          keyframes.push({
            maskImage: `radial-gradient(circle at ${x}px ${y}px, white 0px, white ${currentRadius}px, transparent ${currentRadius + blurEdgeRatio}px)`,
            backdropFilter: `blur(${sinP * 2}px)`,
            transform: `scale(${1 + sinP * 0.02})`,
            easing: "ease-in-out",
          });
        }

        keyframes.push({
          maskImage: `radial-gradient(circle at ${x}px ${y}px, white 0px, white ${maxRadius}px, transparent ${maxRadius + blurEdgeRatio}px)`,
          backdropFilter: `blur(0px)`,
          transform: `scale(1)`,
          easing: "ease-in-out",
        });

        return keyframes;
      };

      const animOptions: KeyframeAnimationOptions = {
        duration,
        easing,
        direction: isLight ? "reverse" : "normal",
        fill: "forwards",
      };

      // Animate the document element
      document.documentElement.animate(generateKeyframes(), {
        ...animOptions,
        pseudoElement: isLight
          ? "::view-transition-old(root)"
          : "::view-transition-new(root)",
      });

      // Animate the ripple circle
      const rippleAnimation = circle.animate(
        [
          { r: "0", opacity: 0.7 },
          { r: `${maxRadius * 0.8}`, opacity: 0.3 },
          { r: `${maxRadius}`, opacity: 0 },
        ],
        animOptions,
      );

      // Clean up when animation finishes
      rippleAnimation.onfinish = () => {
        svg.remove();
        styleElement.remove();
      };
    } catch (error) {
      console.error("Error during theme transition:", error);
      toggleTheme();
    }
  };

  return { toggleThemeWithAnimation };
}