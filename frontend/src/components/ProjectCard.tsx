import { Link } from "react-router-dom";
import type { ProjectData } from "@/services/project.service";

const projectStatus = (p: ProjectData) => {
  if (p.assignedGroup) return "Assigned";
  if (p.isOpen) return "Open";
  return "Closed";
};

const statusStyles: Record<string, React.CSSProperties> = {
  Open: {
    background: "linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)",
    color: "#065f46",
    border: "1px solid #6ee7b7",
  },
  Closed: {
    background: "linear-gradient(180deg, #fee2e2 0%, #fecaca 100%)",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },
  Assigned: {
    background: "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
    color: "#374151",
    border: "1px solid #d1d5db",
  },
};

export const ProjectCard = ({ project }: { project: ProjectData }) => {
  const status = projectStatus(project);

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 1px hsl(351,50%,70%), 0 8px 24px rgba(155,35,53,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 1px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)";
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, hsl(351, 63%, 37%), hsl(0, 80%, 52%))",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-[#0d0d0d] leading-snug">
            {project.name}
          </h3>
          <span
            className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={statusStyles[status]}
          >
            {status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Majors */}
        {project.majors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Required Majors
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.majors.map((rm, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{
                    background:
                      "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                    border: "1px solid #e5e7eb",
                    color: "#374151",
                  }}
                >
                  {rm.major}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}
            >
              {project.internal ? "Internal" : "External"}
            </span>
            <span>•</span>
            <span className="truncate max-w-[120px]">{project.sponsor}</span>
          </div>
          <Link
            to={`/project/${project._id}`}
            className="relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-foreground overflow-hidden transition-all duration-200"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(242,242,242,0.72) 100%)",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.07)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 1px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 1px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.07)";
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
