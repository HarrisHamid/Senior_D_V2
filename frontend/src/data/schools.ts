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

export type SchoolName = (typeof SCHOOLS)[number]["name"];
export type MajorName = (typeof SCHOOLS)[number]["majors"][number];

export const SCHOOL_NAMES = SCHOOLS.map((school) => school.name);
export const MAJORS_BY_SCHOOL = SCHOOLS.reduce(
  (majorsBySchool, school) => ({
    ...majorsBySchool,
    [school.name]: school.majors,
  }),
  {} as Record<SchoolName, readonly MajorName[]>,
);

export const ALL_MAJORS = SCHOOLS.flatMap((school) => school.majors);
