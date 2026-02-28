export const validCourseData = {
  program: "Computer Science",
  courseNumber: "CS4991",
  courseSection: "001",
  season: "Fall" as const,
  year: 2025,
  minGroupSize: 2,
  maxGroupSize: 5,
};

export const validProjectData = {
  name: "Smart Campus Navigation System",
  description: "A mobile app for indoor navigation at university buildings.",
  sponsor: "Stevens Institute of Technology",
  advisors: [{ name: "Dr. Smith", email: "smith@test.com" }],
  contacts: [{ name: "Jane Doe", email: "jane@sponsor.com" }],
  majors: [{ major: "Computer Science" }, { major: "Electrical Engineering" }],
  year: 2025,
  internal: false,
};
