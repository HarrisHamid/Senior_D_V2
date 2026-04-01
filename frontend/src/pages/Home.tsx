import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, FolderOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Home = () => {
  const [courseCode, setCourseCode] = useState("");
  const navigate = useNavigate();

  const handleJoinCourse = () => {
    if (courseCode.length === 7) {
      toast.success("Course found! Please login to continue.");
      navigate("/login");
    } else {
      toast.error("Please enter a valid 7-character course code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                S
              </span>
            </div>
            <span className="text-lg font-semibold">Stevens Senior Design</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground">
            Stevens Senior Design
            <span className="block text-primary mt-2">Marketplace</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with innovative capstone projects, form teams, and bring
            your ideas to life
          </p>

          {/* Course Code Input */}
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Have a course code?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 7-character code"
                      value={courseCode}
                      onChange={(e) =>
                        setCourseCode(e.target.value.toUpperCase())
                      }
                      maxLength={7}
                      className="uppercase"
                    />
                    <Button onClick={handleJoinCourse}>Join</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Browse Projects</h3>
                <p className="text-muted-foreground">
                  Explore a wide range of senior design projects from various
                  disciplines and industries
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Form Teams</h3>
                <p className="text-muted-foreground">
                  Connect with fellow students and create groups to tackle
                  challenging projects together
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real Experience</h3>
                <p className="text-muted-foreground">
                  Work on real-world projects with industry sponsors and
                  experienced faculty advisors
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join hundreds of Stevens students working on innovative senior
                design projects
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register" className="gap-2">
                  Create Your Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Stevens Institute of Technology. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link to="/faq" className="hover:text-primary">
                FAQ
              </Link>
              <span>•</span>
              <a
                href="https://www.stevens.edu"
                className="hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stevens.edu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
