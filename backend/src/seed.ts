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

    interface Project2026Entry {
      name: string;
      description: string;
      advisors: { name?: string; email?: string }[];
      sponsor: string;
      contacts: { name?: string; email?: string }[];
      majors: { major: string }[];
      internal: boolean;
      groupName: string;
    }

    const projects2026: Project2026Entry[] = [
      // 1. [BME]
      {
        name: "AIRR: Autonomic Intervention Respiratory Response",
        description:
          "AIRR is an autonomous emergency airway management system that allows trained bystanders to assist in a respiratory emergency before EMS arrive.",
        advisors: [{ name: "Jinho Kim" }],
        sponsor: "Memorial Sloan Kettering Cancer Center",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "AIRR",
      },
      // 2. [BME]
      {
        name: "CuNEXT",
        description:
          "The copper IUD has not seen meaningful innovation in 38 years, leaving women who seek a non-hormonal contraceptive option with a device that causes severe cramping, excessive bleeding, and significant discomfort following insertion. Women seeking a hormone-free birth control option, as well as clinicians hesitant to recommend the existing copper IUD due to its side effects, were the primary groups affected by this gap in innovation. To address this, the CuNEXT IUD, a redesigned copper IUD...",
        advisors: [{ name: "Rachel Jones" }],
        sponsor: "Zachary Marvin",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "CuNEXT",
      },
      // 3. [BME]
      {
        name: "DuoVitalis",
        description:
          "DuoVitalis is an external, detachable stethoscope attachment device that provides bodily sound amplification without the use of filtering to provide clear diagnostic evidence that clinicians can trust. It is universally compatible, allowing clinicians to continue to use the stethoscopes they own while improving the rates of misdiagnoses. By attaching externally to the end of the chest piece of the stethoscope, our device reduces the risk of damage or increased wear to the clinicians'...",
        advisors: [
          { name: "Yu Gan" },
          { name: "Ilke Uguz" },
          { name: "Bernard Yett" },
        ],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "DuoVitalis",
      },
      // 4. [BME]
      {
        name: "Duoxalis",
        description:
          "BV and yeast infections make up most vaginal infections in reproductive-aged women, affecting millions at any given time, and clinical diagnoses are frequently wrong as misdiagnosis rates can exceed 70%. Current at-home options are often invasive, confusing, expensive, and rely heavily on pH, which can't reliably distinguish BV from yeast, leading to delayed, ineffective, or unnecessary treatment. Duoxalis addresses this gap with a non-invasive, ultra-thin pantyliner that passively collects...",
        advisors: [{ name: "Rachel Jones" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "Duoxalis",
      },
      // 5. [BME]
      {
        name: "Marine Insertion Brace (MIB)",
        description:
          "The Marine Insertion Brace (MIB) is a wearable medical device that functions as an adaptive neck brace intended to mitigate neck, spine, and head injury in U.S. Navy high-speed marine craft operations. The MIB device is a neck brace intended to mitigate injury mechanics by using an adaptive electromechanical pulley system that reduces cervical spine torque in impact incidents.",
        advisors: [{ name: "Michael Delorme" }],
        sponsor: "Stevens Davidson Laboratory",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "MIB",
      },
      // 6. [BME]
      {
        name: "PureMed: Next-Gen GLP-1 Drug Delivery Device",
        description:
          "At-home GLP-1 autoinjector that aims to mitigate pain, improve dose accuracy, and is reusable. Utilizes electronic components for injection rather than spring-loaded methods, which reduces the amount of force experienced by the patient's tissue.",
        advisors: [{ name: "Ellen Garven" }, { name: "Jinho Kim" }],
        sponsor: "BD Engineering",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "PureMed",
      },
      // 7. [BME]
      {
        name: "ReSpec",
        description:
          "Many patients that need routine gynecological exams avoid them due to anxiety/ detesting the conventional vaginal speculum, so we are designing a softer, inflatable speculum that inflates uniformly. This would be less painful and less anxiety inducing for patients, which could lead more of them to get routine vaginal examinations that could potentially save lives due to earlier detection of cervical cancer etc.",
        advisors: [{ name: "Jennifer Kang-Mieler" }],
        sponsor: "New Jersey Medical School",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "ReSpec",
      },
      // 8. [BME]
      {
        name: "Rocket Lungs: Respiratory Muscle Trainer",
        description:
          "We are creating a respiratory muscle training device for children ages 6-10 with neuromuscular disorders. Our device is an outer-space-themed therapeutic treatment which intends to alleviate symptoms of respiratory distress, with an overall goal of preventing respiratory failure. It will do this using an automatic inspiratory resistance mechanism which is child-friendly and user specific.",
        advisors: [{ name: "Rachel Jones" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "Rocket Lungs",
      },
      // 9. [BME]
      {
        name: "SensiTear",
        description:
          "SensiTear is a microfluidic device to be placed under the eye that noninvasively stimulates tearing to screen tear fluid for the disease-specific biomarkers (amyloid-beta 40 and amyloid-beta 42) that signify Alzheimer's disease (AD) 3-5 years before mild cognitive impairment begins. Currently, there is no device/test on the market that can screen/diagnose AD before symptoms like memory loss and confusion begin to set in, and there is no cure for AD, making timely intervention critical. Our...",
        advisors: [{ name: "Jennifer Kang-Mieler" }, { name: "Jinho Kim" }],
        sponsor: "Columbia University",
        contacts: [{ email: "ss2735@columbia.edu" }],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "SensiTear",
      },
      // 10. [BME]
      {
        name: "Synovia",
        description:
          "Synovia is an automated knee rehabilitation device focused on treating knee flexion contracture by providing and tracking accurate mobilizations to the knee to improve accessibility, affordability, and consistency of treatment for the patients.",
        advisors: [{ name: "Rachel Jones" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "Synovia",
      },
      // 11. [BME]
      {
        name: "TeleHub",
        description:
          "TeleHub is a medical device system that is designed for cardiac rehabilitation patients to complete vital measurement appointments from their own home. The design of this project aims to measure four different physiological conditions, listed as follows: a 3-lead electrocardiogram, a blood pressure system, a pulse oxygenation measurement, as well as a heart rate measurement. The device then filters and configures the raw measurements into an easily comprehensible display on a software...",
        advisors: [{ name: "Peter Popolo" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "TeleHub",
      },
      // 12. [BME]
      {
        name: "UTID",
        description:
          "Urinary tract infections affect millions annually, yet current at-home tests are inaccurate and urine cultures take days to process, delaying treatment. Our team is developing a pregnancy test-style, at-home dipstick that uses monoclonal antibodies and microfluidic lateral flow assays to specifically detect the four most common UTI-causing bacteria, delivering accurate results within 30 minutes and reducing misdiagnosis and unnecessary antibiotic use.",
        advisors: [{ name: "Denver Baptiste" }],
        sponsor:
          "Hackensack Meridian Health Center for Discovery and Innovation",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "UTID",
      },
      // 13. [BME]
      {
        name: "BluePaw",
        description:
          "The project helped overcome the monotonous and time-consuming challenges associated with conventional computer-aided design methods that hinder rapid design creation for patient-specific medical devices. The project's target audience included clinicians, biomedical engineers, and students who require customized scaffolds, implants, or assistive devices for individual patients. To achieve this, the team designed BluePawCAD, an AI-based CAD system that can automatically convert plain language...",
        advisors: [{ name: "Zita Doktor" }, { name: "Mukund Iyengar" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "BluePaw",
      },
      // 14. [BME]
      {
        name: "HOPE Incubator: PCM-Based Neonatal Incubator for Low-Resource Settings",
        description:
          "HOPE Incubator's mission is to deliver an affordable, electricity-resilient neonatal incubator that ensures safe, continuous thermal care for premature infants in resource-limited healthcare settings, using a phase change material (PCM) based thermal regulation system.",
        advisors: [{ name: "Dilhan Kalyon" }, { name: "Ilke Uguz" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: true,
        groupName: "HOPE Incubator",
      },
      // 15. [BME]
      {
        name: "LabNinja",
        description:
          "LabNinja is a living lab intelligence platform that converts protocols, sequence reads, images, and notebook entries into a lab-owned knowledge graph and continuously fine-tuned neural model. It recommends ranked, explainable, high-probability experiments so teams run far fewer blind replicates, cut time to insight from months to hours, and make discovery deliberate rather than accidental.",
        advisors: [
          { name: "Denver Baptiste" },
          { name: "Zita Doktor" },
          { name: "Mukund Iyengar" },
        ],
        sponsor: 'Xiaoteng "Frank" Liu',
        contacts: [],
        majors: [{ major: "Biomedical Engineering" }],
        internal: false,
        groupName: "LabNinja",
      },
      // 16. [CCB]
      {
        name: "Development of Novel Inhibitors for KIV-7 and KIV-8 Domains of Lp(a)",
        description:
          "We are using the Schrodinger Maestro, Boltz-2, and SwissADME computational modeling and drug binding affinity programs to develop inhibitors for the Kringle IV 7 and 8 domains of the lipoprotein(a) target molecule.",
        advisors: [{ name: "Sunil Paliwal" }],
        sponsor: "Jacob Freed",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "KIV Inhibitors",
      },
      // 17. [CCB]
      {
        name: "Epithelial Regulation of Fibroblast Function in IBD: An Epigenetic Study",
        description:
          "Inflammatory Bowel Disease (IBD) is a chronic, incurable inflammatory disorder affecting three million people in the United States. The intestinal epithelium, a single-cell layer lining the gut, forms a critical barrier between luminal contents and the underlying mesenchyme. Homeostasis depends on reciprocal signaling between epithelial cells and fibroblasts. During injury, as occurs in IBD, dysfunctional communication determines whether repair proceeds through regeneration or fibrosis....",
        advisors: [{ name: "Ansu Perekatt" }],
        sponsor:
          "Hackensack Meridian Health (HMU) Center for Discovery and Innovation (CDI)",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "EpiReg IBD",
      },
      // 18. [CCB]
      {
        name: "Fabrication of Biomimetic Nanofiber-based Matrices for Corneal Epithelial Cells",
        description:
          "Damage to the corneal epithelium is recognized as a leading cause of visual impairment worldwide, particularly in patients affected by injuries or degenerative corneal diseases. Current treatments such as corneal transplantation and amniotic membrane grafts are limited by donor shortages, immune rejection, and inconsistent long-term outcomes. While tissue engineering offers promising alternatives, existing scaffolds have not reliably replicated the native basement membrane necessary for...",
        advisors: [{ name: "Hongjun Wang" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "CornealFiber",
      },
      // 19. [CCB]
      {
        name: "Genetic and Microbial Modulators of Developmental Survival in C. elegans",
        description:
          "This project investigates how cellular stress is sensed and transduced through conserved signaling pathways in C. elegans, with a focus on the daf-18 pathway. Stress-induced changes in signaling activity are examined to better understand how organisms regulate survival, metabolism, and longevity under adverse conditions.",
        advisors: [{ name: "Denver Baptiste" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "C. elegans GenMod",
      },
      // 20. [CCB]
      {
        name: "Investigation of the Association Between SLC6A6 Expression and Extracellular Matrix Adhesion in Ovarian Cancer",
        description:
          "This project integrates computational RNA-seq analysis and planned experimental validation to investigate how the taurine transporter SLC6A6 regulates adhesion and extracellular matrix (ECM) gene programs in ovarian cancer. By identifying adhesion genes co-expressed with SLC6A6 and linking them to cisplatin resistance and metastasis, the study aims to uncover potential biomarkers and dual therapeutic targets for platinum-resistant ovarian cancer",
        advisors: [{ name: "Marcin Iwanicki" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "SLC6A6 OC",
      },
      // 21. [CCB]
      {
        name: "Using A Conditionally Mutant Mouse Model of Tumorigenesis to Evaluate Immune Evasion in Colon Cancer",
        description:
          "Understanding the micro-environment in colorectal cancer using mouse models and identifying the correlation of DNA methylation to expression for Inflammatory Bowel Disease (IBD) using mouse genes.",
        advisors: [{ name: "Ansu Perekatt" }],
        sponsor:
          "Hackensack Meridian Health (HMU) Center for Discovery and Innovation (CDI)",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "ColonImmune",
      },
      // 22. [CCB]
      {
        name: "AI-Driven Lead Optimization of Molibresib: Leveraging Boltz-2 and Schrdinger Maestro to Target the Myc Oncogene in Refractory Myeloma",
        description:
          "We're current working on designing a novel inhibitor of BRD4-D1, the first of the BRD4 bromodomain series that regulate the transcription of the MYC oncogene. MYC is generally understood to increase the survival and/or proliferation of multiple types of cancer cells. We're designing the drug by tweaking and iterating existing compounds and doing initial testing using AI-powered computational tools like Schrodinger Maestro, Rowan Boltz-2, and SwissADME.",
        advisors: [{ name: "Sunil Paliwal" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "MolibrAI",
      },
      // 23. [CCB]
      {
        name: "AI-Powered Drug Discovery for Select Cancers through Inhibition of MLK4",
        description:
          "Our project seeks to investigate AI's capability in drug discovery from hypothesis generation to drug design and synthetic scheme determination. To achieve this goal, we selected a protein called Mixed Lineage Kinase 4, which is implicated in breast, colorectal, and oral cancers, and we aim to design an inhibitor to target MLK4 using an AI-driven workflow.",
        advisors: [{ name: "Sunil Paliwal" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "MLK4 AI",
      },
      // 24. [CCB]
      {
        name: "Biomimetic Nanofiber-Assisted Engineering of the Corneal Stroma",
        description:
          "Engineering a corneal stroma to be used in corneal transplants of the eye for patients with vision loss/damage. it would be an accessible intervention for all patients and adapt to their native in-vivo conditions. I will be using nanofibers and keratocyte cells arranged in a layer-by-layer assembly to mimic the corneal stroma and measure its transparency for sight and color vision and monitor the cells' behavior, morphology, and growth.",
        advisors: [{ name: "Hongjun Wang" }],
        sponsor: "New York University",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "CorStroma",
      },
      // 25. [CCB]
      {
        name: "Design and Synthesis of Novel SARS-CoV-2 MPro Inhibitors for the Treatment of COVID-19",
        description:
          "We are using computational resources and lab techniques to create and synthesize SARS-CoV-2 protease inhibitors for the treatment of COVID-19. Three synthetic steps: (1) sulfonamide formation (2) radical cyclization (3) opening of the epoxide ring to form the target racemic compound, were completed. The combination of computational and experimental methods showed the feasibility of designing noncovalent SARS-CoV-2 Mpro inhibitors based on a cyclic sulfonamide pharmacophore. Computational...",
        advisors: [{ name: "Sesha Sridevi Alluri" }],
        sponsor:
          "Independent Colleges and Universities of New Jersey (ICUNJ) Undergraduate Research Symposium (URS)",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "CoV2 MPro",
      },
      // 26. [CCB]
      {
        name: "Development and Synthesis of an IGF-1R Inhibitor with Assistance from AI-Modeling Software",
        description:
          "IGF-1R is an anabolic growth-inducing receptor whose overexpression is prevalent in a variety of mobile or metastatic cancers, linked particularly with cancers in the lower abdominal region, such as colorectal or prostate cancers. Targeting it for inhibition has been attempted previously with some degree of clinical success, but little by way of large-scale treatment development. However, with the growing prevalence of AI in drug design, a new avenue was discovered. Previous analysis using...",
        advisors: [{ name: "Sunil Paliwal" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "IGF-1R",
      },
      // 27. [CCB]
      {
        name: "Evaluating the Role of SLC6A6 & SLC16A6 in Retinal Pigmented Epithelial (RPE) Cells and the Effect of Guanidinoethyl sulfonate (GES)",
        description:
          "Our project in evaluating the role of two taurine transporters, SLC6A6 and SLC16A6, in retinal pigmented epithelial (RPE) cells. Taurine is an amino acid essential for retinal health and the function of the transporter SLC16A6 is widely un investigated. We aim to use a known competitive inhibitor of the major taurine transporters SLC6A6 to learn more about SLC16A6's function.",
        advisors: [{ name: "Marcin Iwanicki" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "SLC6A6 RPE",
      },
      // 28. [CCB]
      {
        name: "Investigating Molecular Visualization Tools to ?Enhance Student Learning and Engagement",
        description:
          "One of the most important concepts for chemistry, biology, and chemical biology students to explain is molecular structure, and how it connects to its functionality. However, the tools that introduce these concepts are limited to two-dimensional (2D) visualization, which causes a disconnect with students who struggle to analyze molecular structures, geometry and stereochemistry. A proposed solution includes the incorporation of three-dimensional (3D) molecular visualization tools such as...",
        advisors: [
          { name: "Sesha Sridevi Alluri" },
          { name: "Patricia Muisener" },
        ],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "MolViz",
      },
      // 29. [CCB]
      {
        name: "Investigation of Taurine on Apoptosis and Cell Growth in Malignant Peripheral Nerve Sheath Tumors (MPNSTs)",
        description:
          "Malignant peripheral nerve sheath tumors (MPNSTs) are rare and aggressive soft tissue sarcomas that disproportionately affect patients with Neurofibromatosis type 1 (NF1). The prognosis for MPNSTs is poor, averaging around a 35% 5-year survival rate, with no targeted therapy. SLC6A6, also known as the taurine transporter (TauT), has recently been elucidated to be essential for the proper modification and stabilization of human mitochondrial transfer RNA (hmtRNA), which are necessary for...",
        advisors: [{ name: "Marcin Iwanicki" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "TauMPNST",
      },
      // 30. [CCB]
      {
        name: "Microsphere-Enabled Fabrication of a CRC-mimic Organoid",
        description:
          "This project develops a 3D microsphere-based colorectal cancer (CRC) organoid that mimics the tumor microenvironment by integrating CRC cells, fibroblasts, and endothelial cells. By engineering porous polymer microspheres and microfluidic perfusion systems, the model aims to better study tumor behavior and test targeted cancer therapies in a realistic, lab-controlled setting.",
        advisors: [{ name: "Hongjun Wang" }],
        sponsor:
          "Independent Colleges and Universities of New Jersey (ICUNJ) Undergraduate Research Symposium (URS)",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: false,
        groupName: "CRC Organoid",
      },
      // 31. [CCB]
      {
        name: "Ultra-Thin and Functionalized Polydopamine Films for Wide Biomedical Applications",
        description:
          "For our senior research project, we are attempting to create a peelable, transferrable, and biocompatible coating made from polymerized dopamine (PDA). This PDA coating has future applications as layer that can be seeded with cells and proteins to work as an artificial basement membrane or antibacterial coating for medical implants.",
        advisors: [{ name: "Junfeng Liang" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "PolyDopa",
      },
      // 32. [CCB]
      {
        name: "Investigating Optical Response of Gold Nanoparticle Configurations Using Finite-Difference Time-Domain Simulation",
        description:
          "Gold nanoparticles are widely used in optical sensing because their localized surface plasmon resonance (LSPR) produces strong, measurable interactions with light. Reported LSPR shifts can vary because FDTD results depend on convergence, boundary settings, and the gold optical constants/parameters, so a benchmarked workflow is needed for reliable design. In this project, Gurpreet Singh used Finite-Difference Time-Domain (FDTD) simulations to model how gold nanoparticle configurations,...",
        advisors: [{ name: "Kwahun Lee" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "GNP FDTD",
      },
      // 33. [CCB]
      {
        name: "The SEERious Report: Leveraging the SEER Database in Forecasting Lung Cancer Survival",
        description:
          "The SEER (Surveillance, Epidemiology, and End Results) software platform is a database providing large, standardized datasets to model mortality and survival patterns. The goal is to use SEER to examine demographics, survival, socioeconomic factors, and predictors of mortality in Small Cell Lung Cancer (SCLC).",
        advisors: [
          { name: "Paola DiMarzio" },
          { name: "Carlo Lipizzi" },
          { name: "Raul Perez-Olle" },
        ],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "SEERious",
      },
      // 34. [CCB]
      {
        name: "Investigating Base-Mediated Cyclization Pathways: Understanding KOtBu Failure in Housane Formation",
        description:
          "Strained bicyclic frameworks such as housanes (bicyclo[2.1.0]pentanes) are of growing interest due to their utility in medicinal chemistry, stereocontrolled synthesis, and bioconjugation, as their highly strained ?-bonds enable selective ring-opening reactions to access diverse scaffolds. Although potassium tert-butoxide (KOtBu) has been reported to generate housane-containing products, our attempts to reproduce this reactivity with morpholine-substituted cyclopentyl substrates were...",
        advisors: [{ name: "Abhishek Sharma" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "Housane",
      },
      // 35. [CCB]
      {
        name: "MedArmour",
        description:
          "A peelable antibacterial bandage used in emergency medicine to prevent open-wound infections as well as work in surgical procedures as a sterile seal. this medical tool will allow emergency medical professionals to provide infection-minimizing care on scene prior to transporting the patient to definitive care. there would also be applications for MedArmour in the emergency room and during surgeries where the patient's body can house this bandage internally and use it to prevent...",
        advisors: [{ name: "Junfeng Liang" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Biology" }, { major: "Chemistry" }],
        internal: true,
        groupName: "MedArmour",
      },
      // 36. [CEMS]
      {
        name: "Anti-Microbial Surfaces for Biomedical Implants",
        description:
          "Developing and testing an antimicrobial coating for medical implants for the prevention of post-op infections, including the development of a testing apparatus used in observing the efficacy of the coating.",
        advisors: [{ name: "Matthew Libera" }],
        sponsor: "University of Pennsylvania School of Veterinary Medicine",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: false,
        groupName: "AMS",
      },
      // 37. [CEMS]
      {
        name: "AquaSep: Analysis of Cellulose-Nanocrystal-Based Membranes for Separation of Organic Solvent Mixtures",
        description:
          "We are working on testing previously-made membranes designed for a pervaporation setup, in the interest of efficiently separating solvent mixtures. Their physical and thermodynamic properties are being evaluated using multiple imaging and spectroscopy techniques.",
        advisors: [{ name: "Pinar Akcora" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: true,
        groupName: "AquaSep",
      },
      // 38. [CEMS]
      {
        name: "Molecular Modeling of Organic Synthesis Pathways",
        description:
          "The overarching goal is to develop an accessible, open-source computational workflow to map drug synthesis pathways using molecular dynamics (MD). This process will be cost-effective for drug discovery, and the group will be using an Alzheimer's drug Donepezil to showcase this idea.",
        advisors: [{ name: "Jacob Gissinger" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: true,
        groupName: "MolModel",
      },
      // 39. [CEMS]
      {
        name: "PolyCell: Ion Transport in Polymer Electrolytes",
        description:
          "This project focuses on the design and evaluation of a solid polymer electrolyte (SPE) for magnesium-ion batteries as a safer and more sustainable alternative to conventional lithium-ion systems. The objective is to develop a polymer electrolyte with ionic conductivity and ion-transport properties approaching those of commercial lithium-ion liquid electrolytes (~10? S/cm), demonstrating the feasibility of high-performance magnesium-based energy storage.",
        advisors: [{ name: "Benjamin Paren" }],
        sponsor: "Niloofar Afshari",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: false,
        groupName: "PolyCell",
      },
      // 40. [CEMS]
      {
        name: "Predicting Developability Properties in Monoclonal Antibodies using Computational Design Techniques",
        description:
          "Trained on a sample set of antibody sequences with properties, our project is to design a machine learning algorithm that can accurately predict 5 monoclonal antibody properties (HIC, ACSINS, PSR, Tm, Titer) given the antibody sequence.",
        advisors: [{ name: "Pin-Kuang Lai" }],
        sponsor: "Lateefat Kalejaye",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: false,
        groupName: "MAb ML",
      },
      // 41. [CEMS]
      {
        name: "Team RNG: Renewable Natural Gas for Farmers",
        description:
          "We are creating an ASPEN simulation to model a process which will convert dairy cow manure into renewable natural gas (RNG) and other products. The manure is ordinarily waste, so this process will harvest unused energy while reducing greenhouse gas emissions and making a profit for local farmers. The process is on a large scale and uses a digester, separation equipment, and heat/pressure manipulators.",
        advisors: [{ name: "Yujun Zhao" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: true,
        groupName: "Team RNG",
      },
      // 42. [CEMS]
      {
        name: "Sustainable Aviation Fuel from Palm Oil",
        description:
          "This project aims to design a process that turns palm oil into sustainable aviation fuel. Using a single-stage hydrodeoxygenation process over a bimetallic catalyst, the palm oil feedstock reacts to produce aviation fuel that can be added to traditional jet fuel. This process decreases the total amount of greenhouse gases released into the atmosphere.",
        advisors: [{ name: "Adeniyi Lawal" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Chemical Engineering" }],
        internal: true,
        groupName: "SAF",
      },
      // 43. [CEOE]
      {
        name: "AccessLine Collective: Perth Amboy Station ADA Improvements",
        description:
          "Design and analysis of Elevator tower for the addition of ADA compliance to Perth Amboy Station. Project includes site planning and accessibility planning, as well as elevator tower 1.",
        advisors: [{ name: "Ronghuan Xu" }],
        sponsor: "Stantec",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "AccessLine",
      },
      // 44. [CEOE]
      {
        name: "Beam Team: Central Ave Bridge over US Route 1&9T",
        description:
          "Our project scope includes a full super and substructure replacement of a structurally deficient Central Ave Bridge in South Kearney, NJ. The goal of the project is to ensure the new design meets current NJDOT codes and standards, accommodates the future widening of Route 1&9T beneath it, limits environmental impacts, and ensures safety of all drivers and pedestrians that utilize this structure.",
        advisors: [{ name: "Karim Karam" }],
        sponsor: "Stantec",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Beam Team",
      },
      // 45. [CEOE]
      {
        name: "Camden Assistance in Redeveloping Education (CARE): Civil Design for Urban High School Redevelopment",
        description:
          "The Camden Assistance in Redeveloping Education (C.A.R.E.) Student Design team has been tasked to redesign the East Side High School in Camden, New Jersey. The existing building, constructed in 1925, is set to be demolished and a new high school is to be built in its place. The team must provide a comprehensive site plan with considerations to existing conditions, such as the city's combined sewer system.",
        advisors: [{ name: "Weina Meng" }],
        sponsor: "WSP",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "CARE",
      },
      // 46. [CEOE]
      {
        name: "Culvert Operations: Stormwater Management & Flood Mitigation",
        description:
          "This project is about stormwater management and flood mitigation, specifically for a municipal parking lot in Garfield, NJ. The team is to redesign the existing culvert to reduce flooding, as efficiently and sustainably as possible.",
        advisors: [
          { name: "Santhi Sri Billapati" },
          { name: "Reza Marsooli" },
          { name: "Marouane Temimi" },
        ],
        sponsor: "Boswell Engineering",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Culvert Ops",
      },
      // 47. [CEOE]
      {
        name: "Duck Under: Portal North Bridge",
        description:
          "Our senior design project involves the structural design and cost estimation of the Duck Under, a 400-foot-long reinforced concrete structure that is a critical component of the Portal North Bridge (PNB) project and enables future construction of the Portal South Bridge to allow trains to pass beneath PNB. The project includes the design of foundation systems with sheet piles, a support-of-excavation system, and 85 five-foot-diameter drilled shafts to rock, as well as the superstructure and...",
        advisors: [
          { name: "Sarath Chandra Kumar Jagupilla" },
          { name: "Ronghuan Xu" },
        ],
        sponsor: "Skanska USA",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Duck Under",
      },
      // 48. [CEOE]
      {
        name: "Hoboken Redevelopment at 1330 Jefferson Street",
        description:
          "We are tasked with providing a comprehensive structural design to a 22 story mixed use building in Hoboken. The project requires the implementation of innovative engineering solutions to ensure constructability while maintaining budget efficiency. A 32,000 gallon stormwater management system and flood walls will be integrated into the building design to support Hoboken's ongoing efforts to mitigate flooding.",
        advisors: [{ name: "Ronghuan Xu" }],
        sponsor: "Allied Engineering",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "1330 Struct",
      },
      // 49. [CEOE]
      {
        name: "Hudson Valley Design: Design of New Multi-Span Pedestrian Bridge over Popolopen Creek",
        description:
          "Popolopen Creek cuts through a hiking trail in the Hudson Valley. The current pedestrian bridge has anchorage systems that present potential safety hazards and does not meet current Americans with Disabilities Act (ADA) accessibility standards. Our project is to design and model a new bridge for this location that ensures user safety, accessibility, and long-term functionality.",
        advisors: [{ name: "Khondokar Billah" }],
        sponsor: "Thornton Tomasetti",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "HVD",
      },
      // 50. [CEOE]
      {
        name: "Metro Access Professionals: ADA Upgrades and Circulation Improvements",
        description:
          "Making Broadway Junction JZ lines ADA accessible by installing two elevators and two stairs.",
        advisors: [{ name: "Yi Bao" }],
        sponsor: "IH Engineers",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "MetroAccess",
      },
      // 51. [CEOE]
      {
        name: "Cleanup & Onsite Remediation Engineering (CORE) Environmental: Former Air Force Plant No. 51 Groundwater Remediation",
        description:
          "We are aiding TRC companies in their design of an in-situ groundwater remediation system for Former Air Force Plant No. 51 (an active Superfund site under the EPA) in Greece, NY. This project involves the design of a pilot study, permeable reactive barrier, and completion of associated permits.",
        advisors: [{ name: "Santhi Sri Billapati" }, { name: "Tsan-Liang Su" }],
        sponsor: "TRC Companies",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "CORE Env",
      },
      // 52. [CEOE]
      {
        name: "Egg Energy: Solids Handling Upgrade Alternatives Study",
        description:
          "This project focuses on evaluating solids handling upgrades for a wastewater treatment plant. In addition, there will also be research done on potential biogas utilization alternatives as well as looking at possible regulations for emerging contaminants and how they could impact plant operations.",
        advisors: [{ name: "Santhi Sri Billapati" }],
        sponsor: "HDR",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Egg Energy",
      },
      // 53. [CEOE]
      {
        name: "Injectanauts: Groundwater Remediation Design: EZVI Polish Injections for Chlorinated Solvent Hotspots",
        description:
          "Working with Langan to provide environmental remediation services to a private client located in Elizabeth, NJ. The Team utilized EZVI and microbial injections to target VOC contamination. The team will produce a Remedial Design Report to be used as guidance for site remediation.",
        advisors: [
          { name: "Santhi Sri Billapati" },
          { name: "Sarath Chandra Kumar Jagupilla" },
        ],
        sponsor: "Langan Engineering and Environmental Services",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Injectanauts",
      },
      // 54. [CEOE]
      {
        name: "Clear Current PFAS Treatment Facility",
        description:
          "We have been tasked with designing a PFAS treatment facility for a town in upstate New York. We are expected to select a treatment technology and create conceptual construction plans.",
        advisors: [
          { name: "Santhi Sri Billapati" },
          { name: "Sarath Chandra Kumar Jagupilla" },
          { name: "Tsan-Liang Su" },
          { name: "Ronghuan Xu" },
        ],
        sponsor: "Kimley Horn",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "Clear Current",
      },
      // 55. [CEOE]
      {
        name: "Nuclear Cargo Solutions",
        description:
          "Creating a concept design for a nuclear-powered cargo ship that is compliant with global maritime regulations, and is economically feasible. Project includes hull model design & testing and techno-economic analysis.",
        advisors: [{ name: "Raju Datla" }, { name: "Jia Mi" }],
        sponsor: "American Bureau of Shipping (ABS)",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "NucCargo",
      },
      // 56. [CEOE]
      {
        name: "ReTern Nesting: Hoboken Nesting Island",
        description:
          "The team is designing a floating island to provide a safe habitat dedicated to the local common tern population.",
        advisors: [{ name: "Jon Miller" }],
        sponsor: "Resilient Adventures",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "ReTern",
      },
      // 57. [CEOE]
      {
        name: "TalarAI: Neural Network Informed Hydrofoil Shape Optimization",
        description:
          "Our project is an AI/ML algorithm to optimize hydrofoil drag to lift ratios for high speed vessels.",
        advisors: [
          { name: "Mahmoud Ayyad" },
          { name: "Raju Datla" },
          { name: "Muhammad Hajj" },
        ],
        sponsor: "Leidos",
        contacts: [],
        majors: [
          { major: "Civil Engineering" },
          { major: "Environmental Engineering" },
        ],
        internal: false,
        groupName: "TalarAI",
      },
      // 58. [CS]
      {
        name: "101 Lens",
        description:
          "A tool that seeks to expedite and better inform patent prosecution by gathering and synthesizing patent examiners' past rhetoric with regards to 35 U.S.C. 101 and presenting patent practitioners with concise, insightful takeaways",
        advisors: [
          { name: "Eman AlOmar" },
          { name: "Patrick Hill" },
          { name: "Matthew Wade" },
        ],
        sponsor:
          "Stevens Intelligent Software Engineering and Program Analysis to Advance Research and Knowledge (SPARK) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "101 Lens",
      },
      // 59. [CS]
      {
        name: "3D Model to Engineering Drawing Tool",
        description:
          "Our project aims to automate the conversion of 3D scan data into CAD-ready models and engineering drawings",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Artisan3D",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "3D2Draw",
      },
      // 60. [CS]
      {
        name: "4VMusic",
        description:
          "Creating a useful music recommendation system for music listeners, musicians, and DJs.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: true,
        groupName: "4VMusic",
      },
      // 61. [CS]
      {
        name: "AeroShield",
        description:
          "This project will develop a resilient UAV swarm platform that detects wireless interferences and network compromise and automatically fails over between available communications (5G, WiFi, Radio, Bluetooth), while logging all actions. A lightweight P2P mesh and shared RF heatmap will enable distributed command relay and interference aware path planning so the sawm can maintain the mission and safety when ground control is unavailable.",
        advisors: [{ name: "Ying Wang" }],
        sponsor: "Stevens Mobile AI Cybersecurity Computing (MACC) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "AeroShield",
      },
      // 62. [CS]
      {
        name: "AI Scheduling Assistant",
        description:
          "Looking to develop a customizable AI agent platform that automates repetitive administrative, communication, and analytical tasks to help increase productivity",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "AI Sched",
      },
      // 63. [CS]
      {
        name: "AR Out of Home",
        description:
          "Develop a Convolutional Neural Network (CNN) capable of image recognition, segmentation, and tracking of building at panoramic distances, in order to scale programmatic digital out of home (DOOH) advertising on mobile cameras",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "In Flux Studio",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "AR OOH",
      },
      // 64. [CS]
      {
        name: "Between Calendars (BTWN)",
        description:
          "Our project aims to develop a voice assistant compatible with popular email platforms (Outlook, Gmail) that assists users with productivity and email management",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "BTWN",
      },
      // 65. [CS]
      {
        name: "Brite Boards",
        description:
          "Implement an AI-powered assistant for therapists to write reports on AAC device user analytics and consolidate, format, and provide suggestions for the therapy plan, and provide updates for parents/guardians on relevant information.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "BriteBoards",
      },
      // 66. [CS]
      {
        name: "Build the Earth (BTE) Builder Applications",
        description:
          "Developing an automated system that streamlines the application process for builders and staff on the Build The Earth NJ team. By syncing ranks and status between Discord and Minecraft, processing time can you reduced and overall improve user experience.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Build the Earth",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "BTE Builder",
      },
      // 67. [CS]
      {
        name: "Build the Earth (BTE) Progress Tracker",
        description:
          "The Build the Earth Tracker is a website integrated with Minecraft to offer an easy-to-understand view of the current progress of the New Jersey BTE team. The website will show which parts of the project are under construction and which parts are finished, through the use of commands accessible on the website and in-game.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Build the Earth",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "BTE Progress",
      },
      // 68. [CS]
      {
        name: "CenterPlate",
        description:
          "CenterPlate is a mobile app that makes meeting in the middle effortless. It helps friends, families, and coworkers find the fairest and most convenient restaurant by calculating a real drive-time midpoint for the group. Users can explore nearby restaurants filtered by cuisine, price, reviews, and dietary needs, while also coordinating transportation options and ride sharing. Unlike competitors, CenterPlate focuses on group voting, decision making, and logistics, reducing planning stress and...",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "CenterPlate",
      },
      // 69. [CS]
      {
        name: "Charity Quest: Turf Wars",
        description:
          "Turf Wars expands on the Charity Quest philanthropic network by introducing a fun, real-time strategy game based on the actions players take. Volunteers gain action points that they can use to cast magical spells. It's an idle tactics tower defense meets Risk with a little bit of Pokemon GO, but for philanthropy. Choose a Kingdom to defend, and march to battle against neighboring cities.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Charity Quest",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "CharityQ",
      },
      // 70. [CS]
      {
        name: "Connect1d",
        description:
          "The pursuit of our project is to add various features to Lowcate, Daia's blood sugar sharing application, that allow for better educational tools and quality of life improvements",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Daia Diabetes",
        contacts: [{ email: "arianna@daia.health" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Connect1d",
      },
      // 71. [CS]
      {
        name: "CrossCare",
        description:
          "CrossCare Concierge is an app that seeks to improve health outcomes during pregnancy through the use of RAG AI models. It also seeks to help during pregnancy by gamifying healthcare goals.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "CrossCare Tech",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "CrossCare",
      },
      // 72. [CS]
      {
        name: "GamePulse",
        description:
          "GamePulse is an upcoming application which plans to make watching finished sports game more thrilling by suggesting exciting games to watch without spoiling the score.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "GamePulse",
      },
      // 73. [CS]
      {
        name: "HeraHealth Postpartum Hemorrhage Tracking App",
        description:
          "HeraHealth plans to develop a Postpartum Hemorrhage tracking app that women can use after giving birth to categorize their blood loss, and indicate the need for further medical attention. There are often many under-resourced hospitals/medical facilities throughout the world that don't have the ability to assign enough personnel to constantly monitor each mother leading to many cases of Postpartum Hemorrhage going untreated.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "HeraHealth",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "HeraHealth",
      },
      // 74. [CS]
      {
        name: "Internet Cleanup Protocol",
        description:
          "CodeCloneGame is a puzzle game to teach students the principles of code refactoring in a fun and interactive way. Players navigate through a maze and refactor code to progress through multiple levels covering different refactoring concepts.",
        advisors: [{ name: "Eman AlOmar" }],
        sponsor:
          "Stevens Intelligent Software Engineering and Program Analysis to Advance Research and Knowledge (SPARK) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "ICP",
      },
      // 75. [CS]
      {
        name: "LLM Codes and Standards",
        description:
          "Our project pursuit aims to create a LLM trained on construction codes and standards such that a structural engineer can provide the details of a proposed construction project, and the tool can output the necessary codes and considerations that must be followed in design implementation",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [{ email: "josephine.cerino@stvinc.com" }],
        majors: [{ major: "Computer Science" }],
        internal: true,
        groupName: "LLM Codes",
      },
      // 76. [CS]
      {
        name: "Lumen Labs",
        description:
          "BrightLights plans to build a one-stop web-based solution to address critical challenges amongst PhD students: $108K average PhD debt paired with $59K postdoc salaries, lack of business training in doctoral programs, and limited commercialization resources outside top-tier institutions. Our capstone project addresses these critical challenges by building an AI-driven educational platform to help PhD students with career placements and researchers in general translate their research into...",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Dariya Baizhigitova '24",
        contacts: [{ email: "dbaizhig@stevens.edu" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Lumen Labs",
      },
      // 77. [CS]
      {
        name: "Micromouse",
        description:
          'Our team will work across disciplines to develop a robot to compete in nationwide maze-solving "Micromouse" competitions, building upon the foundations laid by last year\'s Micromouse competitors',
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Sean Watts '15",
        contacts: [{ email: "swatts@alumni.stevens.edu" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Micromouse",
      },
      // 78. [CS]
      {
        name: "MPIDE",
        description:
          "Online Arduino IDE is a cloud-based SaaS offering an easy-touse interface to develop and upload scripts to USB connected Arduino boards without the need to install additional software on the user's device.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "MPD.is",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "MPIDE",
      },
      // 79. [CS]
      {
        name: "NoOwe",
        description:
          "BillSplit is an application designed to make splitting costs easier. With one click, and one payment, all members in a group will be settled up with one another. This app also has features such as scanning reciepts and sending automated reminders to those who haven't paid their share yet!",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: true,
        groupName: "NoOwe",
      },
      // 80. [CS]
      {
        name: "Nummle - Restaurant",
        description:
          "A restaurant ordering app that is fully transparent about the content of food so that customers can adhere to their dietary restrictions",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Nummle",
        contacts: [{ email: "ron.gorai2020@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Nummle-R",
      },
      // 81. [CS]
      {
        name: "Nummle - User",
        description:
          "A restaurant ordering app that is fully transparent about the content of food so that customers can adhere to their dietary restrictions",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Nummle",
        contacts: [{ email: "ron.gorai2020@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Nummle-U",
      },
      // 82. [CS]
      {
        name: "PairProj",
        description:
          "PairProj Platform is a website that allows users to find opensource projects to work on as well as collaborators to work with.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "PairProj",
      },
      // 83. [CS]
      {
        name: "Palapa Compute",
        description:
          "Palapa Compute is a platform that enables people to share and access GPU computing power from anywhere. It allows users to connect their computer's GPU through a lightweight app, making it available for personal or shared use, providing an affordable and efficient way to access powerful computing resources without the specialized hardware.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Palapa",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Palapa",
      },
      // 84. [CS]
      {
        name: "Politerate",
        description:
          "While political bias in news media has long been a concern, trust in journalism has reached a critical low amid today's divisive political climate. In particular, younger audiences have found traditional news consumption to be time-intensive, confusing, and unappealing, and picking a source to get information from has never been so complicated. Politerate addressed these challenges by providing users with NLP/AI-based bias ratings for news articles alongside concise, balanced summaries that...",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "Matthew Wade",
        contacts: [{ email: "mwade@stevens.edu" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Politerate",
      },
      // 85. [CS]
      {
        name: "Project Gutenberg eBook Catalog",
        description:
          "Building a search engine, OPDS formatter and server module for Project Gutenberg to take advantage of new search capabilities and OPDS features. Thousands of people use this server per day, but the search is currently inaccurate, glitchy and is missing important features. By updating the server users will have an improved experience that makes interacting with OPDS straightforward. The new OPDS features allow for more custom organization and the using of shema.org (a format proffered by...",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Project Gutenberg",
        contacts: [
          { email: "eric@ebookfoundation.org" },
          { email: "eric@hellman.net" },
        ],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "Gutenberg",
      },
      // 86. [CS]
      {
        name: "Senior Design Marketplace",
        description:
          "Creating a streamlined process for students and faculty to connect and coordiante Senior Design projects.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor:
          "Stevens Institute of Technology Charles V. Schaefer, Jr. School of Engineering and Science Office of the Dean Undergradaute Studies",
        contacts: [
          { email: "rmanoha1@stevens.edu" },
          { email: "dvandeur@stevens.edu" },
        ],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "SDM",
      },
      // 87. [CS]
      {
        name: "Showcase",
        description:
          "A unified, affordable platform that supports collaboration, visibility, and professionalism across theater disciplines.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: true,
        groupName: "Showcase",
      },
      // 88. [CS]
      {
        name: "Stevens Flood Inundation Mapper (SFIM)",
        description:
          "The Stevens Flood Advisory System (SFAS) works to detect and predict flood risks in the NY/NJ region. We plan to rebuild the outdated website to enhance its user-friendliness and accessibility, helping to warn residents of New York and New Jersey about potential or active flooding.",
        advisors: [{ name: "Philip Orton" }],
        sponsor: "Stevens Coastal-Urban Reslience (CURes) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "SFIM",
      },
      // 89. [CS]
      {
        name: "Criteria for Responsible, Efficient & Data-Driven Infrastructure Tracker (CREDIT) (on poster)",
        description:
          "The Sustainability Scorecards project aims to enhance and scale STV's existing Envision certification automation tool by improving its database, UI/UX, analytics, and reporting capabilities for sustainable infrastructure evaluation",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "STV, Inc.",
        contacts: [{ email: "josephine.cerino@stvinc.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "CREDIT",
      },
      // 90. [CS]
      {
        name: "Digital Coach",
        description:
          "Digital coach is an AI-powered mock interview application that enables job candidates to improve and practice their ability to interview. An AI agent powers a virtual avatar and conducts a mock interview with the user which analyzes their performance using visual cues like eye-contact, as well as auditory ones such as their use of filler words. After the application analyzes these mock interviews, it generates personal and practical feedback that the user can use to improve their...",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "DigiCoach",
      },
      // 91. [CS]
      {
        name: "Drone Garage",
        description:
          "AeroShield builds a reproducible assurance pipeline connecting PX4, QGroundControl, and MAVSDK to test, log, and validate UAV mission integrity under simulated cyberattacks.",
        advisors: [{ name: "Ying Wang" }],
        sponsor: "Stevens Mobile AI Cybersecurity Computing (MACC) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "DGarage CS",
      },
      // 92. [CS]
      {
        name: "Memory Jog",
        description:
          "We plan to build a software to provide people with neurodegenerative diseases with reminders regarding daily tasks. Examples include remembering to turn off the gas after cooking, or flushign the toilet after going to the bathroom.",
        advisors: [{ name: "Patrick Hill" }, { name: "Matthew Wade" }],
        sponsor: "MPD.is",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "MemoryJog",
      },
      // 93. [CS]
      {
        name: "Parking Drone",
        description:
          "We are using drones to find available parking spots and navigating users to those spots via an intuitive interface.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: true,
        groupName: "ParkDrone",
      },
      // 94. [CS]
      {
        name: "SkyTrace: Real-Time UAV Detection and Localization",
        description:
          "Developing new and reliable ways to detect the presence of and locate the position of drones in a variety of environments through audio and radio frequency data.",
        advisors: [{ name: "Ting Liao" }, { name: "Ying Wang" }],
        sponsor: "Stevens Mobile AI Cybersecurity Computing (MACC) Laboratory",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "SkyTrace",
      },
      // 95. [CS]
      {
        name: "What Did You Get Done?",
        description:
          "What Did You Get Done is a comprehensive platform to track your productivity, celebrate your wins, and work toward goals by integrating with tools like Linear, Jira, Slack, Notion, etc.",
        advisors: [{ name: "Matthew Wade" }],
        sponsor: "Nicholas Gattuso '19",
        contacts: [],
        majors: [{ major: "Computer Science" }],
        internal: false,
        groupName: "WDYGD",
      },
      // 96. [ECE]
      {
        name: "CHIP: Chemical Harvest Inspection Partner",
        description:
          'Our project is an autonomously navigating robot designed for industrial plants and factories without smart sensors and safety systems ("Dumb factories"). Our robot will navigate the factory and detect water or other liquid chemicals spilled on the ground, then take a picture of the spill and wirelessly report it to an apllication where a manager or other stakeholder can see it and deal with it quickly and properly.',
        advisors: [{ name: "Bernard Yett" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "CHIP",
      },
      // 97. [ECE]
      {
        name: "Autonomous Trash Collecting Robot",
        description:
          "Robot that can autonomously detect, travel to, and collect trash in lakes, rivers, ponds, and other small to medium sized bodies of water.",
        advisors: [{ name: "Yi Guo" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "TrashBot",
      },
      // 98. [ECE]
      {
        name: "Crop Tech v2 App",
        description:
          "A developing web application that will be used for the agriculture clients of Crop Tech Solutions in Gothenburg, Nebraska. The web application will funnel the internal database of Crop Tech to display the client's information in a diegetic and autonomous way with an appropriate autonomous frontend and backend server.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "Crop Tech Solutions",
        contacts: [{ email: "jc_smith@croptechsolutions.com" }],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: false,
        groupName: "CropTech",
      },
      // 99. [ECE]
      {
        name: "DensiSense 2.0",
        description:
          "DensiSense 2.0 is continuation of DensiSense. DensiSense is a breakthrough, non-invasive breast health monitoring system that empowers women with dense breast tissue to take charge of early tumor monitoring, right from the comfort of home. With DensiSense, women gain a safe, convenient, and proactive solution to monitor their breast health and protect their future.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "DensiSense",
      },
      // 100. [ECE]
      {
        name: "INDRA",
        description:
          "INDRA is a High-Power Microwave device, utilizing solid state technology in order to deliver a highly modifiable Electromagnetic pulse device. Our goal is to make this technology smaller, easier to transport, and cut down on production time and cost for customers.",
        advisors: [{ name: "Tewodros Zewde" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "INDRA",
      },
      // 101. [ECE]
      {
        name: "Laboratory Incident and Saftey Automation (LISA)",
        description:
          "The L.I.S.A. (Lab Inventory and Safety Automation) project is an automated, AI-powered camera monitoring system designed to proactively enhance safety protocols and mitigate risks in laboratory environments, particularly those involving potentially dangerous equipment (e.g., in chemistry or engineering labs). The intent is to leverage image recognition and an embedded system to provide continuous, automated object detection of the lab workspace.",
        advisors: [{ name: "Hong Man" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "LISA",
      },
      // 102. [ECE]
      {
        name: "LiDAR Threat Detection System",
        description:
          "Our project focuses on designing and implementing a hardware-based engineering solution that integrates embedded systems, sensing, and system-level design to solve a real-world problem. The project emphasizes reliability, scalability, and practical deployment considerations.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "LiDARThreat",
      },
      // 103. [ECE]
      {
        name: "Redefine Lighting",
        description:
          "Our project is an automated operating-room light that will automatically track and illuminate the surgical work area. Our light will have an integrated camera and utilize an AI image detection model to detect exposed bone which will then control the servos to point the light in the right area.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "Redefine Surgery",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: false,
        groupName: "RedefLight",
      },
      // 104. [ECE]
      {
        name: "SimplyPark",
        description:
          "SimplyPark is a smart parking availability system that utilizes ultrasonic sensors above parking spots to detect vehicle presence and transmit real-time data to a backend server. Availability is shown through color-coded LEDs and live digital maps at each floor of the garage, with an initial proof-of-concept deployment in Babbio Garage.",
        advisors: [{ name: "Bernard Yett" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "SimplyPark",
      },
      // 105. [ECE]
      {
        name: "Smart Access Mailbox System",
        description:
          "The smart access mailbox aims to improve mail security by allowing a dual-access hybrid lock. Its unique feature is having a digital master key which can be remotely deactivated, thus making it virtually impossible to steal/access.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "SmartMail",
      },
      // 106. [ECE]
      {
        name: "Smart Bells Gym Assistant",
        description:
          "Smart Bells is an AI powered gym assistant app that aims to make its users more successful in the gym by analyzing their form and giving real-time feedback.",
        advisors: [{ name: "Hong Man" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "SmartBells",
      },
      // 107. [ECE]
      {
        name: "Sun Seeker",
        description:
          "Sun Seeker is a solar tracker intended to help maximize panel efficiency by autonomously angling itself to the most optimal position.",
        advisors: [{ name: "Lei Wu" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "SunSeeker",
      },
      // 108. [ECE]
      {
        name: "TygerTrax Fitness Sensor and App",
        description:
          "Our project is a fitness sensing handle designed for resistance bands for gym workouts. Additionally, there is an app where the user can easily view their progress through their workout history.",
        advisors: [{ name: "Kevin Lu" }],
        sponsor: "James Curley",
        contacts: [{ email: "curleyjf@gmail.com" }],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: false,
        groupName: "TygerTrax",
      },
      // 109. [ECE]
      {
        name: "Aventix",
        description: "Aventix is a blockchain-based ticketing platform.",
        advisors: [{ name: "Mukund Iyengar" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Electrical Engineering" },
          { major: "Computer Engineering" },
        ],
        internal: true,
        groupName: "Aventix",
      },
      // 110. [ME]
      {
        name: "Amphibious Remotely Operated Vehicle (AROV)",
        description:
          "Building upon last year's Unmanned Underwater Vehicle, this team is designing and manufacturing a vehicle that can demonstrate mobility on land, make a smooth transition into water, and demonstrate mobility underwater. The AROV is controlled by a human operator, who uses camera and sonar to pilot the vehicle remotely.",
        advisors: [{ name: "Kishore Pochiraju" }],
        sponsor: "General Dynamics Mission Systems (GDMS)",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "AROV",
      },
      // 111. [ME]
      {
        name: "Autonomous IV Infusion System (Alarm Mitigation)",
        description:
          "We are developing an autonomous IV infusion system engineered to proactively mitigate alarm conditions through integrated sensing, real-time feedback control, and automated corrective actions. Unlike current infusion devices, our solution eliminates common failure points that trigger alarms, improving reliability, reducing clinical interruptions, and optimizing patient outcomes.",
        advisors: [{ name: "Zahra Pournorouz" }, { name: "Long Wang" }],
        sponsor: "123IV",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "AutoIV",
      },
      // 112. [ME]
      {
        name: "BluesBot: The Autonomous Harmonica-Playing Robot",
        description:
          "Our goal is to design and synthesize a robot to autonomously perform music on an off-the-shelf harmonica in a manner similar to a human performer. It should autonomously switch between blow and draw airflows, play chords, and single notes from instructions provided by MIDI scripts.",
        advisors: [{ name: "Mishah Uzzil Salman" }],
        sponsor: "L3Harris",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "BluesBot",
      },
      // 113. [ME]
      {
        name: "Boundless Buddy 2.0",
        description:
          "Boundless Buddy is a parental safety device which allows the parent to keep track of their child when out of view. If the child has left the boundary, an audible notification would alert both the parent and child.",
        advisors: [{ name: "Frank Fisher" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "BndlessBddy",
      },
      // 114. [ME]
      {
        name: "DIY Wind Tunnel (Portable Wind Tunnel for Aerospace Applications)",
        description:
          "Our project involves improving on a portable wind 'tunnel' that was started last year, which includes a 6x6 fan array that is connected to power and utilizes a PWM signal to control the fan speeds. The team will be creating an airfoil testing system that will measure the lift and drag on an airfoil using the wind generated from the fans. The team will also analyze this aerodynamic data to form conclusions on airfoil design.",
        advisors: [{ name: "Jason Rabinovitch" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "WindTunnel",
      },
      // 115. [ME]
      {
        name: "Drone Garage: Perception and Control (D-Tech)",
        description:
          "The Drone Garage Perception and Control project focuses on the design and fabrication of a fully custom, modular Unmanned Aerial System (UAS). Our architecture prioritizes mission versatility, featuring a rapid-interchange interface that allows operators to seamlessly switch between diverse payloads-from heavy-lift delivery mechanisms to precision computer vision tracking systems-without compromising flight stability.",
        advisors: [{ name: "Hamid Jafarnejad Sani" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "D-Tech",
      },
      // 116. [ME]
      {
        name: "Drone Garage: Structures, Propulsion & Systems (SP) Bay",
        description:
          "The mission of the Drone Garage project is to design, develop, and demonstrate a modular, field-deployable support system that enables rapid assembly, repair, reconfiguration, and performance optimization of small unmanned aerial systems. Our goal is to deliver a versatile and robust solution that allows operators to adapt drones for diverse missions under austere conditions. By integrating mechanical, electrical, and digital systems into a unified and portable platform, we aim to provide a...",
        advisors: [{ name: "Kishore Pochiraju" }],
        sponsor: "General Dynamics Mission Systems (GDMS)",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "SP Bay",
      },
      // 117. [ME]
      {
        name: "HipAlign by Maxx Ortho",
        description:
          "We are developing a compact alignment device that provides surgeons with real-time angle feedback during hip replacement surgery. The device attaches to standard surgical instruments and uses inertial sensors to measure orientation, helping improve implant placement accuracy.",
        advisors: [{ name: "Robert Chang" }],
        sponsor: "Maxx Orthopedics",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "HipAlign",
      },
      // 118. [ME]
      {
        name: "Magnetorheologically Coupled Ball Drive Ball Drive Team (MRCBD-BDT)",
        description:
          "The purpose of the MRCBD Ball Drive project is to develop a miniaturized, table-top scale UGV that provides a reasonable alternative to current omnidirectional motorized platform products. The vehicle's distinctive feature, a miniaturized holonomic ball drive which utilizes magnetic coupling between the drive body and its spherical-shaped wheel, is a technology which allows for agility and maneuverability with extreme precision. Due to this, the MCBD can be applied to many industries, from...",
        advisors: [{ name: "Biruk Gebre" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "BallDrive",
      },
      // 119. [ME]
      {
        name: "NavFusion - AI for Robust Navigation Solutions",
        description:
          "This project is centered around the need for reliable robot localization in situations where GPS signals are unavailable. Although GPS signals are commonly the primary source of mobile robot localization, these systems are uniquely vulnerable to GPS denial and spoofing. Overall, the goal of this project is to demonstrate how AI can help bridge the gap between low-grade and high-grade IMUs, making it possible for robots and autonomous vehicles to maintain accurate navigation even in...",
        advisors: [
          { name: "Brendan Englot" },
          { name: "Chaitanya Krishna Vallabh" },
        ],
        sponsor: "Kearfott Guidance & Navigation",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "NavFusion",
      },
      // 120. [ME]
      {
        name: "Next-Gen Linear Peristaltic Pump",
        description:
          "For our project we are working on a benchtop linear peristaltic pump with the use of a camshaft mechanism. Its purpose is to deliver sterile viscous liquids for vaccine filling lines.",
        advisors: [{ name: "Kevin Connington" }],
        sponsor: "Merck",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "NxtGenPump",
      },
      // 121. [ME]
      {
        name: "Omni-Drive (Magnetorheologically Coupled Ball Drive Chassis & Suspension Team (MRCBD-CST))",
        description:
          "We are developing the chassis and suspension system of a robot that utilizes spherical wheels for omni-directional movement. We work closely with another team that is designing the spheres and the drives that they will be mounted upon.",
        advisors: [{ name: "Biruk Gebre" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "OmniDrive",
      },
      // 122. [ME]
      {
        name: "Owl Optics Gimbaled Optical Sensor System",
        description:
          "Designing and building a gimbaled optical sensor system that can autonomously locate and track a 10 inch disk from across the Hudson River. The long term goal is to develope this into something that can be mounted underneath a flying UAV.",
        advisors: [{ name: "Brendan Englot" }, { name: "Mishah Uzzil Salman" }],
        sponsor: "Seimens Government Technologies",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "OwlOptics",
      },
      // 123. [ME]
      {
        name: "Soft Exosuit for Spinal Muscular Atrophy (SESMA) 4.0",
        description:
          "SESMA 4.0 is a lightweight, wearable soft exosuit designed to assist individuals with Spinal Muscular Atrophy (SMA) Type III during sit-to-stand movements and other daily mobility tasks. The system uses vacuum-based actuation, real-time sensing, and a safety-focused control algorithm to provide targeted assistance while remaining affordable and energy-efficient.",
        advisors: [{ name: "Damiano Zanotto" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "SESMA 4.0",
      },
      // 124. [ME]
      {
        name: "ThorLabs Automated Lens Blocking",
        description:
          "We are automating a manual process inside of their factory that involved picking up and placing down optical lenses. Before they are picked up, there needs to be a adhesive that is placed under it to properly stick onto a block.",
        advisors: [{ name: "Frank Fisher" }],
        sponsor: "ThorLabs",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "ThorLens",
      },
      // 125. [ME]
      {
        name: "Wired-In",
        description:
          "Wire Arc Additive Manufacturing (WAAM) is a modern metal 3D printing method that uses an electric arc to melt metal wire and build parts layer by layer. It is based on MIG welding and allows medium-to-large metal components to be produced more affordably, with benefits like shorter production times, less material waste, and greater design flexibility. By adapting a standard desktop 3D printer to use a MIG welding torch instead of a plastic extruder, this approach could make metal 3D printing...",
        advisors: [
          { name: "Souran Manoochehri" },
          { name: "Chaitanya Krishna Vallabh" },
          { name: "Chan Yu" },
        ],
        sponsor: "L3Harris",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "Wired-In",
      },
      // 126. [ME]
      {
        name: "Zephyr",
        description:
          "We are creating a Vertical Axis Wind Turbine testing unit for individual researchers to test their blade designs. This should help foster innovation in the VAWT clean energy field.",
        advisors: [{ name: "Kevin Connington" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "Zephyr",
      },
      // 127. [ME]
      {
        name: "H2Volt: In-Pipe Hydropower",
        description:
          "Our team aims to create a device that uses the pressure drop within building water pipes to turn a micro turbine that results in the production of electricity.",
        advisors: [{ name: "Chang-Hwan Choi" }],
        sponsor: "Nima Kalantari",
        contacts: [{ email: "mkalanta@stevens.edu" }],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "H2Volt",
      },
      // 128. [ME]
      {
        name: "Harvesting Rainwater Energy 2.0",
        description:
          "This project entails utilizing droplets from rainfall in the means of electric energy production by using a piece of technology called Triboelectric Electric Nano Generator (TENG). This technology relies on contact electrification when droplets of water strike a configuration of charged and conductive surfaces. For seamless application within preexisting lifestyles, our system is adapted within a downspout for passive energy production.",
        advisors: [{ name: "Eui-Hyeok Yang" }],
        sponsor: "Sigma Design Company",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "RainEnergy",
      },
      // 129. [ME]
      {
        name: "Hypersonic Nozzle",
        description:
          "This project involves the design, analysis, and fabrication of a Mach 14-capable hypersonic nozzle for the Stevens shock tunnel. The goal is to deliver uniform, shockless helium flow through optimized nozzle contour design, CFD validation, and material selection suitable for high-enthalpy testing.",
        advisors: [{ name: "Nicholaus Parziale" }],
        sponsor: "Stevens Department of Mechanical Engineering",
        contacts: [{ email: "nparziale@stevens.edu" }],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "HyperNozzle",
      },
      // 130. [ME]
      {
        name: "Laser Directed Energy Deposition Cooling Solution",
        description:
          "We are building a heat exchanger to cool the substrate of a DED 3D printer. The purpose of this cooling is to alter the material properties of the finished metal part produced by the printer.",
        advisors: [{ name: "Chang-Hwan Choi" }],
        sponsor: "Seyed Mohammad Hosseini",
        contacts: [{ email: "shossei3@stevens.edu" }],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "LDEDCool",
      },
      // 131. [ME]
      {
        name: "Magnetically Actuated Thrombectomy Guidewire (MATG)",
        description:
          "A magnetically actuated thrombectomy guidewire used by neurosurgeons to make a thrombectomy faster and safer. A metal tip attached to a wire is guided using magnetic fields. The tip is guided up the patients body to reach any blood clots that are in the brain.",
        advisors: [{ name: "Yong Shi" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "MATG",
      },
      // 132. [ME]
      {
        name: "Optimization and Redesign of the SAE Baja Suspension System",
        description:
          "The project involved redesigning the Baja SAE suspension system for the Stevens Baja Team. The project is deployed directly on the car, where it will go through the Baja SAE competition.",
        advisors: [{ name: "Elsayed Aziz" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "BajaSusp",
      },
      // 133. [ME]
      {
        name: "Quick-Release Hub",
        description:
          "Our project aims to redesign and improve the original concept using modern materials, control technologies, and manufacturing methods. The updated design introduces a quick-release propeller hub integrated into a twist-lock system to securely and efficiently attach propellers to the drone.",
        advisors: [{ name: "Elsayed Aziz" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "QRHub",
      },
      // 134. [ME]
      {
        name: "RBD.I.Y.: Educational Exhibit on Rigid Body Dynamics",
        description:
          "The goal of this project is to design an educational resource that can be utilized by educators to assist students in developing a deeper understanding of one or more concepts within the field of rigid body dynamics through hands-on, observational, and interactive learning.",
        advisors: [{ name: "Maxine Fontaine" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "RBDIY",
      },
      // 135. [ME]
      {
        name: "Robotic End-Effector for Combat Casualty Care 2.0",
        description:
          "A robotic hand to perform different combat medical tasks. It needs to compress a bag valve mask, place a pulse computer, insert a catheter, and a few other medical tasks. It will be teleoperated through a software and user interface.",
        advisors: [{ name: "Long Wang" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "RobotHand",
      },
      // 136. [ME]
      {
        name: "Safe-D-Beam",
        description:
          "We are creating a bike light that is powered by the vibrations experienced during that ride. The light itself is a red halo cast on the ground in front of the rider making them more visible for oncoming traffic. A multi-directional piezoelectric system is being used to harvest and convert the mechanical energy into electrical energy.",
        advisors: [{ name: "Christopher Sugino" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "SafeDBem",
      },
      // 137. [ME]
      {
        name: "SortSense",
        description:
          "Design and build a device that can sort and/or count the various pieces in the ENGR 211 kits. The majority of pieces come from the Structural Engineering kit by Thames & Kosmos. The device should recognize most or all pieces from the kit in order to sort them by type into separate bins. Displaying a count of each type of piece would be a helpful feature.",
        advisors: [{ name: "Maxine Fontaine" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "SortSense",
      },
      // 138. [ME]
      {
        name: "Strata Thermal (3D Printed Heat Exchanger Using 17-4PH Stainless Steel Filament)",
        description:
          "We are designing and 3d printing a metal heat exchanger. Specifically, we are designing a cold plate that uses flowing water for cooling high powered computer chips (potentially AI chips). 3d printing heat exchangers allow for complex geometries that increase heat transfer compared to traditional manufacturing methods.",
        advisors: [{ name: "Chang-Hwan Choi" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "StrataTher",
      },
      // 139. [ME]
      {
        name: "TheraV Exoglove",
        description:
          "For stroke patients who experience hand spasticity, the TheraV glove is a modular soft robotic exoglove that aids full hand mobility and relieves pain through compression and pseudo-massage. Unlike traditional occupational therapy and generic commercial products on the market, our product provides a comprehensive and accessible solution, making treatment less daunting to stroke survivors.",
        advisors: [{ name: "Jacqueline Libby" }],
        sponsor: "L3Harris",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: false,
        groupName: "TheraV",
      },
      // 140. [ME]
      {
        name: "VorTech Energy",
        description:
          "The VorTech Energy harvester provides clean, consistent power from fluid flow by tuning into natural resonance frequencies and adapting to fluid flow conditions. Power small electronics in remote locations using self-sufficient green energy and adapt to varying weather conditions. An adjustable mass within the cantilever beam adjusts its resonance frequency to work rain or shine.",
        advisors: [{ name: "Gizem Acar" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mechanical Engineering" }],
        internal: true,
        groupName: "VorTech",
      },
      // 141. [MS]
      {
        name: "A Picture of a Spectral Cover of Rank 4",
        description:
          "Spectral Networks have applications to supersymmetry in physics and is of interest in the field of geometric structures on surfaces. It is previously known how a spectral cover of an ideal triangulation of a torus for rank 2 and 3 look. Here we attempt to construct a picture of a spectral cover of rank 4. The hope of undergoing this procedure is to gain insight and intuition of how to construct an inductive proof describing the covering space of any rank on the triangulation.",
        advisors: [{ name: "Daniele Alessandrini" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "SpectralCov",
      },
      // 142. [MS]
      {
        name: "AI Analysis of the Calderon Problem",
        description:
          "2026 Stevens senior design project in MS: AI Analysis of the Calderon Problem.",
        advisors: [{ name: "Pavel Dubovski" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "AICalder",
      },
      // 143. [MS]
      {
        name: "Development of $r$-analytic Functions for Axisymmetric Stokes Flow",
        description:
          "There are many problems in applied mathematics that require the modeling of fluid flow through a tube with a fixed object placed inside. Hydroelectric turbines involve water flowing through a tube to spin a turbine, jet engines involve intaking air through a turbine to produce thrust, solid objects such as blood clots can block the flow of blood in an artery, and many other physical situations can be understood better with such a model. The solutions for Stokes Flow is well-studied for...",
        advisors: [{ name: "Michael Zabarankin" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "rAnalytic",
      },
      // 144. [MS]
      {
        name: "Generalized Tikhonov-Type Regularization and the Caldern Inverse Conductivity Problem",
        description:
          "2026 Stevens senior design project in MS: Generalized Tikhonov-Type Regularization and the Caldern Inverse Conductivity Problem.",
        advisors: [{ name: "Pavel Dubovski" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "Tikhonov",
      },
      // 145. [MS]
      {
        name: "Simulation-Based Analysis of Percolation Threshold in Two- and Three-Dimensional Lattices",
        description:
          "This project aims to model the emergence of large-scale connectivity in random lattices through simulation. We consider site percolation on finite L L and L L L grids, where each site is independently occupied with probability p, and study the existence of spanning paths across the system. Connectivity is determined by interpreting each configuration as a graph and testing for the presence of a path between opposing boundaries. Repeating this experiment over many realizations allows us to...",
        advisors: [{ name: "Pavel Dubovski" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "Percolation",
      },
      // 146. [MS]
      {
        name: "Statistical Tests for Risk Measures",
        description:
          "We evaluate portfolio optimization under coherent risk measures, emphasizing their estimation, representation, and statistical reliability. We model and estimate risk measures as composite risk functionals. A risk function is a mapping that takes a random loss or return and assigns it a real number that represents a risk value. A composite risk functional is layered and combines multiple measures of risk into one function. We will mainly work with these composite risk functionals, satisfying...",
        advisors: [{ name: "Darinka Dentcheva" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "StatRisk",
      },
      // 147. [MS]
      {
        name: "The D-Stability of the product of certain stable matrices",
        description:
          "This project will focus on the specific class of stable matrices known as D-stable matrices. It will aim to provide specific cases and conditions in which the product of multiple D-stable matrices remains D-stable. This will be accomplished by analyzing the eigenvalues of these matrix products and where they lie in the complex plane. Additionally, M-matrices and their properties will be used in proving D-stability.",
        advisors: [{ name: "Upendra Prasad" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "DStability",
      },
      // 148. [MS]
      {
        name: "Using PatternBoost to Examine the Difference Between Minimum and Maximum Zero Forcing Sets in Trees",
        description:
          "Given a graph G = (V,E), a zero forcing set is a subset of vertices Z?V such that, under the iterative application of the color-change rule, where a colored vertex with exactly one uncolored neighbor forces that neighbor to become colored, all vertices of G eventually become colored. The zero forcing number Z(G) is then the minimum cardinality of such a set. A zero forcing set is said to be minimum if its size equals Z(G), and minimal if none of its proper subsets is a zero forcing set. It...",
        advisors: [{ name: "Eric Ramos" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Mathematics" }],
        internal: true,
        groupName: "PatternBoost",
      },
      // 149. [PHY]
      {
        name: "Visual Reconstruction with EEG",
        description:
          "Individuals with motor disabilities due to paralysis, strokes, or other neurological diseases cannot communicate visual thoughts or mental imagery, limiting their expression and quality of life. Visual reconstruction refers to recreating an image of what a person sees using their brain data and machine learning models. Electroencephalograms (EEG) is a recording of electrical activity from the brain and is appealing because of its portability, prevalence, and modest price. However, prior work...",
        advisors: [{ name: "Robert Pastore" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [{ major: "Physics" }],
        internal: true,
        groupName: "VisEEG",
      },
      // 150. [SE]
      {
        name: "aWhere",
        description:
          "FindIt is a low-cost, long-range asset and people tracking system designed to improve safety for caregivers and families. It uses LoRaWAN-based trackers and a web dashboard to monitor location, detect geofence violations, and send alerts in real time without relying on expensive cellular subscriptions.",
        advisors: [
          { name: "David Darian Muresan" },
          { name: "Ryan Ona" },
          { name: "Damiano Zanotto" },
        ],
        sponsor: "Stevens Wearable Robotic Systems Laboratory",
        contacts: [{ email: "dzanotto@stevens.edu" }],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: false,
        groupName: "aWhere",
      },
      // 151. [SE]
      {
        name: "CTRL",
        description:
          "Ctrl is an iOS digital wellness application designed to help users improve focus and reduce distraction through ethical, non-punitive intervention. It supports guided focus sessions and selectively blocks or reroutes addictive app features while still allowing limited, intentional use. The system emphasizes behavior change through structured constraints, feedback, and long-term focus and brain health insights.",
        advisors: [{ name: "David Darian Muresan" }, { name: "Matthew Wade" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "CTRL",
      },
      // 152. [SE]
      {
        name: "PortSmarter: Smart Port Coordination Portal (SPCP)",
        description:
          "Ports face operational inefficiencies because trucks, equipment, and container management systems operate separately, limiting real-time visibility and coordination across berth, yard, and gate operations. Our project addresses this by developing the Smart Port Coordination Portal, which uniquely combines a mobile app for truck drivers with IoT GPS tracking for port assets to create a single, real-time operational view. This integrated approach reduces congestion and delays by synchronizing...",
        advisors: [{ name: "Hao Chen" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "PortSmarter",
      },
      // 153. [SE]
      {
        name: "Remote Unmanned Aeroamphibian (RUA) for Modular Operations in Complex Environments",
        description:
          "The project aims to develop a quadcopter capable of controlled movement in both aerial and underwater environments, including seamless transition between the air and water. This is made possible using responsive pitch mechanics and active data augmentation enabled by a custom-built flight controller. The product will enable new solutions for the defense and infrastructure industries.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "RUA",
      },
      // 154. [SE]
      {
        name: "Trident Marine Technologies: Cargo Container Lock Innovation",
        description:
          "We are aiming to minimize the cargo ship time in port. To do this we identified monotonous and time consuming steps within the loading and unloading process and decided to focus on the locking mechanisms between the cargo containers and their connections. We will reengineer the container to automatically translate the locking from the container roof to floor to minimize the time and risks associated with connections.",
        advisors: [{ name: "Hao Chen" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "Trident",
      },
      // 155. [SE]
      {
        name: "LiSTeN: Music Visualization Screensaver/Projection",
        description:
          "The purpose of the project is to enhance the music listening experience by blending it with visual elements. Our intent is to design a platform that not only engages its audience in a new way, but also broadens the accessibility of music visualization.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor: "Arti Bhatt",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: false,
        groupName: "LiSTeN",
      },
      // 156. [SE]
      {
        name: "QuackOps",
        description:
          "QuackOps is a autonomous drone delivery system that uses AI for navigation and visual target recognition. We aim to provide fast, contactless, and efficient on-campus delivery of goods and food.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor: "L3Harris",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: false,
        groupName: "QuackOps",
      },
      // 157. [SE]
      {
        name: "Vertex: AI Assistant for 3D Modeling",
        description:
          "The cursor of 3D modeling: AI powered software that makes 3D modeling simpler and more efficient",
        advisors: [
          { name: "Mukund Iyengar" },
          { name: "David Darian Muresan" },
        ],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "Vertex",
      },
      // 158. [SE]
      {
        name: "MGB UML",
        description:
          "MGB_UML is a software application that is designed to make creating UML diagrams easier. By using a drag and drop system that can export those diagrams as eps files for use in latex documents, this will allow for UML diagrams to be made simply and easily. We also plan on including a guide and other helpful features to help those who don't know how to make UML diagrams be able to do so.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor: "Stevens Institute of Technology",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: true,
        groupName: "MGB UML",
      },
      // 159. [SE]
      {
        name: "Symposia",
        description:
          "GreekConnect is an app and web app for fraternity and sorority members to find events. It exists to provide a central notification system that helps both event managers and students keep track of upcoming events.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor:
          "Stevens Institute of Technology Division of Student Affairs Office of Undergraduate Studies Department of Fraternal and Sorority Life",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: false,
        groupName: "Symposia",
      },
      // 160. [SE]
      {
        name: "Team Extreme: Extending Trustworthy Natural Language Interfaces for Quantum Optimization",
        description:
          "We are working to make a natural language interface to allow the everyday person to leverage the power of quantum computers.",
        advisors: [{ name: "David Darian Muresan" }],
        sponsor: "D-Wave Systems",
        contacts: [],
        majors: [
          { major: "Software Engineering" },
          { major: "Mechanical Engineering" },
        ],
        internal: false,
        groupName: "Team Extreme",
      },
      // 161. [SES]
      {
        name: "Gallois Autonomous Robot Competition (GARC)",
        description:
          "The development of autonomous machines and technologies is increasingly necessary in a rapidly technologically-advancing world. A simple feedback system can remove the need for manual control in menial tasks, freeing time to address issues that are more sensitive, critical, and deserving of human manipulation. The Gallois Autonomous Robot Competition aims to showcase student capabilities in developing an autonomous system with a self-positioning robot, using both ultrasonic and LiDAR sensors...",
        advisors: [
          { name: "Chang Beom Joo" },
          { name: "Alex Reina" },
          { name: "Sean Rooney" },
          { name: "Anthony Russo" },
          { name: "Anthony Shupenko" },
          { name: 'Jongyoun "Jay" Son' },
          { name: "Edgar Troudt" },
        ],
        sponsor: "Dean Emeritus Bernard Gallois",
        contacts: [],
        majors: [
          { major: "Mechanical Engineering" },
          { major: "Civil Engineering" },
        ],
        internal: false,
        groupName: "GARC",
      },
      // 162. [SES]
      {
        name: "Lincoln Investigation and Navigation Cadet (L.I.N.C.)",
        description:
          'Beginning in the 1950\'s, law enforcement and first responders within the bi-state Lincoln Tunnel utilized specialized electric vehicles to provide surveillance to vehicles, drivers, and passengers, as well as to respond to traffic emergencies occurring within the tunnel. The "catwalk car", which ran along a guiderail mounted to the tunnel catwalk, was discontinued in 2011, and ceiling-mounted cameras became the primary form of emergency response. As a result, first responders are often...',
        advisors: [{ name: "Anthony Shupenko" }],
        sponsor: "Port Authority of New York and New Jersey",
        contacts: [],
        majors: [
          { major: "Mechanical Engineering" },
          { major: "Civil Engineering" },
        ],
        internal: false,
        groupName: "LINC",
      },
      // 163. [SES]
      {
        name: "Society of Automotive Engineers (SAE) BAJA Team",
        description:
          "Our goal is to spread the passion and knowledge required to be a successful engineer, by competing in the collegiate competition called Baja SAE (Society of Automotive Engineers). Baja SAE is an engineering challenge where students design, build, and test a fully functioning off road car. The level of complexity required for the car requires simulating an engineering firm where the balance between brainstorming and project organization is a need. The Stevens Baja SAE team offers levels of...",
        advisors: [{ name: "Elsayed Aziz" }, { name: "Paul McClelland" }],
        sponsor: "Braddock Metallurgical",
        contacts: [],
        majors: [
          { major: "Mechanical Engineering" },
          { major: "Civil Engineering" },
        ],
        internal: false,
        groupName: "SAE BAJA",
      },
    ];
    // Total: 163 entries

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

    //  2026 Projects
    console.log("Seeding 2026 projects...");
    const projs2026 = await Promise.all(
      projects2026.map((p) =>
        new Project({
          userId: coord1._id,
          name: p.name,
          description: p.description,
          advisors: p.advisors,
          sponsor: p.sponsor,
          contacts: p.contacts,
          majors: p.majors,
          year: 2026,
          internal: p.internal,
          isOpen: false,
          assignedGroup: null,
        }).save(),
      ),
    );

    //  2026 Groups (one per project, assigned immediately)
    console.log("Seeding 2026 groups...");
    const grps2026 = await Promise.all(
      projects2026.map((p, i) =>
        new Group({
          groupNumber: 100 + i,
          name: p.groupName,
          groupCode: `G26${String(i + 1).padStart(4, "0")}SED`,
          groupMembers: [],
          isOpen: false,
          isPublic: true,
          joinRequests: [],
          interestedProjects: [projs2026[i]._id],
          assignedProject: projs2026[i]._id,
        }).save(),
      ),
    );

    //  Backfill: 2026 project.assignedGroup
    console.log("Linking 2026 assigned groups to projects...");
    await Promise.all(
      projs2026.map((p, i) =>
        Project.findByIdAndUpdate(p._id, { assignedGroup: grps2026[i]._id }),
      ),
    );

    //  Summary
    console.log("\n=== Seed complete ===");
    console.log(`\nAll accounts use password: ${DEV_PASSWORD}`);
    console.log("\nCoordinators:");
    console.log("  s.chen@stevens.edu     Dr. Sarah Chen");
    console.log("  m.torres@stevens.edu   Dr. Michael Torres");
    console.log("\nDev Groups:");
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
      `\nCounts: 2 coordinators | 26 students | ${47 + projs2026.length} projects | ${7 + grps2026.length} groups`,
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
