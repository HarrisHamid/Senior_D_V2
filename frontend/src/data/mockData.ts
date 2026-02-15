// Mock data for development — remove when API integration is ready
import type { Course, Project, Group } from "@/types/course.types";

export const mockCourses: Course[] = [
  {
    _id: "course-001",
    userId: "user-001",
    name: "Dr. Sarah Chen",
    email: "schen@stevens.edu",
    program: "Computer Science",
    courseNumber: "CS 546",
    courseSection: "A",
    season: "Spring",
    year: 2026,
    minGroupSize: 3,
    maxGroupSize: 5,
    courseCode: "ABC123",
    lastGroupNumber: 2,
    closed: false,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
];

export const mockProjects: Project[] = [
  {
    _id: "project-001",
    name: "Stevens Marketplace",
    description:
      "A marketplace platform for Stevens students to buy, sell, and trade items within the campus community.",
    status: "Open",
    courseId: "course-001",
    requiredMajors: [
      { major: "Computer Science", count: 2 },
      { major: "Information Systems", count: 1 },
    ],
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    _id: "project-002",
    name: "Campus Event Tracker",
    description:
      "A web application that aggregates and displays campus events, allowing students to RSVP and share events.",
    status: "Open",
    courseId: "course-001",
    requiredMajors: [
      { major: "Computer Science", count: 2 },
      { major: "Business Intelligence", count: 1 },
    ],
    createdAt: "2026-01-21T00:00:00Z",
    updatedAt: "2026-01-21T00:00:00Z",
  },
  {
    _id: "project-003",
    name: "Study Group Finder",
    description:
      "An application that matches students with study groups based on their courses, schedules, and learning preferences.",
    status: "Closed",
    courseId: "course-001",
    requiredMajors: [{ major: "Computer Science", count: 3 }],
    createdAt: "2026-01-22T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
];

export const mockGroups: Group[] = [
  {
    _id: "group-001",
    groupNumber: 1,
    courseId: "course-001",
    groupMembers: [
      { _id: "user-010", name: "Alice Johnson", email: "ajohnson@stevens.edu" },
      { _id: "user-011", name: "Bob Smith", email: "bsmith@stevens.edu" },
      { _id: "user-012", name: "Carlos Rivera", email: "crivera@stevens.edu" },
    ],
    groupCode: "GRP-A1B2",
    isOpen: true,
    interestedProjects: ["project-001", "project-002"],
    assignedProject: null,
    createdAt: "2026-01-25T00:00:00Z",
    updatedAt: "2026-01-25T00:00:00Z",
  },
  {
    _id: "group-002",
    groupNumber: 2,
    courseId: "course-001",
    groupMembers: [
      { _id: "user-013", name: "Diana Park", email: "dpark@stevens.edu" },
      { _id: "user-014", name: "Ethan Myers", email: "emyers@stevens.edu" },
    ],
    groupCode: "GRP-C3D4",
    isOpen: true,
    interestedProjects: ["project-003"],
    assignedProject: null,
    createdAt: "2026-01-26T00:00:00Z",
    updatedAt: "2026-01-26T00:00:00Z",
  },
];
