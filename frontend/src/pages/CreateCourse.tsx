import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { courseService } from "@/services/course.service";
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

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In-page role guard
  useEffect(() => {
    if (user && user.role !== "course coordinator") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [program, setProgram] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [courseSection, setCourseSection] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [minGroupSize, setMinGroupSize] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const yearNum = parseInt(year, 10);
    const minSize = parseInt(minGroupSize, 10);
    const maxSize = parseInt(maxGroupSize, 10);

    if (!season) {
      setError("Please select a season");
      return;
    }

    if (yearNum < 2020 || yearNum > 2100) {
      setError("Year must be between 2020 and 2100");
      return;
    }

    if (maxSize < minSize) {
      setError("Maximum group size must be greater than or equal to minimum group size");
      return;
    }

    setIsSubmitting(true);

    try {
      await courseService.createCourse({
        program,
        courseNumber,
        courseSection,
        season,
        year: yearNum,
        minGroupSize: minSize,
        maxGroupSize: maxSize,
      });
      toast.success("Course created successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
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
              <CardTitle className="text-2xl">Create a Course</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Program */}
              <div>
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. Computer Science"
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Course Number & Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseNumber">Course Number</Label>
                  <Input
                    id="courseNumber"
                    type="text"
                    value={courseNumber}
                    onChange={(e) => setCourseNumber(e.target.value)}
                    placeholder="e.g. CS 492"
                    maxLength={20}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="courseSection">Section</Label>
                  <Input
                    id="courseSection"
                    type="text"
                    value={courseSection}
                    onChange={(e) => setCourseSection(e.target.value)}
                    placeholder="e.g. A"
                    maxLength={5}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Season & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="season">Season</Label>
                  <Select
                    value={season}
                    onValueChange={setSeason}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="season" className="mt-1">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              {/* Group Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minGroupSize">Min Group Size</Label>
                  <Input
                    id="minGroupSize"
                    type="number"
                    value={minGroupSize}
                    onChange={(e) => setMinGroupSize(e.target.value)}
                    placeholder="e.g. 3"
                    min={1}
                    max={20}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxGroupSize">Max Group Size</Label>
                  <Input
                    id="maxGroupSize"
                    type="number"
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(e.target.value)}
                    placeholder="e.g. 5"
                    min={1}
                    max={20}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none text-white transition-all duration-200"
              >
                {isSubmitting ? "Creating Course..." : "Create Course"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
