import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { courseService } from "@/services/course.service";
import { projectService } from "@/services/project.service";
import type { CourseData } from "@/services/course.service";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_MAJORS = [
  "Artificial Intelligence",
  "Biology",
  "Biomedical Engineering",
  "Chemical Biology",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Cybersecurity",
  "Electrical Engineering",
  "Engineering Management",
  "Environmental Engineering",
  "Mathematics",
  "Mechanical Engineering",
  "Naval Engineering",
  "Physics",
  "Software Engineering",
  "Accounting & Analytics",
  "Business & Technology",
  "Economics",
  "Finance",
  "Information Systems",
  "Management",
  "Marketing Innovation & Analytics",
  "Quantitative Finance",
  "History",
  "Literature",
  "Music & Technology",
  "Philosophy",
  "Science Communication",
  "Social Sciences",
  "Visual Arts & Technology",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactEntry {
  name: string;
  email: string;
}

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "course coordinator") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    courseService.getMyCourses().then((res) => {
      setCourses(res.data.courses);
      setCoursesLoading(false);
    }).catch(() => setCoursesLoading(false));
  }, []);

  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [internal, setInternal] = useState("false");
  const [sponsor, setSponsor] = useState("");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [advisors, setAdvisors] = useState<ContactEntry[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Dynamic field helpers ---

  const addContact = () => setContacts((prev) => [...prev, { name: "", email: "" }]);
  const removeContact = (i: number) => setContacts((prev) => prev.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: "name" | "email", value: string) =>
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const addAdvisor = () => setAdvisors((prev) => [...prev, { name: "", email: "" }]);
  const removeAdvisor = (i: number) => setAdvisors((prev) => prev.filter((_, idx) => idx !== i));
  const updateAdvisor = (i: number, field: "name" | "email", value: string) =>
    setAdvisors((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const selectedMajors = new Set(majors);
  const addMajor = () => {
    const next = AVAILABLE_MAJORS.find((m) => !selectedMajors.has(m));
    if (next) setMajors((prev) => [...prev, next]);
  };
  const removeMajor = (i: number) => setMajors((prev) => prev.filter((_, idx) => idx !== i));
  const updateMajor = (i: number, value: string) =>
    setMajors((prev) => prev.map((m, idx) => (idx === i ? value : m)));

  const availableForIndex = (i: number) =>
    AVAILABLE_MAJORS.filter((m) => !selectedMajors.has(m) || m === majors[i]);

  // --- Validation & submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!courseId) { setError("Please select a course"); return; }
    if (!name.trim()) { setError("Project name is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      setError("Year must be between 2020 and 2100");
      return;
    }
    if (!sponsor.trim()) { setError("Sponsor name is required"); return; }

    for (const [idx, c] of contacts.entries()) {
      if (!c.name.trim() || !c.email.trim()) {
        setError(`Sponsor contact ${idx + 1}: both name and email are required`);
        return;
      }
      if (!EMAIL_REGEX.test(c.email)) {
        setError(`Sponsor contact ${idx + 1}: invalid email address`);
        return;
      }
    }

    for (const [idx, a] of advisors.entries()) {
      if (!a.name.trim() || !a.email.trim()) {
        setError(`Advisor ${idx + 1}: both name and email are required`);
        return;
      }
      if (!EMAIL_REGEX.test(a.email)) {
        setError(`Advisor ${idx + 1}: invalid email address`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await projectService.createProject({
        courseId,
        name: name.trim(),
        description: description.trim(),
        year: yearNum,
        internal: internal === "true",
        sponsor: sponsor.trim(),
        contacts: contacts.map((c) => ({ name: c.name.trim(), email: c.email.trim() })),
        advisors: advisors.map((a) => ({ name: a.name.trim(), email: a.email.trim() })),
        majors: majors.map((m) => ({ major: m })),
      });
      toast.success("Project created successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9B2335] rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <CardTitle className="text-2xl">Add a Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!coursesLoading && courses.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm mb-4">
                You need to create a course before adding a project.{" "}
                <Link to="/course/create" className="underline font-medium">
                  Create a course
                </Link>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course */}
              <div>
                <Label htmlFor="courseId">Course</Label>
                <Select value={courseId} onValueChange={setCourseId} disabled={isSubmitting || coursesLoading}>
                  <SelectTrigger id="courseId" className="mt-1">
                    <SelectValue placeholder={coursesLoading ? "Loading courses…" : "Select a course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.program} {c.courseNumber}-{c.courseSection} · {c.season} {c.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project name */}
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Campus Energy Management"
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project goals, scope, and deliverables…"
                  maxLength={5000}
                  rows={4}
                  required
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>

              {/* Year & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2025"
                    min={2020}
                    max={2100}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="internal">Project Type</Label>
                  <Select value={internal} onValueChange={setInternal} disabled={isSubmitting}>
                    <SelectTrigger id="internal" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">External</SelectItem>
                      <SelectItem value="true">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sponsor */}
              <div>
                <Label htmlFor="sponsor">Sponsor</Label>
                <Input
                  id="sponsor"
                  type="text"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Sponsor Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Sponsor Contacts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                    disabled={isSubmitting}
                  >
                    + Add Contact
                  </Button>
                </div>
                {contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No contacts added.</p>
                )}
                <div className="space-y-3">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateContact(i, "name", e.target.value)}
                          placeholder="Name"
                          disabled={isSubmitting}
                        />
                        <Input
                          type="email"
                          value={c.email}
                          onChange={(e) => updateContact(i, "email", e.target.value)}
                          placeholder="Email"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500 mt-0.5"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Advisors</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdvisor}
                    disabled={isSubmitting}
                  >
                    + Add Advisor
                  </Button>
                </div>
                {advisors.length === 0 && (
                  <p className="text-sm text-muted-foreground">No advisors added.</p>
                )}
                <div className="space-y-3">
                  {advisors.map((a, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={a.name}
                          onChange={(e) => updateAdvisor(i, "name", e.target.value)}
                          placeholder="Name"
                          disabled={isSubmitting}
                        />
                        <Input
                          type="email"
                          value={a.email}
                          onChange={(e) => updateAdvisor(i, "email", e.target.value)}
                          placeholder="Email"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdvisor(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500 mt-0.5"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Majors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Required Majors</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMajor}
                    disabled={isSubmitting || majors.length >= AVAILABLE_MAJORS.length}
                  >
                    + Add Major
                  </Button>
                </div>
                {majors.length === 0 && (
                  <p className="text-sm text-muted-foreground">No majors added.</p>
                )}
                <div className="space-y-2">
                  {majors.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Select
                        value={m}
                        onValueChange={(val) => updateMajor(i, val)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableForIndex(i).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMajor(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || courses.length === 0}
                className="w-full bg-[#9B2335] hover:bg-[#7a1c2a] text-white"
              >
                {isSubmitting ? "Creating Project…" : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
