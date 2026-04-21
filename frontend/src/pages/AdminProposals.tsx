import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Download, Eye, FilePlus2, RefreshCw, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courseService, type CourseData } from "@/services/course.service";
import {
  proposalService,
  type ProposalData,
  type ProposalRole,
  type ProposalStatus,
} from "@/services/proposal.service";

const STATUSES: ProposalStatus[] = [
  "Pending Review",
  "Under Review",
  "Approved",
  "Rejected",
  "Matched",
];

const statusTone: Record<ProposalStatus, string> = {
  "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Matched: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminProposals() {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selected, setSelected] = useState<ProposalData | null>(null);
  const [role, setRole] = useState<ProposalRole | "all">("all");
  const [status, setStatus] = useState<ProposalStatus | "all">("all");
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [matchTarget, setMatchTarget] = useState("");
  const [courseTarget, setCourseTarget] = useState("");

  const query = useMemo(
    () => ({
      role,
      status,
      department: department.trim() || undefined,
      search: search.trim() || undefined,
      limit: 100,
    }),
    [role, status, department, search],
  );

  const load = async () => {
    setLoading(true);
    try {
      const [proposalRes, courseRes] = await Promise.all([
        proposalService.listProposals(query),
        courseService.getMyCourses(),
      ]);
      setProposals(proposalRes.data.proposals);
      setCourses(courseRes.data.courses);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  const openDetails = (proposal: ProposalData) => {
    setSelected(proposal);
    setNotes(proposal.internalNotes ?? "");
    setMatchTarget("");
    setCourseTarget(courses[0]?._id ?? "");
  };

  const saveStatus = async (proposal: ProposalData, nextStatus: ProposalStatus) => {
    setSaving(true);
    try {
      const res = await proposalService.updateProposal(proposal._id, {
        status: nextStatus,
        internalNotes: proposal._id === selected?._id ? notes : proposal.internalNotes,
      });
      setProposals((prev) =>
        prev.map((item) => (item._id === proposal._id ? res.data.proposal : item)),
      );
      if (selected?._id === proposal._id) setSelected(res.data.proposal);
      toast.success("Proposal updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update proposal");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await proposalService.updateProposal(selected._id, {
        internalNotes: notes,
      });
      setSelected(res.data.proposal);
      setProposals((prev) =>
        prev.map((item) => (item._id === selected._id ? res.data.proposal : item)),
      );
      toast.success("Notes saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const matchSelected = async () => {
    if (!selected || !matchTarget) return;
    setSaving(true);
    try {
      await proposalService.matchProposal(selected._id, matchTarget);
      toast.success("Proposals matched.");
      await load();
      setSelected(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to match proposals");
    } finally {
      setSaving(false);
    }
  };

  const convertSelected = async () => {
    if (!selected || !courseTarget) return;
    setSaving(true);
    try {
      const res = await proposalService.convertToProject(selected._id, courseTarget);
      toast.success("Project created from proposal.");
      setSelected(res.data.proposal);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const compatibleMatches = selected
    ? proposals.filter(
        (proposal) =>
          proposal._id !== selected._id &&
          proposal.role !== selected.role &&
          proposal.status !== "Rejected",
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#9B2335]">
              Proposal Review
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Proposals
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button asChild className="bg-[#9B2335] text-white hover:bg-[#7a1c2a]">
              <a href={proposalService.exportCsvUrl(query)}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </a>
            </Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proposals"
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={(value) => setRole(value as ProposalRole | "all")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => setStatus(value as ProposalStatus | "all")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="Department"
          />
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Proposal</th>
                  <th className="px-4 py-3">Submitter</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Loading proposals...
                    </td>
                  </tr>
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No proposals match the current filters.
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">{proposal.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {proposal.proposalId} · {proposal.role}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p>{proposal.fullName}</p>
                        <p className="text-xs text-muted-foreground">{proposal.email}</p>
                      </td>
                      <td className="px-4 py-4">{proposal.department}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={statusTone[proposal.status]}>
                          {proposal.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={proposal.status}
                            onValueChange={(value) =>
                              saveStatus(proposal, value as ProposalStatus)
                            }
                          >
                            <SelectTrigger className="h-9 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => openDetails(proposal)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.proposalId} · {selected.role} · {selected.department}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Submitter</Label>
                  <p className="mt-1 text-sm">{selected.fullName}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selected.status}
                    onValueChange={(value) =>
                      saveStatus(selected, value as ProposalStatus)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="mt-1 whitespace-pre-wrap rounded-md border bg-gray-50 p-3 text-sm">
                  {selected.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {selected.role === "student" ? (
                  <>
                    <DetailBlock label="Problem Statement" value={selected.problemStatement} />
                    <DetailBlock label="Desired Skills" value={selected.desiredSkills} />
                    <DetailBlock label="Preferred Advisor" value={selected.preferredFacultyAdvisor} />
                  </>
                ) : (
                  <>
                    <DetailBlock label="Industry Partner" value={selected.industryPartner} />
                    <DetailBlock label="Required Skills" value={selected.requiredSkills} />
                    <DetailBlock label="Expected Deliverables" value={selected.expectedDeliverables} />
                    <DetailBlock label="Resources / Budget" value={selected.availableResources} />
                  </>
                )}
              </div>

              <div>
                <Label>Internal Notes</Label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button variant="outline" className="mt-2" onClick={saveNotes} disabled={saving}>
                  Save Notes
                </Button>
              </div>

              <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div>
                  <Label>Match with Proposal</Label>
                  <Select value={matchTarget} onValueChange={setMatchTarget}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a compatible proposal" />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibleMatches.map((proposal) => (
                        <SelectItem key={proposal._id} value={proposal._id}>
                          {proposal.proposalId} · {proposal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={matchSelected}
                    disabled={saving || !matchTarget}
                  >
                    Match Proposals
                  </Button>
                </div>
                <div>
                  <Label>Seed Project</Label>
                  <Select value={courseTarget} onValueChange={setCourseTarget}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.program} {course.courseNumber}-{course.courseSection}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="mt-2 bg-[#9B2335] text-white hover:bg-[#7a1c2a]"
                    onClick={convertSelected}
                    disabled={
                      saving ||
                      !courseTarget ||
                      !!selected.createdProject ||
                      !["Approved", "Matched"].includes(selected.status)
                    }
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                  {selected.createdProject && typeof selected.createdProject !== "string" && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Created project:{" "}
                      <Link className="font-medium text-[#9B2335]" to={`/project/${selected.createdProject._id}`}>
                        {selected.createdProject.name}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-1 whitespace-pre-wrap rounded-md border bg-gray-50 p-3 text-sm">
        {value}
      </p>
    </div>
  );
}
