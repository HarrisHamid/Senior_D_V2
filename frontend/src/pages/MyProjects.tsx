import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, ArrowRight, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { projectService } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import type { ProjectData } from "@/services/project.service";

const MyProjects = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<
    { project: ProjectData; interestedCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    projectService
      .getAllProjects()
      .then((res) => {
        const allProjects: ProjectData[] = res.data.projects;
        const mine = allProjects.filter((p) => p.userId === user.id);
        if (mine.length === 0) {
          setMyProjects([]);
          setLoading(false);
          return;
        }
        Promise.all(
          mine.map((p) =>
            groupService
              .getAllInterestedGroups(p._id)
              .then((r) => ({ project: p, interestedCount: (r.data ?? []).length }))
              .catch(() => ({ project: p, interestedCount: 0 })),
          ),
        )
          .then(setMyProjects)
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, [user]);

  const projectStatus = (p: ProjectData) => {
    if (p.assignedGroup) return { label: "Assigned", color: "#6b7280", bg: "#f3f4f6" };
    if (p.isOpen) return { label: "Open", color: "#059669", bg: "#ecfdf5" };
    return { label: "Closed", color: "#dc2626", bg: "#fef2f2" };
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 w-[3px] rounded-full"
                style={{
                  height: "3.5rem",
                  background: "linear-gradient(to bottom, #9B2335, rgba(155,35,53,0.15))",
                }}
              />
              <div>
                <p
                  className="text-[11px] font-bold uppercase mb-1.5"
                  style={{ letterSpacing: "0.18em", color: "#9B2335" }}
                >
                  Course Coordinator
                </p>
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                  My Projects
                </h1>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Projects you've created and group interest.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end gap-0.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700">{today}</p>
                <p className="text-xs text-gray-400">Stevens Institute of Technology</p>
              </div>
              <Link
                to="/project/add"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
                style={{ background: "#9B2335" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = "#7d1c2b")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = "#9B2335")
                }
              >
                <Plus className="w-4 h-4" /> Add Project
              </Link>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {loading && (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                Loading projects…
              </div>
            )}

            {!loading && myProjects.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600">No projects yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first project to get started.
                </p>
                <Link
                  to="/project/add"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold transition-colors"
                  style={{ color: "#9B2335" }}
                >
                  Add a project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {!loading &&
              myProjects.map(({ project, interestedCount }) => {
                const status = projectStatus(project);
                return (
                  <div
                    key={project._id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-[3px] h-10 rounded-full shrink-0"
                        style={{ background: status.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{project.year}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: status.color, background: status.bg }}
                          >
                            {status.label}
                          </span>
                          {interestedCount > 0 && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-blue-700 bg-blue-50">
                              {interestedCount} interested{" "}
                              {interestedCount === 1 ? "group" : "groups"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/project/${project._id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold transition-colors shrink-0 ml-4"
                      style={{ color: "#9B2335" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#7d1c2b")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#9B2335")
                      }
                    >
                      View <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyProjects;
