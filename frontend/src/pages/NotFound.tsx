import { Link } from "react-router-dom";
import { GridPattern } from "@/components/ui/grid-pattern";
import BorkenAttila from "@/assets/borkenattila.png";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-8xl font-bold mb-8" style={{ color: "#9B2335" }}>
          Error 404
        </h1>

        <img
          src={BorkenAttila}
          alt="Broken Attila the Duck"
          className="w-64 h-64 object-contain mb-8"
        />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Uh oh. Not good.
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          This page doesn't exist. Even Attila is confused.
        </p>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold text-white bg-[#c23b52] hover:bg-[#ad3248] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(194,59,82,0.45)] active:translate-y-0 active:shadow-none active:bg-[#9B2335] transition-all duration-200"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
