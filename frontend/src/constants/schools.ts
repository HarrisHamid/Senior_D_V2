export const SCHOOLS = [
  {
    name: "School of Engineering and Science",
    majors: [
      "Biology",
      "Biomedical Engineering",
      "Chemical Biology",
      "Chemical Engineering",
      "Chemistry",
      "Civil Engineering",
      "Computer Engineering",
      "Electrical Engineering",
      "Engineering Management",
      "Environmental Engineering",
      "Mathematics",
      "Mechanical Engineering",
      "Naval Engineering",
      "Physics",
      "Software Engineering",
    ],
  },
  {
    name: "School of Business",
    majors: [
      "Accounting & Analytics",
      "Business & Technology",
      "Economics",
      "Finance",
      "Information Systems",
      "Management",
      "Marketing Innovation & Analytics",
      "Quantitative Finance",
    ],
  },
  {
    name: "School of Humanities, Arts and Social Sciences",
    majors: [
      "History",
      "Literature",
      "Music & Technology",
      "Philosophy",
      "Science Communication",
      "Social Sciences",
      "Visual Arts & Technology",
    ],
  },
  {
    name: "School of Computing",
    majors: ["Artificial Intelligence", "Computer Science", "Cybersecurity"],
  },
] as const;

export const ALL_MAJORS = SCHOOLS.flatMap((s) => [...s.majors]);
