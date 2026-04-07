"use client";

import {
  motion,
  useInView,
  useMotionValue,
  usePageInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface ScrollVelocityContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface ScrollVelocityRowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  baseVelocity?: number;
  direction?: 1 | -1;
  scrollReactivity?: boolean;
}

export function ScrollVelocityContainer({
  className,
  children,
  ...props
}: ScrollVelocityContainerProps) {
  return (
    <div className={cn("flex w-full flex-col overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function ScrollVelocityRow({
  className,
  children,
  baseVelocity = 5,
  direction = 1,
  scrollReactivity = true,
  ...props
}: ScrollVelocityRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const baseX = useMotionValue(0);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(rowRef, { amount: 0.1 });
  const isPageInView = usePageInView();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothedVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothedVelocity, [-1500, 0, 1500], [-3, 0, 3]);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      setSegmentWidth(node.offsetWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  useEffect(() => {
    if (segmentWidth > 0) {
      baseX.set(-segmentWidth);
    }
  }, [baseX, segmentWidth]);

  const shouldAnimate =
    !prefersReducedMotion && segmentWidth > 0 && isInView && isPageInView;

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    let frameId = 0;
    let previousTime: number | null = null;

    const animate = (time: number) => {
      if (previousTime !== null) {
        const delta = time - previousTime;
        const directionFactor = direction === 1 ? 1 : -1;
        const baseSpeed = segmentWidth * (baseVelocity / 100) * (delta / 1000);
        const scrollBoost = scrollReactivity
          ? Math.abs(velocityFactor.get()) * baseSpeed * 0.65
          : 0;
        let nextX = baseX.get() + directionFactor * (baseSpeed + scrollBoost);

        if (directionFactor === 1 && nextX >= 0) {
          nextX -= segmentWidth;
        }

        if (directionFactor === -1 && nextX <= -segmentWidth * 2) {
          nextX += segmentWidth;
        }

        baseX.set(nextX);
      }

      previousTime = time;
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    baseVelocity,
    baseX,
    direction,
    scrollReactivity,
    segmentWidth,
    shouldAnimate,
    velocityFactor,
  ]);

  if (prefersReducedMotion) {
    return (
      <div
        ref={rowRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        {...props}
      >
        <div ref={measureRef} className={cn("flex w-max items-center", className)}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={rowRef} className="overflow-hidden" {...props}>
      <motion.div className="flex w-max items-center" style={{ x: baseX }}>
        <div aria-hidden className={cn("flex shrink-0 items-center", className)}>
          {children}
        </div>
        <div ref={measureRef} className={cn("flex shrink-0 items-center", className)}>
          {children}
        </div>
        <div aria-hidden className={cn("flex shrink-0 items-center", className)}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
