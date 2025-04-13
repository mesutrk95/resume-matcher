'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieAnimatedIconProps {
  icon?: string;
  width?: number;
  height?: number;
}

export const LottieAnimatedIcon = ({ icon, width = 20, height = 20 }: LottieAnimatedIconProps) => {
  const [animationData, setAnimationData] = useState<unknown | undefined>();
  const container = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const [isParentHovering, setIsParentHovering] = useState(false);

  useEffect(() => {
    if (!icon) return;
    async function getData() {
      const result = await fetch(icon || '').then(res => res.json());
      setAnimationData(result);
    }
    getData();
  }, [icon]);

  // Setup animation
  useEffect(() => {
    if (!container?.current) return;

    // Find parent element
    if (container.current.parentElement) {
      parentRef.current = container.current.parentElement;

      // Add event listeners to parent
      const parent = parentRef.current;
      const handleMouseEnter = () => setIsParentHovering(true);
      const handleMouseLeave = () => setIsParentHovering(false);

      parent.addEventListener('mouseenter', handleMouseEnter);
      parent.addEventListener('mouseleave', handleMouseLeave);

      // Clean up event listeners
      return () => {
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div ref={container} style={{ width, height }}>
      {typeof animationData !== 'undefined' && (
        <Lottie animationData={animationData} loop={isParentHovering} style={{ width, height }} />
      )}
    </div>
  );
};
