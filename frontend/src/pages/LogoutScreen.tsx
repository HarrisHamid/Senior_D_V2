import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Home } from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";
import AttilaImg from "@/assets/Attila.png";

export default function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* ── Left panel ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 md:px-16 bg-white overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <img
              src="/logo.jpg"
              alt="Senior Design Marketplace"
              className="h-12 w-12 rounded-lg object-cover"
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p
              className="text-[11px] font-bold uppercase mb-2"
              style={{ letterSpacing: "0.18em", color: "#9B2335" }}
            >
              Stevens Institute of Technology
            </p>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
              You've been
              <br />
              signed out.
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Thanks for using the Senior Design Marketplace. Your session has
              ended safely.
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-8 h-px w-12"
            style={{
              background:
                "linear-gradient(90deg, #9B2335, rgba(155,35,53,0.15))",
            }}
          />

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Sign In Again
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#9B2335] hover:text-[#9B2335] transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-12 text-xs text-gray-400">
            &copy; 2026 Anthony Curcio, Harris Hamid, Marcus Hom, Michael Loff, Nicholas Mirigliani, Andrew Tarnoski. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel — Attila hero ── */}
      <div className="relative hidden md:block md:w-[55%]">
        <img
          src={AttilaImg}
          alt="Attila the Duck"
          className="h-full w-full object-cover object-center"
        />
        {/* Blend left edge into white */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)",
          }}
        />
        {/* Red vignette at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(155,35,53,0.20) 0%, transparent 50%)",
          }}
        />
        {/* Watermark */}
        <div className="absolute bottom-8 right-8">
          <p
            className="text-xs font-bold uppercase text-white/50"
            style={{ letterSpacing: "0.2em" }}
          >
            Senior Design Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
