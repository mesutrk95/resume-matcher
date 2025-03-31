import React, { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";

interface LottieAnimatedIconProps {
  icon?: string;
  width?: number;
  height?: number;
}

export const LottieAnimatedIcon = ({ 
  icon, 
  width = 20, 
  height = 20 
}: LottieAnimatedIconProps) => {
  const container = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isParentHovering, setIsParentHovering] = useState(false);
  const parentRef = useRef<HTMLElement | null>(null);

  // Setup animation
  useEffect(() => {
    if (!container?.current) return;

    // Initialize lottie animation
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: icon || "/iconly/Inbox.json",
    });

    // Store the animation reference
    animationRef.current = anim;

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
        anim.destroy();
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
    
    // Fallback cleanup if no parent
    return () => anim.destroy();
  }, [icon]);

  // Handle hover effects
  useEffect(() => {
    const anim = animationRef.current;
    if (!anim) return;

    if (isParentHovering) {
      anim.play();
    } else {
      anim.stop();
    }
  }, [isParentHovering]);

  return (
    <div
      ref={container}
      style={{ width, height }}
    />
  );
};