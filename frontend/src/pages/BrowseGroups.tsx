import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Users, Globe, Lock, ArrowRight, Search, Info } from "lucide-react";
import { toast } from "sonner";
import { groupService } from "@/services/group.service";
import type { GroupData } from "@/services/group.service";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
  major?: string;
}

interface PopulatedProject {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  assignedGroup: string | null;
}

interface PopulatedGroup extends Omit<
  GroupData,
  "groupMembers" | "interestedProjects"
> {
  groupMembers: PopulatedMember[];
  interestedProjects: PopulatedProject[];
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] font-bold uppercase text-gray-400"
    style={{ letterSpacing: "0.18em" }}
  >
    {children}
  </p>
);

const BrowseGroups = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Private group join dialog
  const [privateDialogGroup, setPrivateDialogGroup] =
    useState<GroupData | null>(null);
  const [privateCode, setPrivateCode] = useState("");
  const [submittingCode, setSubmittingCode] = useState(false);

  // Group info dialog
  const [infoGroup, setInfoGroup] = useState<GroupData | null>(null);
  const [infoDetail, setInfoDetail] = useState<PopulatedGroup | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  useEffect(() => {
    groupService
      .getAllGroups()
      .then((res) => setGroups(res.data))
      .catch(() => toast.error("Failed to load groups."))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinPublic = async (group: GroupData) => {
    if (!group.groupCode) return;
    setJoiningId(group._id);
    try {
      await groupService.joinGroup(group.groupCode);
      toast.success("Joined group!");
      await refreshUser();
      navigate("/group");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join group.");
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinPrivate = async () => {
    const code = privateCode.trim();
    if (code.length !== 10) {
      toast.error("Group codes are exactly 10 characters.");
      return;
    }
    setSubmittingCode(true);
    try {
      const res = await groupService.joinGroup(code);
      if (res.requestPending) {
        toast.success("Request sent — the group leader will review it.");
        setPrivateDialogGroup(null);
        setPrivateCode("");
      } else {
        toast.success("Joined group!");
        await refreshUser();
        navigate("/group");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid or incorrect code.",
      );
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleOpenInfo = async (group: GroupData) => {
    setInfoGroup(group);
    setInfoDetail(null);
    setInfoLoading(true);
    try {
      const res = await groupService.getGroupById(group._id);
      setInfoDetail(res.data as unknown as PopulatedGroup);
    } catch {
      toast.error("Failed to load group details.");
      setInfoGroup(null);
    } finally {
      setInfoLoading(false);
    }
  };

  const filtered = groups.filter((g) => {
    if (filter === "open" && !g.isOpen) return false;
    if (filter === "closed" && g.isOpen) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const label = (g.name ?? `Group ${g.groupNumber}`).toLowerCase();
      if (!label.includes(q) && !`group ${g.groupNumber}`.includes(q))
        return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedGroups = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterKey = `${filter}:${search}`;
  const prevFilterRef = useRef(filterKey);
  if (prevFilterRef.current !== filterKey) {
    prevFilterRef.current = filterKey;
    setPage(1);
  }

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 w-[3px] rounded-full"
              style={{
                height: "3.5rem",
                background:
                  "linear-gradient(to bottom, #9B2335, rgba(155,35,53,0.15))",
              }}
            />
            <div>
              <p
                className="text-[11px] font-bold uppercase mb-1.5"
                style={{ letterSpacing: "0.18em", color: "#9B2335" }}
              >
                Student Groups
              </p>
              <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                Browse Groups
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Find a group to join or see who's looking for teammates.
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search groups by name or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ ["--tw-ring-color" as string]: "#9B2335" }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {(["all", "open", "closed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize"
              style={
                filter === tab
                  ? { background: "#9B2335", color: "#fff" }
                  : { color: "#6b7280" }
              }
            >
              {tab === "all"
                ? `All (${groups.length})`
                : tab === "open"
                  ? `Open (${groups.filter((g) => g.isOpen).length})`
                  : `Closed (${groups.filter((g) => !g.isOpen).length})`}
            </button>
          ))}
        </div>

        {/* Groups list */}
        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Loading groups…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              No groups found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {pagedGroups.map((group) => {
                const isMyGroup = user?.groupId === group._id;
                const memberCount =
                  group.numberOfMembers ?? group.groupMembers.length;

                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div
                      className="h-[3px]"
                      style={{
                        background:
                          "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
                      }}
                    />
                    <div className="p-5">
                      {/* Name + badges */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-base truncate">
                            {group.name ?? `Group ${group.groupNumber}`}
                          </p>
                          {group.name && !/^Group \d+$/i.test(group.name) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Group {group.groupNumber}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={
                              group.isOpen
                                ? { background: "#ecfdf5", color: "#065f46" }
                                : { background: "#f3f4f6", color: "#6b7280" }
                            }
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: group.isOpen
                                  ? "#10b981"
                                  : "#9ca3af",
                              }}
                            />
                            {group.isOpen ? "Open" : "Closed"}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {group.isPublic ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            {group.isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                      </div>

                      {/* Member count */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <SectionLabel>
                          {group.isPublic
                            ? "Open group"
                            : "Private — enter code to join"}
                        </SectionLabel>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenInfo(group)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="View group details"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {isMyGroup ? (
                            <button
                              onClick={() => navigate("/group")}
                              className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                              style={{ color: "#9B2335" }}
                            >
                              My Group <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : group.isPublic ? (
                            /* Public → direct join */
                            <button
                              onClick={() => handleJoinPublic(group)}
                              disabled={
                                joiningId === group._id || !group.isOpen
                              }
                              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#9B2335] text-white hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {joiningId === group._id
                                ? "Joining…"
                                : group.isOpen
                                  ? "Join"
                                  : "Closed"}
                            </button>
                          ) : (
                            /* Private → open code dialog */
                            <button
                              onClick={() => {
                                setPrivateDialogGroup(group);
                                setPrivateCode("");
                              }}
                              disabled={!group.isOpen}
                              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#9B2335] text-white hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {group.isOpen ? "Enter Code" : "Closed"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Group info dialog */}
      <Dialog
        open={!!infoGroup}
        onOpenChange={(open) => {
          if (!open) {
            setInfoGroup(null);
            setInfoDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle>
                {infoGroup?.name ?? `Group ${infoGroup?.groupNumber}`}
              </DialogTitle>
              {infoGroup && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={
                      infoGroup.isOpen
                        ? { background: "#ecfdf5", color: "#065f46" }
                        : { background: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: infoGroup.isOpen ? "#10b981" : "#9ca3af",
                      }}
                    />
                    {infoGroup.isOpen ? "Open" : "Closed"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {infoGroup.isPublic ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    {infoGroup.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              )}
            </div>
            <DialogDescription>
              {infoGroup?.name ? `Group ${infoGroup.groupNumber} · ` : ""}
              {infoGroup?.numberOfMembers ??
                infoGroup?.groupMembers.length ??
                0}{" "}
              {(infoGroup?.numberOfMembers ??
                infoGroup?.groupMembers.length ??
                0) === 1
                ? "member"
                : "members"}
            </DialogDescription>
          </DialogHeader>

          {infoLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading details…
            </div>
          ) : infoDetail ? (
            <div className="mt-2 space-y-5">
              {/* Members */}
              <div>
                <p
                  className="text-[10px] font-bold uppercase text-gray-400 mb-2"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Members
                </p>
                {infoDetail.groupMembers.length === 0 ? (
                  <p className="text-sm text-gray-400">No members yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {infoDetail.groupMembers.map((m, i) => (
                      <li key={m._id} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {m.name}
                            {i === 0 && (
                              <span className="ml-1.5 text-[10px] font-bold uppercase text-amber-600">
                                Leader
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {m.email}
                            {m.major && (
                              <span className="before:content-['·'] before:mx-1">
                                {m.major}
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Interested Projects */}
              <div>
                <p
                  className="text-[10px] font-bold uppercase text-gray-400 mb-2"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Interested Projects
                </p>
                {infoDetail.interestedProjects.length === 0 ? (
                  <p className="text-sm text-gray-400">None yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {infoDetail.interestedProjects.map((p) => (
                      <li
                        key={p._id}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {p.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Private group join dialog */}
      <Dialog
        open={!!privateDialogGroup}
        onOpenChange={(open) => {
          if (!open) {
            setPrivateDialogGroup(null);
            setPrivateCode("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Join{" "}
              {privateDialogGroup?.name ??
                `Group ${privateDialogGroup?.groupNumber}`}
            </DialogTitle>
            <DialogDescription>
              This is a private group. Enter the invite code shared by a group
              member to request access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Enter 10-character group code"
              value={privateCode}
              onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="font-mono tracking-widest text-center text-base"
              onKeyDown={(e) => e.key === "Enter" && handleJoinPrivate()}
            />
            <Button
              onClick={handleJoinPrivate}
              disabled={submittingCode || privateCode.trim().length !== 10}
              className="w-full bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0"
            >
              {submittingCode ? "Sending request…" : "Request to Join"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseGroups;
