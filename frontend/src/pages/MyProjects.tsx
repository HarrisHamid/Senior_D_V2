import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, ArrowRight, Plus, Search, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { projectService } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import type { ProjectData } from "@/services/project.service";
import Pagination from "@/components/Pagination";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "open" | "closed" | "assigned";

const MyProjects = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<
    { project: ProjectData; interestedCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    projectService
      .getAllProjects({ limit: 1000 })
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

  const filtered = myProjects.filter(({ project }) => {
    const status = projectStatus(project);
    if (filter === "open" && status.label !== "Open") return false;
    if (filter === "closed" && status.label !== "Closed") return false;
    if (filter === "assigned" && status.label !== "Assigned") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !project.name.toLowerCase().includes(q) &&
        !project.sponsor.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedProjects = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteProjectId);
      setMyProjects((prev) => prev.filter(({ project }) => project._id !== deleteProjectId));
      toast.success("Project deleted successfully.");
      setDeleteProjectId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete project.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

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
              <Link
                to="/project/add"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Project
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by project name or sponsor…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ ["--tw-ring-color" as string]: "#9B2335" }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {(["all", "open", "closed", "assigned"] as const).map((tab) => {
            const count =
              tab === "all"
                ? myProjects.length
                : myProjects.filter(({ project }) => {
                    const s = projectStatus(project);
                    return s.label.toLowerCase() === tab;
                  }).length;
            return (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setPage(1); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize"
                style={
                  filter === tab
                    ? { background: "#9B2335", color: "#fff" }
                    : { color: "#6b7280" }
                }
              >
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        {!loading && myProjects.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing{" "}
            {filtered.length === 0
              ? 0
              : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}
            –{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} projects
          </div>
        )}

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

            {!loading && myProjects.length > 0 && filtered.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600">No projects match</p>
                <p className="text-sm text-gray-400 mt-1">Try a different filter or search.</p>
              </div>
            )}

            {!loading &&
              pagedProjects.map(({ project, interestedCount }) => {
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
                        <p className="text-xs text-gray-500 mt-0.5">{project.year} · {project.sponsor}</p>
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

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <button
                        onClick={() => setDeleteProjectId(project._id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/project/${project._id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[#9B2335] hover:text-[#7f1d2d] transition-colors"
                      >
                        View <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      </div>

      <Dialog open={!!deleteProjectId} onOpenChange={(open) => { if (!open) setDeleteProjectId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteProjectId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProjects;
