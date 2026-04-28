import type { Project, Group } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "AI-Powered Healthcare Diagnostic System",
    description:
      "Develop a machine learning system to assist doctors in diagnosing diseases from medical imaging data. The system should use computer vision and deep learning to analyze X-rays, MRIs, and CT scans.",
    advisors: [{ name: "Dr. Sarah Johnson", email: "sjohnson@stevens.edu" }],
    sponsors: [{ name: "Stevens Medical Center", email: "smc@stevens.edu" }],
    requiredMajors: [
      { major: "Computer Science", quantity: 2 },
      { major: "Biomedical Engineering", quantity: 1 },
    ],
    status: "Open",
    sponsorType: "Internal",
    year: 2024,
  },
  {
    id: "2",
    name: "Smart Campus Energy Management",
    description:
      "Create an IoT-based system to monitor and optimize energy consumption across the Stevens campus. Include real-time monitoring, predictive analytics, and automated control systems.",

    advisors: [
      { name: "Dr. Michael Chen", email: "mchen@stevens.edu" },
      { name: "Dr. Emily Roberts", email: "eroberts@stevens.edu" },
    ],
    sponsors: [
      {
        name: "Stevens Facilities Management",
        email: "facilities@stevens.edu",
      },
    ],
    requiredMajors: [
      { major: "Electrical Engineering", quantity: 2 },
      { major: "Computer Engineering", quantity: 1 },
    ],
    status: "Open",
    sponsorType: "Internal",
    year: 2024,
  },
  {
    id: "3",
    name: "Blockchain-Based Supply Chain Tracker",
    description:
      "Develop a decentralized application for tracking products through the supply chain using blockchain technology. Focus on transparency, security, and real-time updates.",

    advisors: [{ name: "Dr. James Wilson", email: "jwilson@stevens.edu" }],
    sponsors: [
      { name: "Global Logistics Inc.", email: "contact@globallogistics.com" },
    ],
    requiredMajors: [{ major: "Computer Science", quantity: 3 }],
    status: "Assigned",
    sponsorType: "External",
    year: 2024,
    assignedGroupId: "1",
  },
  {
    id: "4",
    name: "Augmented Reality Navigation System",
    description:
      "Create an AR mobile application to help visitors navigate the Stevens campus. Include indoor positioning, 3D wayfinding, and points of interest.",

    advisors: [{ name: "Dr. Lisa Anderson", email: "landerson@stevens.edu" }],
    sponsors: [
      { name: "Stevens Innovation Center", email: "innovation@stevens.edu" },
    ],
    requiredMajors: [
      { major: "Computer Science", quantity: 2 },
      { major: "Software Engineering", quantity: 1 },
    ],
    status: "Open",
    sponsorType: "Internal",
    year: 2024,
  },
  {
    id: "5",
    name: "Cybersecurity Threat Detection Platform",
    description:
      "Build an advanced threat detection system using machine learning to identify and respond to cybersecurity threats in real-time. Include network monitoring and automated response capabilities.",

    advisors: [{ name: "Dr. Robert Martinez", email: "rmartinez@stevens.edu" }],
    sponsors: [
      { name: "CyberSecure Solutions", email: "info@cybersecure.com" },
    ],
    requiredMajors: [
      { major: "Computer Science", quantity: 2 },
      { major: "Cybersecurity", quantity: 1 },
    ],
    status: "Open",
    sponsorType: "External",
    year: 2025,
  },
  {
    id: "6",
    name: "Autonomous Drone Delivery System",
    description:
      "Design and implement an autonomous drone system for package delivery on campus. Include obstacle avoidance, route optimization, and secure package handling.",

    advisors: [{ name: "Dr. Amanda Taylor", email: "ataylor@stevens.edu" }],
    sponsors: [{ name: "Stevens Robotics Lab", email: "robotics@stevens.edu" }],
    requiredMajors: [
      { major: "Computer Engineering", quantity: 2 },
      { major: "Mechanical Engineering", quantity: 1 },
    ],
    status: "Open",
    sponsorType: "Internal",
    year: 2025,
  },
  {
    id: "7",
    name: "Mental Health Support Chatbot",
    description:
      "Develop an AI-powered chatbot to provide mental health support and resources to students. Use natural language processing and sentiment analysis.",

    advisors: [{ name: "Dr. Patricia Lee", email: "plee@stevens.edu" }],
    sponsors: [
      { name: "Stevens Counseling Center", email: "counseling@stevens.edu" },
    ],
    requiredMajors: [
      { major: "Computer Science", quantity: 2 },
      { major: "Psychology", quantity: 1 },
    ],
    status: "Closed",
    sponsorType: "Internal",
    year: 2024,
  },
  {
    id: "8",
    name: "Sustainable Transportation Analytics",
    description:
      "Create a data analytics platform to track and optimize sustainable transportation options in Hoboken. Include bike-sharing, electric vehicles, and public transit.",

    advisors: [{ name: "Dr. David Brown", email: "dbrown@stevens.edu" }],
    sponsors: [
      { name: "City of Hoboken", email: "transportation@hoboken.gov" },
    ],
    requiredMajors: [
      { major: "Computer Science", quantity: 1 },
      { major: "Data Science", quantity: 2 },
    ],
    status: "Open",
    sponsorType: "External",
    year: 2025,
  },
];

export const mockGroups: Group[] = [
  {
    id: "1",
    groupNumber: "G001",
    code: "ABC1234567",

    members: [
      { userId: "1", name: "John Doe", email: "jdoe@stevens.edu" },
      { userId: "2", name: "Jane Smith", email: "jsmith@stevens.edu" },
      { userId: "3", name: "Mike Johnson", email: "mjohnson@stevens.edu" },
    ],
    interestedProjects: ["3"],
    status: "Open",
    assignedProjectId: "3",
  },
  {
    id: "2",
    groupNumber: "G002",
    code: "XYZ9876543",

    members: [
      { userId: "4", name: "Sarah Williams", email: "swilliams@stevens.edu" },
      { userId: "5", name: "Tom Brown", email: "tbrown@stevens.edu" },
    ],
    interestedProjects: ["1", "2", "4"],
    status: "Open",
  },
  {
    id: "3",
    groupNumber: "G003",
    code: "DEF5554444",

    members: [
      { userId: "6", name: "Emily Davis", email: "edavis@stevens.edu" },
      { userId: "7", name: "Chris Wilson", email: "cwilson@stevens.edu" },
      { userId: "8", name: "Alex Martinez", email: "amartinez@stevens.edu" },
    ],
    interestedProjects: ["2"],
    status: "Closed",
  },
  {
    id: "4",
    groupNumber: "G004",
    code: "GHI1112223",

    members: [
      { userId: "9", name: "Rachel Green", email: "rgreen@stevens.edu" },
      { userId: "10", name: "Ross Geller", email: "rgeller@stevens.edu" },
    ],
    interestedProjects: ["5", "6"],
    status: "Open",
  },
];

export const majors = [
  "Computer Science",
  "Computer Engineering",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Biomedical Engineering",
  "Cybersecurity",
  "Data Science",
  "Psychology",
];
