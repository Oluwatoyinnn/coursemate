import json

with open("src/data/timetableData.json", "r") as f:
    data = json.load(f)

sessions = data["sessions"]
courses = data["courses"]

# Verified Official Venues & Capacities from TIMTEC PDF (Pages 4 and 5)
official_venues = [
    {"name": "MP 01", "building": "Oyebade Lipede Multipurpose", "capacity": 800, "type": "Lecture Theatre"},
    {"name": "MP 02", "building": "Oyebade Lipede Multipurpose", "capacity": 400, "type": "Lecture Theatre"},
    {"name": "MP 03/04", "building": "Oyebade Lipede Multipurpose", "capacity": 250, "type": "Lecture Room"},
    {"name": "MPL", "building": "Oyebade Lipede Multipurpose", "capacity": 200, "type": "Laboratory"},
    {"name": "R 205", "building": "COLPLANT 1st Floor", "capacity": 80, "type": "Lecture Room"},
    {"name": "R 206", "building": "COLPLANT 1st Floor", "capacity": 80, "type": "Lecture Room"},
    {"name": "PPCP LR", "building": "COLPLANT", "capacity": 120, "type": "Lecture Room"},
    {"name": "PBST LR", "building": "COLPLANT", "capacity": 120, "type": "Lecture Room"},
    {"name": "HRT LR", "building": "COLPLANT", "capacity": 120, "type": "Lecture Room"},
    {"name": "CPT LR", "building": "COLPLANT", "capacity": 120, "type": "Lecture Room"},
    {"name": "SSLM LR", "building": "COLPLANT", "capacity": 120, "type": "Lecture Room"},
    {"name": "CPL", "building": "COLPLANT Auditorium", "capacity": 200, "type": "Auditorium"},
    {"name": "A 101", "building": "COLBIOS Auditorium", "capacity": 300, "type": "Auditorium"},
    {"name": "CAD", "building": "COLANIM Auditorium", "capacity": 500, "type": "Auditorium"},
    {"name": "JAO 1", "building": "Julius A. Okojie Lecture Theatre", "capacity": 500, "type": "Lecture Theatre"},
    {"name": "JAO 2", "building": "Julius A. Okojie Lecture Theatre", "capacity": 500, "type": "Lecture Theatre"},
    {"name": "JAO 3", "building": "Julius A. Okojie Lecture Theatre", "capacity": 1140, "type": "Lecture Theatre"},
    {"name": "ANE I", "building": "Chief Tony Anenih Multipurpose", "capacity": 300, "type": "Lecture Theatre"},
    {"name": "ANE II", "building": "Chief Tony Anenih Multipurpose", "capacity": 300, "type": "Lecture Theatre"},
    {"name": "ENGR AUD", "building": "COLENG (Engineering Auditorium)", "capacity": 480, "type": "Auditorium"},
    {"name": "ENG AUD", "building": "COLENG (Engineering Auditorium)", "capacity": 480, "type": "Auditorium"},
    {"name": "CVE UP", "building": "COLENG Civil Engineering", "capacity": 50, "type": "Lecture Room"},
    {"name": "CVE DOWN", "building": "COLENG Civil Engineering", "capacity": 50, "type": "Lecture Room"},
    {"name": "GLR I", "building": "Chief Dr Olusegun Obasanjo Engineering Building", "capacity": 100, "type": "Lecture Room"},
    {"name": "GLR II", "building": "Chief Dr Olusegun Obasanjo Engineering Building", "capacity": 100, "type": "Lecture Room"},
    {"name": "GLR III", "building": "Chief Dr Olusegun Obasanjo Engineering Building", "capacity": 100, "type": "Lecture Room"},
    {"name": "ABE LR", "building": "Chief Dr Olusegun Obasanjo Engineering Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "MCE LR", "building": "Chief Dr Olusegun Obasanjo Engineering Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "A 105", "building": "COLERM Ground Floor", "capacity": 100, "type": "Lecture Room"},
    {"name": "A 110", "building": "COLERM Ground Floor", "capacity": 110, "type": "Lecture Room"},
    {"name": "A 201", "building": "COLERM 1st Floor", "capacity": 50, "type": "Lecture Room"},
    {"name": "A 215", "building": "COLERM 1st Floor", "capacity": 50, "type": "Lecture Room"},
    {"name": "GLY LR 1", "building": "COLERM Phase 2", "capacity": 50, "type": "Lecture Room"},
    {"name": "GLY LR 2", "building": "COLERM Phase 2", "capacity": 50, "type": "Lecture Room"},
    {"name": "GLY LR 3", "building": "COLERM Phase 2", "capacity": 50, "type": "Lecture Room"},
    {"name": "VET 200", "building": "COLVET Auditorium", "capacity": 180, "type": "Auditorium"},
    {"name": "VET 300", "building": "COLVET Auditorium", "capacity": 160, "type": "Auditorium"},
    {"name": "VET 400", "building": "COLVET Auditorium", "capacity": 160, "type": "Auditorium"},
    {"name": "VET 500", "building": "COLVET Auditorium", "capacity": 120, "type": "Auditorium"},
    {"name": "VET 600", "building": "COLVET Auditorium", "capacity": 120, "type": "Auditorium"},
    {"name": "VET LAB", "building": "COLVET Auditorium", "capacity": 50, "type": "Laboratory"},
    {"name": "VET AUD", "building": "COLVET Auditorium", "capacity": 280, "type": "Auditorium"},
    {"name": "RC 102", "building": "COLAMRUD Ground Floor", "capacity": 117, "type": "Lecture Room"},
    {"name": "RC 202", "building": "COLAMRUD 1st Floor", "capacity": 117, "type": "Lecture Room"},
    {"name": "RC 203", "building": "COLAMRUD 1st Floor", "capacity": 200, "type": "Lecture Room"},
    {"name": "COLFHEC 1", "building": "College of Food Science & Human Ecology", "capacity": 120, "type": "Lecture Room"},
    {"name": "COLFHEC 2", "building": "College of Food Science & Human Ecology", "capacity": 120, "type": "Lecture Room"},
    {"name": "COLFHEC 3", "building": "College of Food Science & Human Ecology", "capacity": 120, "type": "Lecture Room"},
    {"name": "COLENDS LR 1", "building": "College of Management Sciences", "capacity": 100, "type": "Lecture Room"},
    {"name": "COLENDS LR 2", "building": "College of Management Sciences", "capacity": 100, "type": "Lecture Room"},
    {"name": "BAM 400 LR", "building": "COLENDS (Business Administration)", "capacity": 100, "type": "Lecture Room"},
    {"name": "ETS 400 LR", "building": "COLENDS (Entrepreneurial Studies)", "capacity": 100, "type": "Lecture Room"},
    {"name": "BFN 400 LR", "building": "COLENDS (Banking & Finance)", "capacity": 100, "type": "Lecture Room"},
    {"name": "ECO 400 LR", "building": "COLENDS (Economics)", "capacity": 100, "type": "Lecture Room"},
    {"name": "ACCT 400 LR", "building": "COLENDS (Accounting)", "capacity": 100, "type": "Lecture Room"},
    {"name": "500 COMP LAB", "building": "500 Seater Computer Lab", "capacity": 500, "type": "Computer Lab"},
    {"name": "CENTS AUD", "building": "Centre for Entrepreneur Studies", "capacity": 240, "type": "Auditorium"},
    {"name": "1000 CAP LT", "building": "Prof Oyewole 1000 Capacity Lecture Theatre", "capacity": 1000, "type": "Auditorium"},
    {"name": "PHS LAB", "building": "Central Laboratory", "capacity": 300, "type": "Laboratory"},
    {"name": "CHM LAB", "building": "Central Laboratory", "capacity": 300, "type": "Laboratory"},
    {"name": "BIO LAB", "building": "Central Laboratory", "capacity": 300, "type": "Laboratory"},
    {"name": "AGRIC LAB 1", "building": "Agric Labs 1 and 2", "capacity": 200, "type": "Laboratory"},
    {"name": "AGRIC LAB 2", "building": "Agric Labs 1 and 2", "capacity": 200, "type": "Laboratory"},
    {"name": "PISAD AUD", "building": "Prof Israel Adu Building", "capacity": 260, "type": "Auditorium"},
    {"name": "ELBOG I", "building": "Elias Bogoro Lecture Hall", "capacity": 260, "type": "Auditorium"},
    {"name": "ACAD C1-C3", "building": "Prof Salako Academic Building", "capacity": 120, "type": "Lecture Hall"},
    {"name": "ACAD C4-C6", "building": "Prof Salako Academic Building", "capacity": 120, "type": "Lecture Hall"},
    {"name": "ACAD A3", "building": "Prof Salako Academic Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "ACAD A5", "building": "Prof Salako Academic Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "ACAD B3", "building": "Prof Salako Academic Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "ACAD B5", "building": "Prof Salako Academic Building", "capacity": 80, "type": "Lecture Room"},
    {"name": "MAHMOOD", "building": "Mahmood", "capacity": 1500, "type": "Auditorium"},
    {"name": "AUD I", "building": "Opp. Civil Engineering Building", "capacity": 260, "type": "Auditorium"},
    {"name": "AUD II", "building": "Opp. COLVET Building", "capacity": 260, "type": "Auditorium"},
    {"name": "AUD III", "building": "Sub Area, Behind CENTS AUD", "capacity": 260, "type": "Auditorium"},
    {"name": "VTH", "building": "Veterinary Teaching Hospital", "capacity": 100, "type": "Clinical Facility"},
    {"name": "SPORTS COMPLEX", "building": "FUNAAB University Stadium & Sports Complex", "capacity": 3000, "type": "Sports Facility"},
]

# Verified Colleges & Departments
verified_colleges = [
    {
        "id": "COLENG",
        "name": "College of Engineering",
        "departments": [
            {"id": "ABE", "name": "Agricultural and Bio-Resources Engineering", "code": "ABE"},
            {"id": "CVE", "name": "Civil Engineering", "code": "CVE"},
            {"id": "ELE", "name": "Electrical and Electronics Engineering", "code": "ELE"},
            {"id": "MCE", "name": "Mechanical Engineering", "code": "MCE"},
            {"id": "MTE", "name": "Mechatronics Engineering", "code": "MTE"},
        ]
    },
    {
        "id": "COLCOMPS",
        "name": "College of Computing",
        "departments": [
            {"id": "CSC", "name": "Computer Science", "code": "CSC"},
            {"id": "CYB", "name": "Cyber Security", "code": "CYB"},
            {"id": "SEN", "name": "Software Engineering", "code": "SEN"},
            {"id": "IFT", "name": "Information Technology", "code": "IFT"},
            {"id": "INS", "name": "Information Systems", "code": "INS"},
            {"id": "DTS", "name": "Data Science", "code": "DTS"},
        ]
    },
    {
        "id": "COLPHYS",
        "name": "College of Physical Sciences",
        "departments": [
            {"id": "CHM", "name": "Pure Chemistry", "code": "CHM"},
            {"id": "ICH", "name": "Industrial Chemistry", "code": "ICH"},
            {"id": "MTS", "name": "Mathematics", "code": "MTS"},
            {"id": "PHS", "name": "Physics", "code": "PHS"},
            {"id": "STA", "name": "Statistics", "code": "STA"},
        ]
    },
    {
        "id": "COLBIOS",
        "name": "College of Biosciences",
        "departments": [
            {"id": "BCH", "name": "Biochemistry", "code": "BCH"},
            {"id": "BIO", "name": "Biological Sciences", "code": "BIO"},
            {"id": "MCB", "name": "Microbiology", "code": "MCB"},
            {"id": "ZOO", "name": "Zoology", "code": "ZOO"},
            {"id": "BOT", "name": "Plant Biology / Botany", "code": "BOT"},
        ]
    },
    {
        "id": "COLENDS",
        "name": "College of Management Sciences",
        "departments": [
            {"id": "ACC", "name": "Accounting", "code": "ACC"},
            {"id": "BAM", "name": "Business Administration", "code": "BAM"},
            {"id": "BFN", "name": "Banking and Finance", "code": "BFN"},
            {"id": "ECO", "name": "Economics", "code": "ECO"},
            {"id": "ETS", "name": "Entrepreneurial Studies", "code": "ETS"},
        ]
    },
    {
        "id": "COLFHEC",
        "name": "College of Food Science and Human Ecology",
        "departments": [
            {"id": "FST", "name": "Food Science and Technology", "code": "FST"},
            {"id": "HSM", "name": "Home Science and Management", "code": "HSM"},
            {"id": "HTM", "name": "Hospitality and Tourism Management", "code": "HTM"},
            {"id": "NTD", "name": "Nutrition and Dietetics", "code": "NTD"},
        ]
    },
    {
        "id": "COLANIM",
        "name": "College of Animal Science and Livestock Production",
        "departments": [
            {"id": "ABG", "name": "Animal Breeding and Genetics", "code": "ABG"},
            {"id": "ANN", "name": "Animal Nutrition", "code": "ANN"},
            {"id": "ANP", "name": "Animal Physiology", "code": "ANP"},
            {"id": "APH", "name": "Animal Production and Health", "code": "APH"},
        ]
    },
    {
        "id": "COLPLANT",
        "name": "College of Plant Science and Crop Protection",
        "departments": [
            {"id": "CPT", "name": "Crop Protection", "code": "CPT"},
            {"id": "HRT", "name": "Horticulture", "code": "HRT"},
            {"id": "PBST", "name": "Plant Breeding and Seed Technology", "code": "PBST"},
            {"id": "PCP", "name": "Plant Physiology and Crop Production", "code": "PCP"},
            {"id": "SSLM", "name": "Soil Science and Land Management", "code": "SSLM"},
        ]
    },
    {
        "id": "COLERM",
        "name": "College of Environmental Resources Management",
        "departments": [
            {"id": "AQU", "name": "Aquaculture and Fisheries Management", "code": "FIS"},
            {"id": "EMT", "name": "Environmental Management and Toxicology", "code": "EMT"},
            {"id": "FRM", "name": "Forestry and Wildlife Management", "code": "FRM"},
            {"id": "WMA", "name": "Water Resources Management and Agrometeorology", "code": "WMA"},
        ]
    },
    {
        "id": "COLAMRUD",
        "name": "College of Agricultural Management, Rural Development and Consumer Studies",
        "departments": [
            {"id": "AAD", "name": "Agricultural Administration", "code": "AAD"},
            {"id": "AEM", "name": "Agricultural Economics and Farm Management", "code": "AEM"},
            {"id": "AGX", "name": "Agricultural Extension and Rural Development", "code": "AGX"},
            {"id": "ARD", "name": "Agricultural and Rural Development", "code": "ARD"},
            {"id": "CRD", "name": "Cooperatives and Rural Development", "code": "CRD"},
        ]
    },
    {
        "id": "COLVET",
        "name": "College of Veterinary Medicine",
        "departments": [
            {"id": "VET", "name": "Veterinary Medicine", "code": "VET"},
        ]
    }
]

course_titles = {
  "CSC 101": "Introduction to Computer Science",
  "CSC 201": "Computer Programming I",
  "CSC 203": "Computer Programming II",
  "CSC 205": "Operating Systems I",
  "CSC 209": "Introduction to Web Development",
  "CSC 217": "Computer Architecture",
  "CSC 221": "Foundations of Sequential Programs",
  "CSC 225": "Structured Programming",
  "CSC 271": "Object-Oriented Programming",
  "CSC 301": "Structured Programming",
  "CSC 305": "Data Structures and Algorithms",
  "CSC 307": "Operating Systems II",
  "CSC 311": "Systems Analysis and Design",
  "CSC 337": "Database Management Systems",
  "CSC 339": "Internet Technologies",
  "CSC 401": "Software Engineering",
  "CSC 403": "Algorithm Design and Analysis",
  "CSC 405": "Artificial Intelligence",
  "CSC 407": "Computer Graphics",
  "CSC 431": "Compiler Construction",
  "CSC 443": "Human-Computer Interaction",
  "CYB 113": "Introduction to Cyber Security",
  "CYB 201": "Fundamentals of Information Security",
  "CYB 203": "Cyber Ethics and Privacy",
  "CYB 205": "Secure Programming",
  "CYB 311": "Network Security",
  "SEN 101": "Introduction to Software Engineering",
  "SEN 201": "Software Requirements and Modeling",
  "SEN 203": "Software Construction",
  "SEN 301": "Software Architecture and Design",
  "IFT 201": "Basics of Information Technology",
  "IFT 301": "Web and Mobile Application Development",
  "DTS 201": "Introduction to Data Science",
  "MTS 101": "Elementary Mathematics I (Algebra & Trigonometry)",
  "MTS 103": "Elementary Mathematics II (Vectors & Geometry)",
  "MTS 105": "Mathematics for Biological & Social Sciences",
  "MTS 201": "Mathematical Methods I",
  "MTS 203": "Advanced Calculus",
  "MTS 211": "Abstract Algebra",
  "MTS 223": "Numerical Analysis I",
  "MTS 301": "Complex Analysis",
  "MTS 341": "Linear Algebra",
  "BIO 101": "General Biology I",
  "BIO 103": "Introductory Ecology",
  "BIO 105": "Introductory Botany",
  "BIO 107": "General Biology Laboratory I",
  "BIO 191": "Biology Practical I",
  "CHM 101": "General Chemistry I",
  "CHM 103": "Introductory Organic Chemistry",
  "CHM 107": "General Chemistry Practical",
  "CHM 191": "Chemistry Practical I",
  "ICH 201": "Fundamentals of Industrial Chemistry",
  "ICH 203": "Chemical Process Principles",
  "ICH 205": "Industrial Chemical Processes",
  "ICH 207": "Chemical Engineering Thermodynamics",
  "ICH 213": "Chemistry of Industrial Minerals",
  "ICH 251": "Industrial Raw Materials",
  "ICH 263": "Inorganic Chemical Technology",
  "ICH 265": "Organic Chemical Technology",
  "ICH 299": "Industrial Chemistry Workshop",
  "GET 101": "Engineer in Society",
  "GET 201": "Applied Electricity & Electronics",
  "PHS 101": "General Physics I",
  "PHY 101": "General Physics I",
  "PHS 103": "General Physics II (Sound & Waves)",
  "PHS 105": "Physics for Biological Sciences",
  "PHS 191": "Physics Practical I",
  "PHY 107": "Physics Practical I",
  "GNS 101": "Use of Library",
  "GNS 105": "Citizenship Education",
  "GNS 107": "Peace Studies and Conflict Resolution",
  "GNS 111": "Use of English I",
  "GNS 201": "Science, Technology and Society",
  "GNS 202": "Introduction to Philosophy and Logic",
  "GNS 203": "African History and Culture",
  "GST 111": "Communication in English",
  "GST 112": "Logic, Philosophy and Human Existence",
  "GST 201": "Entrepreneurship and Innovation",
  "PCP 191": "Introductory Crop Production Practical",
  "BCH 201": "General Biochemistry I",
  "BCH 301": "Enzymology",
  "MCB 201": "General Microbiology",
  "ABE 201": "Introduction to Agricultural Engineering",
  "CVE 201": "Engineer in Society",
  "ELE 201": "Applied Electricity I",
  "MCE 201": "Engineering Mechanics I",
  "SPORTS": "Official University Sports & Inter-Hall Games"
}

# Official Wednesday University Sports Sessions (TIMTEC v2.0 Page 2-3)
sessions.append({
    "id": "sports-wednesday-session-1",
    "day": "Wednesday",
    "startTime": "02:00 PM",
    "endTime": "04:00 PM",
    "courseCode": "SPORTS",
    "venue": "SPORTS COMPLEX",
    "level": "All",
    "prefix": "SPORTS",
    "isPractical": False,
    "isVirtual": False,
    "academicYear": "2026/2027",
    "semester": "First Semester",
    "timetableVersion": "4.0",
    "source": "Official TIMTEC v4.0 Page 2-3",
    "verificationStatus": "Official Master Timetable"
})
sessions.append({
    "id": "sports-wednesday-session-2",
    "day": "Wednesday",
    "startTime": "04:00 PM",
    "endTime": "06:00 PM",
    "courseCode": "SPORTS",
    "venue": "SPORTS COMPLEX",
    "level": "All",
    "prefix": "SPORTS",
    "isPractical": False,
    "isVirtual": False,
    "academicYear": "2026/2027",
    "semester": "First Semester",
    "timetableVersion": "4.0",
    "source": "Official TIMTEC v4.0 Page 2-3",
    "verificationStatus": "Official Master Timetable"
})

ts_content = f"""/**
 * Class Ease - Official FUNAAB Timetable Dataset
 * Source: 2026/2027 First Semester Lecture Time-Table — Version 4.0
 * Authority: Time Table and Examination Committee (TIMTEC), Federal University of Agriculture, Abeokuta
 * 
 * Strict Source-of-Truth compliance:
 * - All sessions, days, venues and courses verified from the official TIMTEC document.
 * - Direction handoff to funaab.getdirection.xyz (external direction service).
 */

export interface TimetableSession {{
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "11:00 AM"
  courseCode: string;
  venue: string;
  level: string;     // e.g. "100", "200", "300", "400", "500", "Unspecified"
  prefix: string;    // e.g. "BIO", "CHM", "ABE"
  isPractical: boolean;
  isVirtual: boolean;
  academicYear: string;
  semester: string;
  timetableVersion: string;
  source: string;
  verificationStatus: string;
}}

export interface CourseCatalogItem {{
  code: string;
  level: string;
  prefix: string;
  isPractical: boolean;
  isVirtual: boolean;
  sessions: {{
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    startTime: string;
    endTime: string;
    venue: string;
    isPractical: boolean;
    isVirtual: boolean;
  }}[];
}}

export interface VenueDirectoryItem {{
  name: string;
  building: string;
  capacity?: number;
  type: string;
}}

export interface VerifiedDepartment {{
  id: string;
  name: string;
  code: string;
}}

export interface VerifiedCollege {{
  id: string;
  name: string;
  departments: VerifiedDepartment[];
}}

export const OFFICIAL_METADATA = {{
  appName: 'Class Ease',
  tagline: 'Your academic day, simplified.',
  institution: 'Federal University of Agriculture, Abeokuta (FUNAAB)',
  academicYear: '2026/2027',
  semester: 'First Semester',
  timetableVersion: '4.0',
  committee: 'Time Table and Examination Committee (TIMTEC)',
  directionServiceUrl: 'https://funaab.getdirection.xyz',
  campusGuideUrl: 'https://funaab101.xyz',
  whatsappSupportNumber: '08128197651',
  timtecContacts: [
    {{ role: 'Chairman TIMTEC', phone: '08034189016' }},
    {{ role: 'Secretary TIMTEC', phone: '08038058217' }}
  ],
  credits: {{
    builder: 'Sisco',
    fullName: 'Sholuade AbdulRasak Akorede',
    role: 'Cyber Security Student • COLCOMPS (College of Computing)',
    portfolioUrl: 'https://siscoask.vercel.app'
  }}
}} as const;

export const VERIFIED_COLLEGES: VerifiedCollege[] = {json.dumps(verified_colleges, indent=2)};

export const VERIFIED_COURSE_TITLES: Record<string, string> = {json.dumps(course_titles, indent=2)};

export const OFFICIAL_VENUES: VenueDirectoryItem[] = {json.dumps(official_venues, indent=2)};

export const TIMETABLE_SESSIONS: TimetableSession[] = {json.dumps(sessions, indent=2)};

export const COURSE_CATALOG: CourseCatalogItem[] = {json.dumps(courses, indent=2)};
"""

with open("src/data/timetable.ts", "w") as f:
    f.write(ts_content)

print("Created src/data/timetable.ts successfully with typed data!")
