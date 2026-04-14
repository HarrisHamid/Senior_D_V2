import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { GridPattern } from "@/components/ui/grid-pattern";
import { useRef } from "react";
import {
  FolderOpen,
  Users,
  GraduationCap,
  LogIn,
} from "lucide-react";

const showcaseCards = [
  {
    id: "browse-projects",
    name: "Browse Projects",
    description: "Explore senior design projects across all disciplines.",
    imgSrc:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=870&auto=format&fit=crop",
    icon: FolderOpen,
  },
  {
    id: "form-teams",
    name: "Form Teams",
    description: "Connect with fellow students and build your dream team.",
    imgSrc:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=869&auto=format&fit=crop",
    icon: Users,
  },
  {
    id: "real-experience",
    name: "Real Experience",
    description: "Work with industry sponsors and faculty advisors.",
    imgSrc:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=870&auto=format&fit=crop",
    icon: GraduationCap,
  },
];

function HeroSection() {
  const timelineRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.18,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <main ref={timelineRef} className="relative bg-white min-h-screen overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,white_40%,transparent_100%)]"
      />
      {/* Navbar */}
      <TimelineContent
        as="header"
        animationNum={1}
        timelineRef={timelineRef}
        className="w-full top-0 left-0 z-50 sticky border-b border-border/60 bg-white/95 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="Stevens Senior Design"
              className="h-9 w-9 rounded object-cover"
            />
            <span className="text-lg font-semibold text-foreground hidden sm:block">
              Stevens Senior Design
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Sign In — glass button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-foreground transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0,0,0,0.10)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.75)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            {/* Get Started — glass button with primary tint */}
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold text-white transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, hsl(351,63%,37%) 0%, hsl(351,63%,50%) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid hsl(351,63%,55%)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </TimelineContent>

      {/* Hero Content */}
      <div className="pt-24 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="w-fit mx-auto max-w-5xl text-center space-y-5">
          {/* Label */}
          <TimelineContent
            as="p"
            animationNum={2}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="text-sm text-muted-foreground tracking-wide"
          >
            Welcome to the
          </TimelineContent>

          {/* Heading */}
          <TimelineContent
            as="h1"
            animationNum={3}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="text-5xl sm:text-6xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.05] text-[#0d0d0d] whitespace-nowrap"
          >
            Senior Design{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, hsl(351, 63%, 32%), hsl(11, 80%, 52%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Marketplace
            </span>
          </TimelineContent>

          {/* Subheading */}
          <TimelineContent
            as="p"
            animationNum={4}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="text-sm text-muted-foreground tracking-wide"
          >
            Find a Team, Select a Project, Continue to Innovate
          </TimelineContent>
        </article>

        {/* Showcase Grid */}
        <div className="grid md:grid-cols-3 grid-cols-2 gap-5 pt-20">
          {showcaseCards.map((card, index) => (
            <TimelineContent
              key={card.id}
              animationNum={index + 6}
              timelineRef={timelineRef}
              className={cn(
                "relative aspect-video rounded-xl overflow-hidden cursor-pointer group",
                "ring-1 ring-border/50 hover:ring-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              )}
            >
              <figure className="relative h-full w-full">
                <img
                  src={card.imgSrc}
                  alt={card.name}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />
              </figure>

              <ProgressiveBlur
                className="pointer-events-none absolute bottom-0 left-0 h-[35%] w-full"
                blurIntensity={0.4}
              />

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">
                  {card.name}
                </h3>
                <p className="text-xs text-white/70 mt-0.5 hidden sm:block">
                  {card.description}
                </p>
              </div>
            </TimelineContent>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Stevens Institute of Technology. All rights reserved.</p>
            <div className="mt-2">
              <a
                href="https://www.stevens.edu"
                className="hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stevens.edu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default HeroSection;
