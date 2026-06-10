"use client";

import { useEffect, useState } from "react";
import { useInView } from "motion/react";
import { useRef } from "react";

export function Counter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const numericValue = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = numericValue;
    const totalFrames = duration * 60;
    const increment = end / totalFrames;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, numericValue, duration]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}
