import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.model";
import Course from "./models/Course.model";
import { Project } from "./models/Project.model";
import { Group } from "./models/Group.model";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

// Hardcoded dev course codes, guaranteed unique after clearing the DB
const COURSE_CODES = {
  CS423A: "DEV1A2B",
  CS423B: "DEV3C4D",
  ee496A: "DEV5E6F",
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
      Course.deleteMany({}),
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

    //  Courses
    console.log("Seeding courses...");
    const [course1, course2, course3] = await Promise.all([
      // CS423 Fall 2025 — Section A (Dr. Chen)
      new Course({
        userId: coord1._id.toString(),
        name: coord1.name,
        email: coord1.email,
        program: "Computer Science",
        courseNumber: "CS423",
        courseSection: "A",
        season: "Fall",
        year: 2025,
        minGroupSize: 3,
        maxGroupSize: 5,
        courseCode: COURSE_CODES.CS423A,
        lastGroupNumber: 0,
        closed: false,
      }).save(),
      // CS423 Spring 2026 — Section B (Dr. Chen)
      new Course({
        userId: coord1._id.toString(),
        name: coord1.name,
        email: coord1.email,
        program: "Computer Science",
        courseNumber: "CS423",
        courseSection: "B",
        season: "Spring",
        year: 2026,
        minGroupSize: 3,
        maxGroupSize: 5,
        courseCode: COURSE_CODES.CS423B,
        lastGroupNumber: 0,
        closed: false,
      }).save(),
      // EE496 Fall 2025 — Section A (Dr. Torres)
      new Course({
        userId: coord2._id.toString(),
        name: coord2.name,
        email: coord2.email,
        program: "Electrical Engineering",
        courseNumber: "EE496",
        courseSection: "A",
        season: "Fall",
        year: 2025,
        minGroupSize: 2,
        maxGroupSize: 4,
        courseCode: COURSE_CODES.ee496A,
        lastGroupNumber: 0,
        closed: false,
      }).save(),
    ]);

    const c1Id = course1._id.toString();
    const c2Id = course2._id.toString();
    const c3Id = course3._id.toString();

    //  Students
    console.log("Seeding students...");

    const mkStudent = (name: string, email: string, courseId: string) =>
      new User({
        name,
        email,
        password: DEV_PASSWORD,
        role: "student",
        course: courseId,
      }).save();

    // CS423 Fall 2025 — 12 students across 3 groups of 4
    const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12] =
      await Promise.all([
        mkStudent("Alex Johnson", "ajohnson@stevens.edu", c1Id),
        mkStudent("Emily Rodriguez", "erodriguez@stevens.edu", c1Id),
        mkStudent("Marcus Williams", "mwilliams@stevens.edu", c1Id),
        mkStudent("Sophie Park", "spark@stevens.edu", c1Id),
        mkStudent("Daniel Kim", "dkim@stevens.edu", c1Id),
        mkStudent("Aisha Patel", "apatel@stevens.edu", c1Id),
        mkStudent("Ryan Thompson", "rthompson@stevens.edu", c1Id),
        mkStudent("Natalie Brown", "nbrown@stevens.edu", c1Id),
        mkStudent("Jordan Lee", "jlee@stevens.edu", c1Id),
        mkStudent("Priya Sharma", "psharma@stevens.edu", c1Id),
        mkStudent("Chris Martinez", "cmartinez@stevens.edu", c1Id),
        mkStudent("Hannah Wilson", "hwilson@stevens.edu", c1Id),
      ]);

    // CS423 Spring 2026 — 6 students across 2 groups of 3
    const [s13, s14, s15, s16, s17, s18] = await Promise.all([
      mkStudent("Tyler Davis", "tdavis@stevens.edu", c2Id),
      mkStudent("Maya Anderson", "manderson@stevens.edu", c2Id),
      mkStudent("Sam Nguyen", "snguyen@stevens.edu", c2Id),
      mkStudent("Isabella Clark", "iclark@stevens.edu", c2Id),
      mkStudent("Ethan White", "ewhite@stevens.edu", c2Id),
      mkStudent("Layla Hassan", "lhassan@stevens.edu", c2Id),
    ]);

    // EE496 Fall 2025 — 8 students across 2 groups of 4
    const [s19, s20, s21, s22, s23, s24, s25, s26] = await Promise.all([
      mkStudent("James Cooper", "jcooper@stevens.edu", c3Id),
      mkStudent("Olivia Turner", "oturner@stevens.edu", c3Id),
      mkStudent("Noah Bennett", "nbennett@stevens.edu", c3Id),
      mkStudent("Ava Mitchell", "amitchell@stevens.edu", c3Id),
      mkStudent("Liam Garcia", "lgarcia@stevens.edu", c3Id),
      mkStudent("Zoe Robinson", "zrobinson@stevens.edu", c3Id),
      mkStudent("Mason Hall", "mhall@stevens.edu", c3Id),
      mkStudent("Chloe Adams", "cadams@stevens.edu", c3Id),
    ]);

    //  Projects
    console.log("Seeding projects...");

    // CS423 Fall 2025 — 6 projects (p6 is closed)
    const [p1, p2, p3, p4, p5, p6] = await Promise.all([
      new Project({
        courseId: c1Id,
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
        courseId: c1Id,
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
        courseId: c1Id,
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
        courseId: c1Id,
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
        courseId: c1Id,
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
      // Closed project — demonstrates isOpen: false state
      new Project({
        courseId: c1Id,
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
    ]);

    // CS423 Spring 2026 — 2 projects
    const [p7, p8] = await Promise.all([
      new Project({
        courseId: c2Id,
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
        courseId: c2Id,
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

    // EE496 Fall 2025 — 3 projects
    const [p9, p10, p11] = await Promise.all([
      new Project({
        courseId: c3Id,
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
        courseId: c3Id,
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
        courseId: c3Id,
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

    // p6 is a closed project not assigned to any group — suppress unused-var lint
    void p6;

    //  Groups
    console.log("Seeding groups...");

    const [g1, g2, g3, g4, g5, g6, g7] = await Promise.all([
      // CS423 Fall 2025 — Group 1 (s1–s4): assigned to p1
      new Group({
        groupNumber: 1,
        courseId: c1Id,
        groupMembers: [s1._id, s2._id, s3._id, s4._id],
        isOpen: false,
        interestedProjects: [p1._id, p2._id],
        assignedProject: p1._id,
      }).save(),
      // CS423 Fall 2025 — Group 2 (s5–s8): assigned to p3
      new Group({
        groupNumber: 2,
        courseId: c1Id,
        groupMembers: [s5._id, s6._id, s7._id, s8._id],
        isOpen: false,
        interestedProjects: [p3._id, p4._id, p5._id],
        assignedProject: p3._id,
      }).save(),
      // CS423 Fall 2025 — Group 3 (s9–s12): interested but unassigned
      new Group({
        groupNumber: 3,
        courseId: c1Id,
        groupMembers: [s9._id, s10._id, s11._id, s12._id],
        isOpen: true,
        interestedProjects: [p2._id, p4._id],
        assignedProject: null,
      }).save(),
      // CS423 Spring 2026 — Group 1 (s13–s15)
      new Group({
        groupNumber: 1,
        courseId: c2Id,
        groupMembers: [s13._id, s14._id, s15._id],
        isOpen: true,
        interestedProjects: [p7._id, p8._id],
        assignedProject: null,
      }).save(),
      // CS423 Spring 2026 — Group 2 (s16–s18)
      new Group({
        groupNumber: 2,
        courseId: c2Id,
        groupMembers: [s16._id, s17._id, s18._id],
        isOpen: true,
        interestedProjects: [p7._id],
        assignedProject: null,
      }).save(),
      // EE496 Fall 2025 — Group 1 (s19–s22): assigned to p9
      new Group({
        groupNumber: 1,
        courseId: c3Id,
        groupMembers: [s19._id, s20._id, s21._id, s22._id],
        isOpen: false,
        interestedProjects: [p9._id, p10._id],
        assignedProject: p9._id,
      }).save(),
      // EE496 Fall 2025 — Group 2 (s23–s26): unassigned
      new Group({
        groupNumber: 2,
        courseId: c3Id,
        groupMembers: [s23._id, s24._id, s25._id, s26._id],
        isOpen: true,
        interestedProjects: [p10._id, p11._id],
        assignedProject: null,
      }).save(),
    ]);

    //  Backfill: project.assignedGroup, course.lastGroupNumber
    console.log("Linking assigned groups to projects...");
    await Promise.all([
      Project.findByIdAndUpdate(p1._id, { assignedGroup: g1._id }),
      Project.findByIdAndUpdate(p3._id, { assignedGroup: g2._id }),
      Project.findByIdAndUpdate(p9._id, { assignedGroup: g6._id }),
      Course.findByIdAndUpdate(course1._id, { lastGroupNumber: 3 }),
      Course.findByIdAndUpdate(course2._id, { lastGroupNumber: 2 }),
      Course.findByIdAndUpdate(course3._id, { lastGroupNumber: 2 }),
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
    console.log("\nCourses:");
    console.log(
      `  CS423 Fall 2025   Section A  | join code: ${COURSE_CODES.CS423A}`,
    );
    console.log(
      `  CS423 Spring 2026 Section B  | join code: ${COURSE_CODES.CS423B}`,
    );
    console.log(
      `  EE496 Fall 2025   Section A  | join code: ${COURSE_CODES.ee496A}`,
    );
    console.log(`\nAll accounts use password: ${DEV_PASSWORD}`);
    console.log("\nCoordinators:");
    console.log("  s.chen@stevens.edu     (CS423 coordinator)");
    console.log("  m.torres@stevens.edu   (EE496 coordinator)");
    console.log("\nSample students:");
    console.log(
      "  ajohnson@stevens.edu    CS423 Fall  Group 1  assigned -> AI Medical Diagnosis",
    );
    console.log("  jlee@stevens.edu        CS423 Fall  Group 3  unassigned");
    console.log("  tdavis@stevens.edu      CS423 Spring Group 1 unassigned");
    console.log(
      "  jcooper@stevens.edu     EE496 Fall  Group 1  assigned -> Solar IoT Monitor",
    );
    console.log(
      "\nCounts: 2 coordinators | 26 students | 3 courses | 11 projects | 7 groups",
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
