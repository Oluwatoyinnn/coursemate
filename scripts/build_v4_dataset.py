import json
import re
import os
from v4_data import PAGE_1_9_11, PAGE_2_11_1, PRACTICALS_100L, PAGE_3_2_4, PAGE_4_4_6

def split_course_and_venue(entry):
    entry = entry.strip()
    custom_time = None
    time_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?', entry, re.IGNORECASE)
    if time_match:
        t1 = time_match.group(1).upper().replace(' ', '')
        t2 = time_match.group(2).upper().replace(' ', '') if time_match.group(2) else None
        custom_time = (t1, t2)
        entry = entry[:time_match.start()] + entry[time_match.end():]
        entry = ' '.join(entry.split())

    is_virtual = 'virtual' in entry.lower()
    is_practical = any(p in entry.lower() for p in ['(p)', '[p]', ' lab', 'farm', 'field'])

    known_venues = [
        "1000 CAP LT/VIRTUAL", "1000CAP LT/VIRTUAL", "1000 CAP LT", "1000CAP LT",
        "MAMHOOD/VIRTUAL", "MAMHOOD",
        "JAO 3/VIRTUAL", "JAO 2/VIRTUAL", "JAO 1/VIRTUAL", "JAO 1", "JAO 2", "JAO 3", "JAO 1/AUD II",
        "MP 01//VIRTUAL", "MP 01/VIRTUAL", "MP 02/VIRTUAL", "MP 01", "MP 02", "MP03/04", "MPL",
        "ANE I/VIRTUAL", "ANE II/VIRTUAL", "ANE I/ANP LAB", "ANE I", "ANE II",
        "CAD/VIRTUAL", "CAD",
        "ENGR AUD/VIRTUAL", "ENG AUD", "ENGR AUD",
        "ACAD C1-C3/VIRTUAL", "ACAD C4-C6/VIRTUAL", "ACAD C1-C3", "ACAD C4 -C6", "ACAD C4-C6",
        "ACAD A3", "ACAD A5", "ACAD B3", "ACAD B5",
        "ELBOG I/VIRTUAL", "ELBOG I, ELBOG II", "ELBOG I/ELBOG II/VIRTUAL", "ELBOG I", "ELBOG II", "ELBOG II/VIRTUAL",
        "COLENDS LR 1", "COLENDS LR 2", "COLENDS LR1", "COLENDS LR2",
        "ACC 400LR", "ACC 400 LR", "ACC 4OOLR",
        "BAM 400LR", "BAM 400 LR", "BAM 400", "BAM 4OO LECTURE ROOM",
        "ETS 400 LR", "ETS 400LR", "ETS 400",
        "BFN 400 LR", "BFN 400LR", "BFN 400",
        "ECO 400 LR", "ECO 400LR", "ECO 400",
        "COLMAS RM 2",
        "PISAD AUD", "CENT AUD", "CENTS AUD",
        "AUD I", "AUD II", "AUD III", "AUD III/VIRTUAL",
        "VET AUD/VIRTUAL", "VET AUD", "VET 200", "VET 300", "VET 400", "VET 500", "VET 600", "VET LAB",
        "VET ANAT LAB", "VET PHYSIO LAB", "ANAT LAB", "PHYSIO LAB", "PARA LAB", "PATH LAB", "MICRO LAB", "VTH",
        "COLFHEC 1", "COLFHEC 2", "COLFHEC 3",
        "GLR I", "GLR II", "GLR III", "GLR 1", "GLR 2", "GLR 3", "GLR LR 2",
        "GLY LR 1", "GLY LR 2", "GLY LR 3",
        "ABE LR", "MCE LR", "CVE UP/VIRTUAL", "CVE UP", "CVE DOWN", "CVE LAB", "CVE STUDIO/MPL", "CVE STUDIO",
        "RC 101", "RC 102", "RC 202", "RC 203", "RC 205", "RC 206", "R 205", "R 206",
        "A 101/VIRTUAL", "A 101", "A 105", "A 110", "A 201", "A 203", "A 215",
        "AC 101", "LIS LR", "CPL/VIRTUAL", "CPL", "SSLM LR", "PPCP LR", "PBST LR", "HRT LR", "CPT LR",
        "ABE LAB", "MCB LAB", "HRT LAB", "PBST LAB", "CPT LAB", "PHS LABS", "CHM LABS", "BIO LABS/AGRIC LAB II", "BIO LABS",
        "PHS LAB I", "PHS LAB II", "PHS LAB", "CHM LAB", "NEW CHM LAB", "OLD CHM LAB", "TETFUND CHM LAB",
        "BIO LAB", "BIO-M", "PAB LAB", "PAZ LAB", "ZOO LAB", "TETFUND BIO LAB", "TETFUND LAB", "TETFUND PHY LAB",
        "AGRIC LAB 1/AGRIC LAB II", "AGRIC LAB I/VIRTUAL", "AGRIC LAB 2//VIRTUAL", "AGRIC LABS I,II",
        "AGRIC LAB I&II", "AGRIC LAB I", "AGRIC LAB II", "COLANIM FARM", "COLPLANT FARM", "FISH FARM", "FARM LAB",
        "ANN LAB/COLANIM FARM", "ANN LAB", "APH LAB", "ANP LAB", "BCH LAB", "EMT LAB I", "EMT LAB II", "EMT LAB",
        "ELE LAB I", "ELE LAB II", "ELE LAB", "MCE LAB I", "MCE LAB II", "MCE LAB", "MTE LAB", "NEW ENGR LAB", "NEW ABE LAB",
        "SOS LAB", "STS LAB", "500 COMP LAB", "500 COMPLAB", "500COMPLAB", "CSC LAB",
        "CLOTHING LAB", "TEXTILE LAB", "PATTERN DRAFTING LAB", "HSM LAB", "HTM LAB", "HSM EXT LAB",
        "FST LAB II", "FST LAB", "FIS LAB 1", "FIS LAB 2", "FIS LAB", "FRM LAB", "FWM LAB",
        "WOOD LAB", "WATER LAB", "WMA LAB", "WRM LAB", "NUD LAB", "NTD LAB", "PPCP LAB", "PBS LAB",
        "CEASEDE PHS LAB", "ICGNS LR", "FIELD/CPL PHASE II LAB", "FIELD", "WATER LAB"
    ]
    known_venues.sort(key=lambda x: len(x), reverse=True)

    venue = "Unspecified Venue"
    course = entry

    for kv in known_venues:
        pattern = r'(?:\s+|^)' + re.escape(kv) + r'$'
        m = re.search(pattern, entry, re.IGNORECASE)
        if m:
            venue = kv
            course = entry[:m.start()].strip()
            break
    
    if venue == "Unspecified Venue":
        tokens = entry.split()
        if len(tokens) >= 2:
            if len(tokens) >= 3 and (tokens[1].isdigit() or re.match(r'^\d{3}', tokens[1])):
                course = f"{tokens[0]} {tokens[1]}"
                venue = " ".join(tokens[2:])
            else:
                course = tokens[0]
                venue = " ".join(tokens[1:])
        else:
            course = entry

    course = re.sub(r'\s+', ' ', course).strip()
    venue = re.sub(r'\s+', ' ', venue).strip()

    return course, venue, custom_time, is_practical, is_virtual

def parse_grid(raw_text, day_time_config):
    results = []
    lines = raw_text.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        cols = [c.strip() for c in line.split('|')]
        for idx, col in enumerate(cols):
            if idx >= len(day_time_config):
                break
            if not col or col in ['. .', '.', '-', '']:
                continue
            if col.strip().lower() == 'sports':
                continue
            
            day, def_start, def_end = day_time_config[idx]
            course, venue, custom_time, is_practical, is_virtual = split_course_and_venue(col)
            
            start_t = custom_time[0] if custom_time and custom_time[0] else def_start
            end_t = custom_time[1] if custom_time and custom_time[1] else def_end
            
            def format_time(t_str):
                m = re.match(r'(\d{1,2})(?::(\d{2}))?\s*(AM|PM)', t_str, re.IGNORECASE)
                if m:
                    hr = int(m.group(1))
                    mn = m.group(2) or "00"
                    ampm = m.group(3).upper()
                    return f"{hr:02d}:{mn} {ampm}"
                return t_str

            start_clean = format_time(start_t)
            end_clean = format_time(end_t)
            
            lvl_match = re.search(r'\b([1-6])\d{2}\b', course)
            level = f"{lvl_match.group(1)}00" if lvl_match else "Unspecified"

            pref_match = re.match(r'^([A-Z]{2,4})', course.upper())
            prefix = pref_match.group(1) if pref_match else "OTHER"

            results.append({
                "id": f"tt-{day[:3].lower()}-{prefix.lower()}-{len(results)+1}",
                "day": day,
                "startTime": start_clean,
                "endTime": end_clean,
                "courseCode": course,
                "venue": venue,
                "level": level,
                "prefix": prefix,
                "isPractical": is_practical,
                "isVirtual": is_virtual,
                "academicYear": "2026/2027",
                "semester": "First Semester",
                "timetableVersion": "4.0",
                "source": "TIMTEC official timetable PDF Version 4.0",
                "verificationStatus": "Official Verified"
            })
    return results

# Day and slot mappings
mon_fri_9_11 = [
    ("Monday", "09:00 AM", "11:00 AM"),
    ("Tuesday", "09:00 AM", "11:00 AM"),
    ("Wednesday", "09:00 AM", "11:00 AM"),
    ("Thursday", "09:00 AM", "11:00 AM"),
    ("Friday", "09:00 AM", "11:00 AM"),
]

mon_fri_11_1 = [
    ("Monday", "11:00 AM", "01:00 PM"),
    ("Tuesday", "11:00 AM", "01:00 PM"),
    ("Wednesday", "11:00 AM", "01:00 PM"),
    ("Thursday", "11:00 AM", "01:00 PM"),
    ("Friday", "11:00 AM", "01:00 PM"),
]

p3_afternoon_cols = [
    ("Monday", "02:00 PM", "04:00 PM"),
    ("Tuesday", "02:00 PM", "04:00 PM"),
    ("Thursday", "02:00 PM", "04:00 PM"),
    ("Friday", "02:30 PM", "04:30 PM"),
]

p4_late_cols = [
    ("Monday", "04:00 PM", "06:00 PM"),
    ("Tuesday", "04:00 PM", "06:00 PM"),
    ("Thursday", "04:30 PM", "06:30 PM"),
    ("Friday", "04:30 PM", "06:30 PM"),
]

all_entries = []
all_entries.extend(parse_grid(PAGE_1_9_11, mon_fri_9_11))
all_entries.extend(parse_grid(PAGE_2_11_1, mon_fri_11_1))

for p in PRACTICALS_100L:
    for day in p["days"]:
        all_entries.append({
            "id": f"tt-prac-{p['course'].lower().replace('/', '_').replace(' ', '')}-{day[:3].lower()}",
            "day": day,
            "startTime": "11:00 AM",
            "endTime": "02:00 PM",
            "courseCode": p["course"],
            "venue": p["venue"],
            "level": "100",
            "prefix": p["course"].split()[0],
            "isPractical": True,
            "isVirtual": False,
            "academicYear": "2026/2027",
            "semester": "First Semester",
            "timetableVersion": "4.0",
            "source": "TIMTEC official timetable PDF Version 4.0 (100 Level Practicals)",
            "verificationStatus": "Official Verified"
        })

all_entries.extend(parse_grid(PAGE_3_2_4, p3_afternoon_cols))
all_entries.extend(parse_grid(PAGE_4_4_6, p4_late_cols))

for idx, item in enumerate(all_entries):
    item["id"] = f"funaab-tt-{idx+1}"

print(f"Version 4.0 - Total sessions: {len(all_entries)}")

unique_courses = {}
unique_venues = set()

for item in all_entries:
    c_code = item["courseCode"]
    unique_venues.add(item["venue"])
    if c_code not in unique_courses:
        unique_courses[c_code] = {
            "code": c_code,
            "level": item["level"],
            "prefix": item["prefix"],
            "isPractical": item["isPractical"],
            "isVirtual": item["isVirtual"],
            "sessions": []
        }
    unique_courses[c_code]["sessions"].append({
        "day": item["day"],
        "startTime": item["startTime"],
        "endTime": item["endTime"],
        "venue": item["venue"],
        "isPractical": item["isPractical"],
        "isVirtual": item["isVirtual"]
    })

print(f"Version 4.0 - Total courses: {len(unique_courses)}")
print(f"Version 4.0 - Total venues: {len(unique_venues)}")

with open("src/data/timetableData.json", "w") as f:
    json.dump({
        "metadata": {
            "institution": "Federal University of Agriculture, Abeokuta (FUNAAB)",
            "academicYear": "2026/2027",
            "semester": "First Semester",
            "timetableVersion": "4.0",
            "committee": "Time Table and Examination Committee (TIMTEC)",
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "totalSessions": len(all_entries),
            "totalCourses": len(unique_courses),
            "totalVenues": len(unique_venues)
        },
        "sessions": all_entries,
        "courses": list(unique_courses.values())
    }, f, indent=2)

print("Saved Version 4.0 to src/data/timetableData.json")
