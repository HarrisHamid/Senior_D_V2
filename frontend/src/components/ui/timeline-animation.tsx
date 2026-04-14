import { motion, useInView, type Variants, type HTMLMotionProps } from "motion/react";
import React, { type ElementType, type RefObject, useRef } from "react";

type TimelineContentProps<T extends ElementType = "div"> = {
  as?: T;
  animationNum: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
} & Omit<HTMLMotionProps<"div">, "ref"> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof HTMLMotionProps<"div">>;

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function TimelineContent<T extends ElementType = "div">({
  as,
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps<T>) {
  const localRef = useRef<HTMLElement>(null);
  const ref = (timelineRef ?? localRef) as RefObject<HTMLElement>;
  const isInView = useInView(localRef, { once: true, margin: "-5% 0px" });

  const variants = customVariants ?? defaultVariants;

  // Build the motion component with the correct element type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionComponent = motion((as ?? "div") as ElementType) as React.ComponentType<any>;

  void ref;

  return (
    <MotionComponent
      ref={localRef}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={variants}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </MotionComponent>
  );
}
