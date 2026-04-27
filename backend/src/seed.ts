import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.model";
import { Project } from "./models/Project.model";
import { Group } from "./models/Group.model";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

// Hardcoded dev group codes (10 chars each)
const GROUP_CODES = {
  g1: "GRP1NEURAL",
  g2: "GRP2BYTEBR",
  g3: "GRP3STACKO",
  g4: "GRP4DEBUGD",
  g5: "GRP5LAMBDA",
  g6: "GRP6CIRCUI",
  g7: "GRP7VOLTAG",
};

// Passwords are passed as plaintext. The User model pre-save hook hashes them
// with bcrypt before writing to MongoDB, so plaintext is never stored.
const DEV_PASSWORD = "Password123!";

async function seed(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("Connected to MongoDB");

    //  Clear
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Group.deleteMany({}),
    ]);

    //  Coordinators
    console.log("Seeding coordinators...");
    const [coord1, coord2] = await Promise.all([
      new User({
        name: "Dr. Sarah Chen",
        email: "s.chen@stevens.edu",
        password: DEV_PASSWORD,
        role: "course coordinator",
      }).save(),
      new User({
        name: "Dr. Michael Torres",
        email: "m.torres@stevens.edu",
        password: DEV_PASSWORD,
        role: "course coordinator",
      }).save(),
    ]);

    //  Students
    console.log("Seeding students...");

    const mkStudent = (name: string, email: string, major: string) =>
      new User({
        name,
        email,
        password: DEV_PASSWORD,
        role: "student",
        major,
      }).save();

    // Group 1 — Neural Knights (4 students)
    const [s1, s2, s3, s4] = await Promise.all([
      mkStudent("Alex Johnson", "ajohnson@stevens.edu", "Computer Science"),
      mkStudent(
        "Emily Rodriguez",
        "erodriguez@stevens.edu",
        "Computer Engineering",
      ),
      mkStudent("Marcus Williams", "mwilliams@stevens.edu", "Computer Science"),
      mkStudent("Sophie Park", "spark@stevens.edu", "Computer Engineering"),
    ]);

    // Group 2 — Byte Brigade (4 students)
    const [s5, s6, s7, s8] = await Promise.all([
      mkStudent("Daniel Kim", "dkim@stevens.edu", "Computer Science"),
      mkStudent("Aisha Patel", "apatel@stevens.edu", "Computer Engineering"),
      mkStudent("Ryan Thompson", "rthompson@stevens.edu", "Computer Science"),
      mkStudent("Natalie Brown", "nbrown@stevens.edu", "Computer Engineering"),
    ]);

    // Group 3 — Stack Overflow (4 students)
    const [s9, s10, s11, s12] = await Promise.all([
      mkStudent("Jordan Lee", "jlee@stevens.edu", "Computer Science"),
      mkStudent("Priya Sharma", "psharma@stevens.edu", "Computer Engineering"),
      mkStudent("Chris Martinez", "cmartinez@stevens.edu", "Computer Science"),
      mkStudent("Hannah Wilson", "hwilson@stevens.edu", "Computer Engineering"),
    ]);

    // Group 4 — Debug Dynasty (3 students)
    const [s13, s14, s15] = await Promise.all([
      mkStudent("Tyler Davis", "tdavis@stevens.edu", "Computer Science"),
      mkStudent(
        "Maya Anderson",
        "manderson@stevens.edu",
        "Computer Engineering",
      ),
      mkStudent("Sam Nguyen", "snguyen@stevens.edu", "Computer Science"),
    ]);

    // Group 5 — Lambda Legion (3 students)
    const [s16, s17, s18] = await Promise.all([
      mkStudent("Isabella Clark", "iclark@stevens.edu", "Computer Engineering"),
      mkStudent("Ethan White", "ewhite@stevens.edu", "Computer Science"),
      mkStudent("Layla Hassan", "lhassan@stevens.edu", "Computer Engineering"),
    ]);

    // Group 6 — Circuit Breakers (4 students)
    const [s19, s20, s21, s22] = await Promise.all([
      mkStudent("James Cooper", "jcooper@stevens.edu", "Computer Science"),
      mkStudent("Olivia Turner", "oturner@stevens.edu", "Computer Engineering"),
      mkStudent("Noah Bennett", "nbennett@stevens.edu", "Computer Science"),
      mkStudent(
        "Ava Mitchell",
        "amitchell@stevens.edu",
        "Computer Engineering",
      ),
    ]);

    // Group 7 — Voltage Vanguard (4 students)
    const [s23, s24, s25, s26] = await Promise.all([
      mkStudent("Liam Garcia", "lgarcia@stevens.edu", "Computer Science"),
      mkStudent(
        "Zoe Robinson",
        "zrobinson@stevens.edu",
        "Computer Engineering",
      ),
      mkStudent("Mason Hall", "mhall@stevens.edu", "Computer Science"),
      mkStudent("Chloe Adams", "cadams@stevens.edu", "Computer Engineering"),
    ]);

    //  Projects
    console.log("Seeding projects...");

    const [p1, p2, p3, p4, p5] = await Promise.all([
      new Project({
        userId: coord1._id,
        name: "AI-Powered Medical Diagnosis Assistant",
        description:
          "Develop a machine learning system that assists physicians in diagnosing diseases by analyzing patient data, medical images, and historical records. The system provides differential diagnoses with confidence scores and highlights relevant factors to support clinical decision-making.",
        advisors: [{ name: "Dr. Lisa Nguyen", email: "lnguyen@healthmed.edu" }],
        sponsor: "HealthTech Inc.",
        contacts: [
          { name: "Robert Chen", email: "r.chen@healthtech.com" },
          { name: "Sandra Lee", email: "s.lee@healthtech.com" },
        ],
        majors: [
          { major: "Computer Science" },
          { major: "Biomedical Engineering" },
        ],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Smart Campus Energy Management System",
        description:
          "Build an IoT-based platform to monitor and optimize energy consumption across university buildings. The system collects real-time sensor data, predicts usage patterns using ML, and automatically adjusts HVAC and lighting to reduce energy waste by at least 20%.",
        advisors: [{ name: "Dr. Paul Rivers", email: "p.rivers@stevens.edu" }],
        sponsor: "Stevens Facilities & Operations",
        contacts: [{ name: "Janet Morrison", email: "j.morrison@stevens.edu" }],
        majors: [
          { major: "Computer Science" },
          { major: "Electrical Engineering" },
        ],
        year: 2025,
        internal: true,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Real-Time Traffic Optimization Platform",
        description:
          "Create a distributed system that processes live traffic data from city sensors and cameras to dynamically optimize signal timing. The platform reduces average commute times during peak hours by routing traffic flow through an adaptive algorithm.",
        advisors: [{ name: "Dr. Ahmed Hassan", email: "a.hassan@stevens.edu" }],
        sponsor: "Hoboken Transportation Authority",
        contacts: [
          { name: "Maria Gonzalez", email: "m.gonzalez@hobokennj.gov" },
          { name: "Thomas Park", email: "t.park@hobokennj.gov" },
        ],
        majors: [{ major: "Computer Science" }, { major: "Civil Engineering" }],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Blockchain-Based Academic Credential Verification",
        description:
          "Design and implement a decentralized system for issuing, storing, and verifying academic credentials on a blockchain network. Students and institutions can share tamper-proof digital diplomas and transcripts with employers and universities instantly.",
        advisors: [{ name: "Dr. Rachel Kim", email: "r.kim@stevens.edu" }],
        sponsor: "EdVerify Corp",
        contacts: [{ name: "David Okafor", email: "d.okafor@edverify.io" }],
        majors: [{ major: "Computer Science" }],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Autonomous Drone Delivery Route Planner",
        description:
          "Develop a route planning and fleet management system for last-mile autonomous drone delivery. The solution handles dynamic obstacle avoidance, weather conditions, airspace regulations, battery constraints, and package prioritization for a fleet of 50+ concurrent drones.",
        advisors: [{ name: "Dr. Kevin Zhang", email: "k.zhang@stevens.edu" }],
        sponsor: "QuickShip Logistics",
        contacts: [{ name: "Amanda Foster", email: "a.foster@quickship.com" }],
        majors: [
          { major: "Computer Science" },
          { major: "Mechanical Engineering" },
        ],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
    ]);

    const [p6, p7, p8] = await Promise.all([
      new Project({
        userId: coord1._id,
        name: "NLP Legal Document Analysis Tool",
        description:
          "Build a natural language processing application that extracts key clauses, identifies potential risks, and summarizes complex legal contracts. Supports multiple document formats and provides actionable insights for paralegals and attorneys during contract review.",
        advisors: [{ name: "Dr. Monica Reyes", email: "m.reyes@stevens.edu" }],
        sponsor: "LexAI Solutions",
        contacts: [{ name: "Jonathan Gray", email: "j.gray@lexai.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2025,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Accessible Learning Platform for Visually Impaired Students",
        description:
          "Design an inclusive e-learning platform with full screen reader compatibility, audio descriptions for visual content, and Braille display support. Enables visually impaired students to navigate and complete coursework with the same efficiency as sighted peers.",
        advisors: [{ name: "Dr. Sarah Chen", email: "s.chen@stevens.edu" }],
        sponsor: "AccessEd Foundation",
        contacts: [{ name: "Patricia Walsh", email: "p.walsh@accessed.org" }],
        majors: [
          { major: "Computer Science" },
          { major: "Human-Computer Interaction" },
        ],
        year: 2026,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Predictive Maintenance System for Manufacturing",
        description:
          "Develop an IoT-integrated predictive maintenance platform that uses sensor data from industrial equipment to forecast failures before they occur. Reduces unplanned downtime by 30% through real-time anomaly detection and automated maintenance scheduling.",
        advisors: [{ name: "Dr. Frank Liu", email: "f.liu@stevens.edu" }],
        sponsor: "Apex Manufacturing Corp",
        contacts: [{ name: "Christine Baker", email: "c.baker@apexmfg.com" }],
        majors: [
          { major: "Computer Science" },
          { major: "Industrial Engineering" },
        ],
        year: 2026,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
    ]);

    const [p9, p10, p11] = await Promise.all([
      new Project({
        userId: coord2._id,
        name: "Solar-Powered IoT Environmental Monitoring Network",
        description:
          "Design and build a self-sustaining network of solar-powered sensor nodes that continuously monitor air quality, temperature, humidity, and particulate matter across urban environments. Data is transmitted wirelessly to a central dashboard for real-time environmental analysis.",
        advisors: [
          { name: "Dr. Michael Torres", email: "m.torres@stevens.edu" },
        ],
        sponsor: "GreenTech Industries",
        contacts: [{ name: "Samantha Cruz", email: "s.cruz@greentech.com" }],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Environmental Engineering" },
        ],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord2._id,
        name: "Smart Grid Dynamic Load Balancing",
        description:
          "Develop an embedded control system for dynamically balancing loads across a smart electrical grid. Integrates renewable energy sources, battery storage, and real-time demand forecasting to minimize grid stress and improve resilience during peak consumption periods.",
        advisors: [
          { name: "Dr. Elena Sokolova", email: "e.sokolova@stevens.edu" },
        ],
        sponsor: "PowerGrid Solutions Inc.",
        contacts: [
          { name: "Kevin Marsh", email: "k.marsh@powergrid.com" },
          { name: "Linda Yu", email: "l.yu@powergrid.com" },
        ],
        majors: [{ major: "Electrical Engineering" }],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord2._id,
        name: "Wearable Cardiac Monitoring Device",
        description:
          "Engineer a compact wearable ECG device capable of continuous heart rhythm monitoring with real-time arrhythmia detection. Must achieve medical-grade signal fidelity, 72-hour battery life, Bluetooth data transmission, and comply with FDA Class II medical device requirements.",
        advisors: [
          { name: "Dr. Carla Romero", email: "c.romero@hackensackumc.org" },
        ],
        sponsor: "MedDevice Corp",
        contacts: [{ name: "Brian Steele", email: "b.steele@meddevice.com" }],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Biomedical Engineering" },
        ],
        year: 2025,
        internal: false,
        isOpen: true,
        assignedGroup: null,
      }).save(),
    ]);

    // 2023 archive projects
    await Promise.all([
      new Project({
        userId: coord1._id,
        name: "AIxandria: AI Tools for Tomorrow's Education",
        description:
          "An online education platform designed to empower Ukrainian educators by leveraging AI and ML technologies. The platform offers localized AI-generated content and resources tailored to the Ukrainian educational context, interactive AI-powered chatbots for personalized guidance, and an accessible interface requiring no prior AI or ML knowledge. AIxandria aims to reduce educator workload, improve mental health and well-being, and enable teachers to focus on delivering high-quality education.",
        advisors: [],
        sponsor: "NGO Volunteer Promotion Center Volonter.org",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Anti-Copy-Paster-Python Plugin",
        description:
          "A plugin that detects when a user copies and pastes a section of their own code and refactors the software to minimize redundancy. Given a set of parameters, the plugin determines if pasted code should be flagged for refactoring, notifies the user with the option to approve, and performs refactoring by replacing duplicate code sections with calls to a newly created method. The project also includes a companion website serving as a repository for project information, user support, and documentation for future development teams.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Prof. Eman AlOmar",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "AntiCopyPaster IntelliJ Plugin",
        description:
          "An IntelliJ plugin designed to improve the quality of code written by developers in real-time. As soon as a developer pastes code, the entire file is checked for duplicates. If duplicates are found, the user is notified and clicking the notification triggers an automated refactoring process that extracts duplicates into a single instance, reducing tech debt and improving overall code quality.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Prof. Eman AlOmar",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Barcode Blitz",
        description:
          "A 3D first-person game built for the Life Skills Software platform, designed to teach special-needs students workplace skills in a warehouse environment. The game features three levels representing different job roles: Order Picker, Order Packer, and Returns Processor. Each level simulates real warehouse responsibilities using a barcode scanner to help students develop spatial awareness, accuracy, time management, and technical proficiency in preparation for independent adult life.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Life Skills Software",
        contacts: [{ name: "Nick Gattuso" }, { name: "Mary McKeon" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Barista Bonanza",
        description:
          "An educational pixel-art style game developed for the Life Skills Software platform. Players take on the role of a barista, learning the ingredients and recipes for popular coffee drinks. As the player progresses, more coffee varieties are introduced and the number of customers increases, creating a simple yet engaging gameplay loop designed to build real-world skills for special-needs students.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Life Skills Software",
        contacts: [{ name: "Mary McKeon" }, { name: "Nicholas Gattuso" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "ChatVPT",
        description:
          "VPT.FIT is a mobile fitness application that creates personalized workout experiences. It analyzes user fitness history, available equipment, and goals to generate custom workouts. The goal is to provide an accessible, adaptive personal training experience that improves workout effectiveness and engagement.",
        advisors: [],
        sponsor: "David Echevarria",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "ChatVPT AI Workout ChatBot",
        description:
          "ChatVPT (Chat Virtual Personal Trainer) is an AI-powered workout chatbot that provides interactive, conversational fitness guidance. Users input available equipment and workout duration, and the system generates personalized workouts. It is designed to simulate the experience of speaking with a real personal trainer, offering feedback and adaptive workout planning.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "David Echevarria",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "COVER.AI",
        description:
          "CoverAI is a browser extension and web application that helps users automatically generate customized cover letters for job applications. It extracts job descriptions and requirements, parses uploaded resumes to identify relevant skills, and generates tailored cover letters. The platform also allows users to edit and view past generated cover letters, streamlining the job application process.",
        advisors: [
          { name: "Prof. David Klappholz" },
          { name: "Prof. Zhongyuan (Annie) Yu" },
        ],
        sponsor: "No Sponsor",
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Cybersecurity for Critical Infrastructure and IoT under 5G and 6G",
        description:
          "This project focuses on improving the security of 5G and emerging 6G network infrastructures, particularly in critical infrastructure and IoT systems. It identifies vulnerabilities in 5G protocols using fuzz testing, where invalid, unexpected, and random inputs are used to test system robustness. The goal is to enhance the security, reliability, and efficiency of future communication networks while preparing for evolving 6G standards.",
        advisors: [
          { name: "Prof. Ying Wang" },
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
        ],
        sponsor: "DARPA",
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Daia",
        description:
          "Daia is a mobile health application designed as a personal diabetes management companion. It integrates with continuous glucose monitors to provide real-time blood sugar tracking, alerts for hypoglycemic events, and AI-powered personalized health recommendations. The app allows users to manage emergency contacts, dynamically control data sharing, and automatically notify contacts during critical blood sugar events. Daia aims to simplify diabetes management and improve emergency response through accessible, real-time communication and intelligent data integration.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "No Sponsor",
        contacts: [{ name: "Arianna Gehan" }, { name: "Frank Pinnola" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Data Leakage in ML Models",
        description:
          "This project develops a plugin that helps machine learning engineers detect and prevent data leakage in their models. Data leakage occurs when training data unintentionally includes information from outside the training set, leading to overly optimistic performance estimates and poor generalization. The plugin identifies multiple types of leakage—including multi-test leakage, overlap leakage, and preprocessing leakage—and provides suggestions and quick fixes to improve code quality and model reliability.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Eman Abdullah Alomar",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Development of Aerial Access Points for UAV (Drone) Networks in SAGIN for 5G and 6G Communications",
        description:
          "This project develops machine learning systems for UAV identification and authorization within Space-Air-Ground Integrated Networks (SAGIN) for 5G and 6G communications. It collects UAV flight and communication data under various weather and line-of-sight conditions and uses classification models to identify UAVs based on vibration signatures and communication signals. The system aims to improve UAV security, authentication, and network reliability in critical infrastructure environments.",
        advisors: [{ name: "Ying Wang, Ph.D." }],
        sponsor: "DARPA / Stevens MACC Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Digital Coach",
        description:
          "Digital Coach is an AI-powered application that helps users prepare for job interviews and improve professional communication skills. It allows users to practice custom and pre-made interview questions, receive feedback on their responses, and refine their performance over time. The platform also includes a networking feature where users can share posts, ask for advice, and connect with others to support their career development. The goal is to increase user confidence and readiness for real-world interviews and professional environments.",
        advisors: [
          { name: "Matthew Wade", email: "mwade@stevens.edu" },
          { name: "James Curley", email: "curleyjf@email.com" },
        ],
        sponsor: "No Sponsor",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Good Hood",
        description:
          "Good Hood is a platform designed to connect individuals and organizations seeking humanitarian aid with those willing to provide donations or support. It enables users to create and discover donation requests, view needs on an interactive map, and coordinate assistance for communities in need. The goal is to reduce friction in the donation process and improve access to humanitarian support by centralizing requests and making them easily discoverable based on location and need.",
        advisors: [
          { name: "Anatolii Mazarchuk" },
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
        ],
        sponsor: "Anatolii Mazarchuk",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Grid Discovery",
        description:
          "Grid Discovery is a platform that automates and simplifies the feasibility analysis process for community microgrid planning. It helps engineers evaluate distributed energy systems such as solar and battery setups by analyzing building energy demand, electrical rates, and infrastructure constraints. The system enables users to visualize energy usage, simulate grid configurations, estimate infrastructure costs, and assess renewable energy potential. The goal is to reduce the time, cost, and complexity required to evaluate microgrid projects and improve energy resilience planning for communities.",
        advisors: [
          { name: "Dr. Philip Odonkor" },
          { name: "Matthew Cristaldi" },
        ],
        sponsor: "Grid Discovery",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Harbor Currents",
        description:
          "Harbor Currents is a mobile application designed to assist navigation in the NY/NJ port region by visualizing water current forecasts. It displays modeled and observed current data, including direction and magnitude, to help cargo ships safely navigate challenging waterways such as the Kill van Kull strait. The system allows users to compare different forecast models, toggle measurement units, and view environmental conditions in real time to improve maritime safety and efficiency in one of the busiest ports in the United States.",
        advisors: [
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
          { name: "Philip Orton" },
          { name: "Jon Miller" },
        ],
        sponsor: "No Sponsor",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Hubba",
        description:
          "Hubba is a game streaming and video sharing platform designed to centralize gaming content from multiple sources into one unified experience. It improves interactions between users, content creators, and gaming organizations by offering curated content, personalized recommendations, and customizable profiles. Users can explore gaming clips, videos, livestreams, updates, and events in a single platform while connecting with creators and communities that match their interests. Hubba also enables organizations such as esports teams and game developers to engage directly with the gaming community through announcements, events, and subscriptions.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Matthew Wade",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Jasmin",
        description:
          "Jasmin is a mental health platform designed to connect patients with licensed psychologists in a personalized and accessible way. It allows psychologists to create detailed profiles highlighting their expertise and experience, while patients can browse and select professionals that best match their needs. The platform supports flexible consultations through video and chat, along with scheduling and reminders, aiming to reduce barriers such as long wait times and limited access to care. Jasmin also includes an AI assistant to enhance user support and guidance throughout the mental health journey.",
        advisors: [],
        sponsor: "No Sponsor",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Lenovo Integrated Sustainability Assistant",
        description:
          "Lenovo Integrated Sustainability Assistant (L.I.S.A) is a web application designed to help users reduce their digital carbon footprint and promote more sustainable digital behavior. The platform allows users to register their devices, track their environmental impact, and work toward sustainability goals. Users earn points based on goal completion, which can be used to redeem rewards, and can compare progress through leaderboards. The system is designed to encourage long-term sustainable habits while increasing awareness of the environmental impact of everyday digital activity.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Lenovo",
        contacts: [
          { name: "Greg McNeil" },
          { name: "Keryn Blaiss" },
          { name: "Jake Luria" },
          { name: "Matthew Kohut" },
        ],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "LifeSkills AI Integration",
        description:
          "LifeSkills AI Integration enhances an educational gaming platform by providing teachers with AI-generated insights based on student gameplay data. The system collects session and performance information through an SDK embedded in games, stores it in a centralized database, and processes it to generate meaningful analytics. Educators can query this data to better understand student behavior, identify learning gaps, and adjust instruction based on evidence-driven insights.",
        advisors: [
          { name: "Khayyam Saleem" },
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
        ],
        sponsor: "LifeSkills Software",
        contacts: [{ name: "Khayyam Saleem" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Maestro+",
        description:
          "Maestro+ is a web platform designed to improve access to high-quality and equitable music education by connecting students, instructors, schools, and organizations in a single unified system. It provides separate experiences for students and instructors, including dashboards for managing lessons, profiles, and scheduling. The system supports lesson booking through an integrated calendar tool and enables communication between users through a built-in chat feature used before scheduling lessons. It also includes safeguards such as parental controls for underage users to ensure safe and appropriate interactions. Overall, the platform streamlines lesson discovery, scheduling, and communication in the music education space.",
        advisors: [
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
          { name: "John Kalajian" },
          { name: "Charles Kalajian" },
        ],
        sponsor: "Maestro+",
        contacts: [{ name: "John Kalajian" }, { name: "Charles Kalajian" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Nummle",
        description:
          "Nummle is a food discovery platform designed to help users with dietary restrictions safely find meals that match their needs. It focuses on improving transparency around ingredients and allergens while also adding a social layer where users can share recommendations and reviews from people they trust. The platform allows users to filter food options based on allergies or diets, view detailed meal information, and explore restaurant ratings based on both taste and dietary accuracy. It aims to make ordering food easier, safer, and more reliable for users with specific nutritional requirements.",
        advisors: [
          { name: "Matthew Wade", email: "mwade@stevens.edu" },
          { name: "Ron Gorai" },
          { name: "Aaron Klappholz", email: "aklappho@stevens.edu" },
        ],
        sponsor: "No Sponsor",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Onset Worldwide Employee Training Manual",
        description:
          "This system is an internal training management platform built for Onset Worldwide to replace fragmented spreadsheet-based tracking. It centralizes employee training records, allowing staff and managers to assign, complete, track, and review required training activities in one place. The application supports role-based access, training assignments, completion tracking, and digital sign-offs to improve accountability and compliance. It also includes tools for searching records, exporting training data for reporting purposes, and sending reminders for upcoming or overdue training tasks. Overall, the system improves organization, safety oversight, and operational efficiency for workforce training management.",
        advisors: [],
        sponsor: "Onset Worldwide",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "OPENSIOP",
        description:
          "OPENSIOP is a simulation platform that models nuclear conflict scenarios using geographic, population, and strategic weapon data. It enables researchers to explore potential outcomes of nuclear engagements by visualizing strikes, target zones, and resulting impact patterns on an interactive map. The system supports importing and managing datasets such as cities, populations, and missile locations, and allows users to run simulations and export results for further analysis. It is designed to support research into strategic planning, impact modeling, and large-scale scenario evaluation.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "No Sponsor",
        contacts: [{ name: "Alex Wellerstein" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "PairProj",
        description:
          "PairProj is a collaborative platform designed to help developers find, join, and manage software projects with others who share similar skills and interests. It focuses on connecting users based on experience level and technical goals, making it easier for students and early-career developers to gain real-world project experience. The system allows users to search for projects, build skill-based profiles, and connect with teammates for collaboration. It also supports project organization features that help teams coordinate work and form structured development groups. Overall, the platform is aimed at improving access to meaningful collaborative coding experience and reducing barriers for beginners entering the field.",
        advisors: [
          { name: "Matthew Wade", email: "mwade@stevens.edu" },
          { name: "James Curley", email: "curleyjf@email.com" },
        ],
        sponsor: "No Sponsor",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Securing the Unprotected: Enhancing Heartbeat Messaging for MAVLink UAV Communications",
        description:
          "This project investigates security weaknesses in UAV communication systems, focusing on early-stage connection messages used during drone-controller handshakes. It explores how these initial signaling mechanisms can be exploited and evaluates multiple authentication strategies to prevent unauthorized access. The work includes simulating UAV network environments, analyzing communication behavior under attack conditions, and designing a lightweight authentication approach suitable for resource-constrained aerial systems. The final contribution proposes an authentication method that strengthens access control while maintaining efficiency for real-world drone applications.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Ying Wang",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "SpringBoard",
        description:
          "SpringBoard is a recruiting and performance management platform built for cross country and track and field programs. It streamlines how coaches discover and evaluate athletes by centralizing performance data, academic information, and recruitment preferences in a single dashboard. Athletes can showcase their profiles, update training and race results, and receive insights into their progress, while coaches can efficiently compare prospects and manage outreach without relying on fragmented tools. The system also helps high school athletes identify programs that align with their athletic and academic goals, improving transparency and efficiency in the recruiting process.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "No Sponsor",
        contacts: [
          { name: "Andrew Springer" },
          { name: "Matthew Wade", email: "mwade@stevens.edu" },
        ],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: true,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "The PV-Rex App",
        description:
          "The PV-Rex App is a virtual reality-based rehabilitation system that combines guided exercise and meditation environments with physiological feedback. It provides two adaptive VR experiences: one focused on structured physical activity and another designed for relaxation and stress reduction. Using real-time biometric signals, the system adjusts environmental visuals and audio to respond to the user's physical and emotional state, aiming to support both physical rehabilitation and mental well-being. The platform is designed to help users improve endurance, coordination, and relaxation through immersive, sensor-driven interactions in a controlled virtual setting.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Raviraj Nataraj",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Time Trek - LifeSkills",
        description:
          "Time Trek is an educational 3D game developed to help K-12 students build time management and planning skills through interactive gameplay. Players take on the role of a time-traveling character who must complete objectives across different historical settings while carefully managing in-game constraints such as suspicion and task order. The experience is structured as a progression of levels where success depends on prioritization, planning ahead, and efficient decision-making. By combining gameplay with learning objectives, the project turns time management practice into an engaging, goal-driven experience.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "LifeSkills Software",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "TLCengine Chat Search",
        description:
          "TLCengine Chat Search is a conversational real estate search tool that allows users to find housing options using natural language instead of traditional filter-based search interfaces. Users can type detailed or casual descriptions of their ideal home, and the system converts those inputs into structured search parameters to return relevant property listings. The goal is to simplify and streamline the home-buying process by making property search more intuitive, reducing the need for manual filtering and complex configuration.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "TLCengine",
        contacts: [{ name: "Krishna Malyala", email: "krishna@tlcengine.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "TLCengine Commute Team",
        description:
          "The TLCengine Commute Team project focuses on improving multimodal commute analysis within real estate decision-making by enhancing how users evaluate travel time, cost, and route accessibility. The system explores isochrone-based mapping to visualize reachable areas from a given location within a selected time window and supports multiple transportation modes such as walking, driving, and public transit. The goal is to produce more accurate and scalable commute insights that help users better understand real-world travel constraints when evaluating housing options.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "TLCengine",
        contacts: [{ name: "Krishna Malyala", email: "krishna@tlcengine.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "TLCengine Intelligent Automation Homebuying Experience",
        description:
          "The TLCengine Intelligent Automation Homebuying Experience is a web-based tool designed to support real estate professionals by automating and enhancing property listing images. Users can upload property photos and apply various AI-driven transformations such as virtual staging, renovation visualization, and environmental adjustments. The system is intended to improve the presentation quality of real estate listings, helping agents create more appealing and realistic visuals for potential homebuyers.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "TLCengine",
        contacts: [{ name: "Krishna Malyala", email: "krishna@tlcengine.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "TLCengine Mortgage Website",
        description:
          "The TLCengine Mortgage Website is a client-facing loan origination platform designed to streamline the mortgage application and approval process. It provides a centralized portal where loan applicants can submit applications, track progress, and communicate with mortgage loan officers throughout the lending lifecycle. The system supports the full loan workflow from initial submission through post-closing, aiming to improve transparency and efficiency in residential real estate financing.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "TLCengine",
        contacts: [{ name: "Krishna Malyala", email: "krishna@tlcengine.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Tyger Fitness App and Sensor",
        description:
          "The Tyger Fitness App and Sensor project is a connected fitness system that combines a physical force-measuring device with a companion mobile application to help users better track and analyze resistance-based workouts. The system attaches to exercise equipment and records real-time force output during training sessions, allowing users to monitor metrics such as repetitions, peak force, and workout intensity. The accompanying app visualizes this data over time, supports structured workout routines, and stores performance history so users can evaluate progress and improve training consistency.",
        advisors: [{ name: "Matthew Wade", email: "mwade@stevens.edu" }],
        sponsor: "Tyger Fitness",
        contacts: [{ name: "James Curley", email: "curleyjf@email.com" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Using AI for Accessible Alt-Text",
        description:
          "This project focuses on improving accessibility in large digital text and image archives by addressing the widespread lack of useful alternative text for images. Many images in public domain book collections either have missing descriptions or include low-quality alt-text that does not support screen reader users. The team developed an AI-based system that automatically generates meaningful image descriptions. The goal is to reduce manual effort and improve accessibility for visually impaired users across large digital libraries.",
        advisors: [],
        sponsor: "Free Ebook Foundation",
        contacts: [{ name: "Eric Hellman" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
      new Project({
        userId: coord1._id,
        name: "Wang Wang Health",
        description:
          "Wang Wang Health is a social platform that connects users with medical aesthetic services and wellness products through a unified digital experience. The platform allows users to discover clinics and doctors, browse treatments, book appointments, and explore aesthetic products in one place. It also includes a social component where users can share experiences, post content, and interact through likes and comments. The system is designed to improve transparency in the medical aesthetics industry by providing access to reviews, ratings, and detailed service information, helping users make more informed decisions. In addition, the platform integrates shopping functionality for aesthetic products with personalized recommendations and user review systems.",
        advisors: [{ name: "Aaron Klappholz", email: "aklappho@stevens.edu" }],
        sponsor: "Wang Wang",
        contacts: [{ name: "Angelina Saiyi Li" }],
        majors: [{ major: "Computer Science" }],
        year: 2023,
        internal: false,
        isOpen: false,
        assignedGroup: null,
      }).save(),
    ]);

    // Suppress unused-var lint for closed/archive projects
    void p6;

    //  Groups
    console.log("Seeding groups...");

    const [g1, g2, g3, g4, g5, g6, g7] = await Promise.all([
      // Neural Knights (s1–s4): assigned to p1
      new Group({
        groupNumber: 1,
        name: "Neural Knights",
        groupCode: GROUP_CODES.g1,
        groupMembers: [s1._id, s2._id, s3._id, s4._id],
        isOpen: false,
        isPublic: true,
        joinRequests: [],
        interestedProjects: [p1._id, p2._id],
        assignedProject: p1._id,
      }).save(),
      // Byte Brigade (s5–s8): assigned to p3
      new Group({
        groupNumber: 2,
        name: "Byte Brigade",
        groupCode: GROUP_CODES.g2,
        groupMembers: [s5._id, s6._id, s7._id, s8._id],
        isOpen: false,
        isPublic: true,
        joinRequests: [],
        interestedProjects: [p3._id, p4._id, p5._id],
        assignedProject: p3._id,
      }).save(),
      // Stack Overflow (s9–s12): open, public, unassigned
      new Group({
        groupNumber: 3,
        name: "Stack Overflow",
        groupCode: GROUP_CODES.g3,
        groupMembers: [s9._id, s10._id, s11._id, s12._id],
        isOpen: true,
        isPublic: true,
        joinRequests: [],
        interestedProjects: [p2._id, p4._id],
        assignedProject: null,
      }).save(),
      // Debug Dynasty (s13–s15): open, public
      new Group({
        groupNumber: 4,
        name: "Debug Dynasty",
        groupCode: GROUP_CODES.g4,
        groupMembers: [s13._id, s14._id, s15._id],
        isOpen: true,
        isPublic: true,
        joinRequests: [],
        interestedProjects: [p7._id, p8._id],
        assignedProject: null,
      }).save(),
      // Lambda Legion (s16–s18): open, private (code required)
      new Group({
        groupNumber: 5,
        name: "Lambda Legion",
        groupCode: GROUP_CODES.g5,
        groupMembers: [s16._id, s17._id, s18._id],
        isOpen: true,
        isPublic: false,
        joinRequests: [],
        interestedProjects: [p7._id],
        assignedProject: null,
      }).save(),
      // Circuit Breakers (s19–s22): assigned to p9
      new Group({
        groupNumber: 6,
        name: "Circuit Breakers",
        groupCode: GROUP_CODES.g6,
        groupMembers: [s19._id, s20._id, s21._id, s22._id],
        isOpen: false,
        isPublic: true,
        joinRequests: [],
        interestedProjects: [p9._id, p10._id],
        assignedProject: p9._id,
      }).save(),
      // Voltage Vanguard (s23–s26): open, private (code required)
      new Group({
        groupNumber: 7,
        name: "Voltage Vanguard",
        groupCode: GROUP_CODES.g7,
        groupMembers: [s23._id, s24._id, s25._id, s26._id],
        isOpen: true,
        isPublic: false,
        joinRequests: [],
        interestedProjects: [p10._id, p11._id],
        assignedProject: null,
      }).save(),
    ]);

    //  Backfill: project.assignedGroup
    console.log("Linking assigned groups to projects...");
    await Promise.all([
      Project.findByIdAndUpdate(p1._id, { assignedGroup: g1._id }),
      Project.findByIdAndUpdate(p3._id, { assignedGroup: g2._id }),
      Project.findByIdAndUpdate(p9._id, { assignedGroup: g6._id }),
    ]);

    //  Backfill: user.groupId
    console.log("Updating student group assignments...");
    const g1Id = g1._id.toString();
    const g2Id = g2._id.toString();
    const g3Id = g3._id.toString();
    const g4Id = g4._id.toString();
    const g5Id = g5._id.toString();
    const g6Id = g6._id.toString();
    const g7Id = g7._id.toString();

    await Promise.all([
      User.findByIdAndUpdate(s1._id, { groupId: g1Id }),
      User.findByIdAndUpdate(s2._id, { groupId: g1Id }),
      User.findByIdAndUpdate(s3._id, { groupId: g1Id }),
      User.findByIdAndUpdate(s4._id, { groupId: g1Id }),
      User.findByIdAndUpdate(s5._id, { groupId: g2Id }),
      User.findByIdAndUpdate(s6._id, { groupId: g2Id }),
      User.findByIdAndUpdate(s7._id, { groupId: g2Id }),
      User.findByIdAndUpdate(s8._id, { groupId: g2Id }),
      User.findByIdAndUpdate(s9._id, { groupId: g3Id }),
      User.findByIdAndUpdate(s10._id, { groupId: g3Id }),
      User.findByIdAndUpdate(s11._id, { groupId: g3Id }),
      User.findByIdAndUpdate(s12._id, { groupId: g3Id }),
      User.findByIdAndUpdate(s13._id, { groupId: g4Id }),
      User.findByIdAndUpdate(s14._id, { groupId: g4Id }),
      User.findByIdAndUpdate(s15._id, { groupId: g4Id }),
      User.findByIdAndUpdate(s16._id, { groupId: g5Id }),
      User.findByIdAndUpdate(s17._id, { groupId: g5Id }),
      User.findByIdAndUpdate(s18._id, { groupId: g5Id }),
      User.findByIdAndUpdate(s19._id, { groupId: g6Id }),
      User.findByIdAndUpdate(s20._id, { groupId: g6Id }),
      User.findByIdAndUpdate(s21._id, { groupId: g6Id }),
      User.findByIdAndUpdate(s22._id, { groupId: g6Id }),
      User.findByIdAndUpdate(s23._id, { groupId: g7Id }),
      User.findByIdAndUpdate(s24._id, { groupId: g7Id }),
      User.findByIdAndUpdate(s25._id, { groupId: g7Id }),
      User.findByIdAndUpdate(s26._id, { groupId: g7Id }),
    ]);

    //  Summary
    console.log("\n=== Seed complete ===");
    console.log(`\nAll accounts use password: ${DEV_PASSWORD}`);
    console.log("\nCoordinators:");
    console.log("  s.chen@stevens.edu     Dr. Sarah Chen");
    console.log("  m.torres@stevens.edu   Dr. Michael Torres");
    console.log("\nGroups:");
    console.log(
      `  Neural Knights   | code: ${GROUP_CODES.g1} | public  | assigned -> AI Medical Diagnosis`,
    );
    console.log(
      `  Byte Brigade     | code: ${GROUP_CODES.g2} | public  | assigned -> Real-Time Traffic`,
    );
    console.log(
      `  Stack Overflow   | code: ${GROUP_CODES.g3} | public  | open, unassigned`,
    );
    console.log(
      `  Debug Dynasty    | code: ${GROUP_CODES.g4} | public  | open, unassigned`,
    );
    console.log(
      `  Lambda Legion    | code: ${GROUP_CODES.g5} | private | open, unassigned`,
    );
    console.log(
      `  Circuit Breakers | code: ${GROUP_CODES.g6} | public  | assigned -> Solar IoT Monitor`,
    );
    console.log(
      `  Voltage Vanguard | code: ${GROUP_CODES.g7} | private | open, unassigned`,
    );
    console.log("\nSample students:");
    console.log(
      "  ajohnson@stevens.edu    Neural Knights   assigned -> AI Medical Diagnosis",
    );
    console.log("  jlee@stevens.edu        Stack Overflow   open, unassigned");
    console.log("  tdavis@stevens.edu      Debug Dynasty    open, unassigned");
    console.log(
      "  jcooper@stevens.edu     Circuit Breakers assigned -> Solar IoT Monitor",
    );
    console.log(
      "\nCounts: 2 coordinators | 26 students | 47 projects | 7 groups",
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
