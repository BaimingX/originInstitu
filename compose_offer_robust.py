# compose_offer_robust.py
# 最强健的版本 - 解决所有可能的编码和格式问题

import os, sys, json, argparse, re, base64, tempfile
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Tuple, Optional

try:
    import chardet
except ImportError:
    chardet = None

try:
    import yaml
except ImportError:
    yaml = None

# 重用原有的工具函数和常量
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
AEST = timezone(timedelta(hours=10))

ALLOWED_TITLES = {"Mr", "Ms", "Mrs", "Miss", "Dr", "Rev", "Hon", "Undefined"}
ALLOWED_GENDERS = {"M", "F", "X"}
ALLOWED_ORIGINS = {"OverseasStudent", "OverseasStudentInAustralia", "ResidentStudent"}

def now_iso() -> str:
    return datetime.now(tz=AEST).isoformat(timespec="seconds")

def to_iso8601(val: Any, allow_date_only: bool = True, default_future_days: int = 30) -> str:
    if isinstance(val, (int, float)):
        try:
            dt = datetime.fromtimestamp(val, tz=AEST)
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"
        except Exception:
            pass
    if isinstance(val, str) and val.strip():
        s = val.strip()
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=AEST)
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"
        except Exception:
            pass
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                d = datetime.strptime(s, fmt).replace(tzinfo=AEST)
                if allow_date_only:
                    return d.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"
            except Exception:
                continue
    d = datetime.now(tz=AEST) + timedelta(days=default_future_days)
    return d.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"

def to_dateonly_iso(val: Any, default_date: str = "1990-01-01") -> str:
    if isinstance(val, str) and val.strip():
        s = val.strip()
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                d = datetime.strptime(s, fmt).replace(tzinfo=AEST)
                return d.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"
            except Exception:
                pass
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=AEST)
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"
        except Exception:
            pass
    d = datetime.strptime(default_date, "%Y-%m-%d").replace(tzinfo=AEST)
    return d.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+10:00"

def is_truthy(v: Any) -> bool:
    if isinstance(v, bool): return v
    if isinstance(v, str):  return v.strip().lower() in {"1","true","t","yes","y"}
    if isinstance(v, (int,float)): return v != 0
    return False

def normalize_gender(gender: str) -> str:
    """标准化性别值"""
    if not gender:
        return "M"
    g = gender.strip().lower()
    if g in ["male", "m", "man"]:
        return "M"
    elif g in ["female", "f", "woman"]:
        return "F"
    else:
        return "M"  # 默认值

def normalize_visa_type(s: Optional[str]) -> str:
    if not s: return "Other"
    t = s.strip().lower()
    if "tour" in t or "visitor" in t: return "Tourist/Visitor"
    if "holiday" in t:                return "Working Holiday"
    if "student" in t:                return "Student Visa"
    return "Other"

def normalize_language(s: Optional[str]) -> str:
    if not s: return "Mandarin"
    t = s.strip().lower()
    chinese_synonyms = {"chinese", "mandarin", "zh", "zh-cn", "zh_cn", "zh-hans", "中文", "汉语", "普通话"}
    if t in chinese_synonyms: return "Mandarin"
    return s.strip()

def detect_and_fix_yaml_content(content: str) -> str:
    """检测并修复常见的 YAML 格式问题"""
    lines = content.splitlines()
    fixed_lines = []

    for line in lines:
        # 去除开头的空白字符，但保留有意义的缩进
        if line.strip():
            # 计算原始缩进
            stripped = line.lstrip()
            if stripped.endswith(':') and not line.startswith('  '):
                # 这是一个顶级键，不应该有缩进
                fixed_lines.append(stripped)
            else:
                # 保留相对缩进
                fixed_lines.append(line)
        else:
            # 保留空行
            fixed_lines.append('')

    result = '\n'.join(fixed_lines)
    print(f"[INFO] YAML content fixed. Original lines: {len(lines)}, Fixed lines: {len(fixed_lines)}")
    return result

def robust_file_reader(file_path: str) -> str:
    """强健的文件读取器 - 处理编码和格式问题"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # 1. 尝试检测编码
    encodings_to_try = ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'ascii', 'latin-1', 'cp1252']

    if chardet:
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
            detected = chardet.detect(raw_data)
            if detected['encoding'] and detected['confidence'] > 0.5:
                encodings_to_try.insert(0, detected['encoding'])
                print(f"[INFO] Detected encoding: {detected['encoding']} (confidence: {detected['confidence']:.2f})")
        except Exception as e:
            print(f"[WARN] Encoding detection failed: {e}")

    # 2. 尝试读取文件
    for encoding in encodings_to_try:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                content = f.read()

            # 检查内容是否正常（不全是null字符）
            if content.replace('\x00', '').replace('\r', '').replace('\n', '').strip():
                print(f"[SUCCESS] Successfully read file with encoding: {encoding}")

                # 3. 修复常见的格式问题
                fixed_content = detect_and_fix_yaml_content(content)
                return fixed_content
            else:
                print(f"[WARN] File content appears corrupted with encoding: {encoding}")
                continue

        except UnicodeDecodeError as e:
            print(f"[WARN] Failed to read with encoding {encoding}: {e}")
            continue
        except Exception as e:
            print(f"[WARN] Unexpected error with encoding {encoding}: {e}")
            continue

    raise ValueError(f"Unable to read file {file_path} with any supported encoding")

def load_yaml_content(yaml_content: str) -> Dict[str, Any]:
    """从 YAML 字符串加载配置"""
    if yaml is None:
        raise ImportError("PyYAML not installed. Run: pip install pyyaml")

    try:
        return yaml.safe_load(yaml_content)
    except Exception as e:
        print(f"[ERROR] YAML parsing failed. Content preview:")
        lines = yaml_content.split('\n')[:10]
        for i, line in enumerate(lines, 1):
            print(f"  {i:2d}: {repr(line)}")
        raise ValueError(f"Failed to parse YAML content: {e}")

def coerce_student_offer_from_yaml_content(yaml_content: str) -> Tuple[Dict[str, Any], List[str]]:
    """从 YAML 内容创建学生报价"""
    config = load_yaml_content(yaml_content)
    return coerce_student_offer_from_config(config)

def coerce_student_offer_from_config(config: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """从配置字典创建学生报价"""
    issues: List[str] = []

    # Extract student info
    student_info = config.get('student_info', {})
    offer_id = config.get('offer_id') or f"OFFER_{datetime.now(tz=AEST).strftime('%Y%m%d_%H%M%S')}"

    offer: Dict[str, Any] = {
        "OfferId": offer_id,
        "TimeStamp": to_iso8601(config.get('timestamp') or now_iso()),
        "Title": student_info.get('title', 'Mr'),
        "FirstName": student_info.get('first_name', 'First'),
        "MiddleName": student_info.get('middle_name', ''),
        "LastName": student_info.get('last_name', 'Last'),
        "Gender": normalize_gender(student_info.get('gender', 'M')),
        "DoB": to_dateonly_iso(student_info.get('dob', '1990-01-01')),
        "Email": student_info.get('email', 'student@example.com'),
        "StudentOrigin": student_info.get('student_origin', 'OverseasStudent'),
    }

    # Validate basic fields
    if offer["Title"] not in ALLOWED_TITLES:
        issues.append(f"Title '{offer['Title']}' invalid -> 'Mr'"); offer["Title"]="Mr"
    if offer["Gender"] not in ALLOWED_GENDERS:
        issues.append(f"Gender '{offer['Gender']}' invalid -> 'M'"); offer["Gender"]="M"
    if offer["StudentOrigin"] not in ALLOWED_ORIGINS:
        issues.append(f"StudentOrigin '{offer['StudentOrigin']}' invalid -> 'OverseasStudent'")
        offer["StudentOrigin"]="OverseasStudent"
    if not EMAIL_RE.match(offer["Email"]):
        issues.append(f"Email '{offer['Email']}' invalid -> 'student@example.com'")
        offer["Email"]="student@example.com"

    # Process compliance info
    compliance_config = config.get('compliance', {})
    compliance = {
        "OfferId": offer_id,
        "CountryBirth": compliance_config.get('country_birth', 'China'),
        "Nationality": compliance_config.get('nationality', 'Chinese'),
        "PassportNumber": compliance_config.get('passport_number', ''),
        "PassportExpiryDate": to_iso8601(compliance_config.get('passport_expiry_date', '')) if compliance_config.get('passport_expiry_date') else '',
        "FirstLanguage": normalize_language(compliance_config.get('first_language')),
        "HowWellEngSpeak": compliance_config.get('how_well_eng_speak', ''),
        "StudyReason": compliance_config.get('study_reason', ''),
        "CurrentEmployStatus": compliance_config.get('current_employ_status', ''),
        "IndustryEmployment": compliance_config.get('industry_employment', ''),
        "OccupationCode": compliance_config.get('occupation_code', ''),
        "USI": compliance_config.get('usi', ''),
        "IsAboriginal": compliance_config.get('is_aboriginal', False),
        "IsTorresStraitIslander": compliance_config.get('is_torres_strait_islander', False),
        "IsEngLanguageInClass": compliance_config.get('is_eng_language_in_class', True),
        "EngTestType": compliance_config.get('eng_test_type', ''),
        "EngTestDate": to_iso8601(compliance_config.get('eng_test_date', '')) if compliance_config.get('eng_test_date') else '',
        "EngTestListeningScore": compliance_config.get('eng_test_listening_score', ''),
        "EngTestReadingScore": compliance_config.get('eng_test_reading_score', ''),
        "EngTestWritingScore": compliance_config.get('eng_test_writing_score', ''),
        "EngTestSpeakingScore": compliance_config.get('eng_test_speaking_score', ''),
        "EngTestOverallScore": compliance_config.get('eng_test_overall_score', ''),
        "HighSchoolLevel": compliance_config.get('high_school_level', '@@'),
        "HighSchoolYearCompleted": compliance_config.get('high_school_year_completed', 0),
        "IsStillAtHighSchool": compliance_config.get('is_still_at_high_school', False),
        "SchoolType": compliance_config.get('school_type', ''),
        "IsDisabled": compliance_config.get('is_disabled', False),
        "IsRequestHelpForDisabled": compliance_config.get('is_request_help_for_disabled', False)
    }

    # Add visa info for overseas students
    if offer["StudentOrigin"].startswith("Overseas"):
        compliance["VisaType"] = normalize_visa_type(compliance_config.get('visa_type'))
        compliance["VisaNumber"] = compliance_config.get('visa_number', '')
        compliance["VisaExpiryDate"] = to_iso8601(compliance_config.get('visa_expiry_date', '')) if compliance_config.get('visa_expiry_date') else ''

    # Process addresses
    addresses_config = config.get('addresses', [])
    cleaned_addrs = []
    for addr in addresses_config:
        if isinstance(addr, dict):
            addr_entry = {
                "OfferId": offer_id,
                "AddressType": addr.get('address_type', 'Current'),
                "IsPrimary": is_truthy(addr.get('is_primary', True)),
                "BuildingName": addr.get('building_name', ''),
                "FlatUnitDetail": addr.get('flat_unit_detail', ''),
                "StreetNumber": addr.get('street_number', '1'),
                "StreetName": addr.get('street_name', 'Sample St'),
                "Suburb": addr.get('suburb', 'Melbourne'),
                "State": addr.get('state', 'VIC'),
                "Postcode": addr.get('postcode', '3000'),
                "Country": addr.get('country', 'Australia'),
                "Phone": addr.get('phone', ''),
                "Fax": addr.get('fax', ''),
                "Mobile": addr.get('mobile', '+61 4xx xxx xxx')
            }
            cleaned_addrs.append(addr_entry)

    if not cleaned_addrs:
        cleaned_addrs = [{
            "OfferId": offer_id, "AddressType": "Current", "IsPrimary": True,
            "BuildingName": "", "FlatUnitDetail": "Unit 1", "StreetNumber": "1",
            "StreetName": "Sample St", "Suburb": "Melbourne", "State": "VIC",
            "Postcode": "3000", "Country": "Australia", "Phone": "",
            "Fax": "", "Mobile": "+61 4xx xxx xxx"
        }]

    # Process courses
    courses_config = config.get('applied_courses', [])
    cleaned_courses = []

    def _to_float(x, dv=0.0):
        if x is None or x == "":
            return float(dv)
        try:
            return float(x)
        except:
            return float(dv)

    def _to_int(x, dv=1):
        if x is None or x == "":
            return int(dv)
        try:
            return int(x)
        except:
            return int(dv)

    for course in courses_config:
        if isinstance(course, dict):
            course_entry = {
                "OfferId": offer_id,
                "CourseId": course.get('course_id', 'CPC50220'),
                "CampusId": _to_int(course.get('campus_id', 1), 1),
                "IntakeDate": to_iso8601(course.get('intake_date') or datetime.now(tz=AEST)+timedelta(days=30)),
                "StartDate": to_iso8601(course.get('start_date') or datetime.now(tz=AEST)+timedelta(days=30)),
                "FinishDate": to_iso8601(course.get('finish_date') or datetime.now(tz=AEST)+timedelta(days=370)),
                "ELICOS_NumOfWeeks": _to_int(course.get('elicos_num_of_weeks', 0), 0),
                "TuitionFee": _to_float(course.get('tuition_fee', 12000.0), 12000.0),
                "EnrolmentFee": _to_float(course.get('enrolment_fee', 250.0), 250.0),
                "MaterialFee": _to_float(course.get('material_fee', 300.0), 300.0),
                "UpfrontFee": _to_float(course.get('upfront_fee', 500.0), 500.0),
                "SpecialCondition": course.get('special_condition', ''),
                "ApplicationRequest": course.get('application_request', 'Direct apply'),
                "Status": course.get('status', '')
            }
            cleaned_courses.append(course_entry)

    if not cleaned_courses:
        cleaned_courses = [{
            "OfferId": offer_id, "CourseId": "CPC50220", "CampusId": 1,
            "IntakeDate": to_iso8601(datetime.now(tz=AEST)+timedelta(days=30)),
            "StartDate": to_iso8601(datetime.now(tz=AEST)+timedelta(days=30)),
            "FinishDate": to_iso8601(datetime.now(tz=AEST)+timedelta(days=370)),
            "ELICOS_NumOfWeeks": 0, "TuitionFee": 12000.0, "EnrolmentFee": 250.0,
            "MaterialFee": 300.0, "UpfrontFee": 500.0, "SpecialCondition": "",
            "ApplicationRequest": "Direct apply", "Status": ""
        }]

    # Process disabilities
    disabilities_config = config.get('disabilities', [])
    cleaned_disabilities = []
    for disability in disabilities_config:
        if isinstance(disability, dict):
            disability_entry = {
                "OfferId": offer_id,
                "DisabilityCode": disability.get('disability_code', ''),
                "DisabilityName": disability.get('disability_name', ''),
                "OtherValue": disability.get('other_value', '')
            }
            cleaned_disabilities.append(disability_entry)

    # Process education history
    edu_hist_config = config.get('education_history', [])
    cleaned_edu_hist = []
    for edu in edu_hist_config:
        if isinstance(edu, dict):
            edu_entry = {
                "OfferId": offer_id,
                "QualificationName": edu.get('qualification_name', ''),
                "InstituteName": edu.get('institute_name', ''),
                "InstituteLocation": edu.get('institute_location', ''),
                "YearCompleted": _to_int(edu.get('year_completed', 0), 0),
                "EducationLevelCode": edu.get('education_level_code', ''),
                "AchievementRecognitionCode": edu.get('achievement_recognition_code', '')
            }
            cleaned_edu_hist.append(edu_entry)

    # Process employment history
    emp_hist_config = config.get('employment_history', [])
    cleaned_emp_hist = []
    for emp in emp_hist_config:
        if isinstance(emp, dict):
            emp_entry = {
                "OfferId": offer_id,
                "EmployerName": emp.get('employer_name', ''),
                "JobTitle": emp.get('job_title', ''),
                "JobDescription": emp.get('job_description', ''),
                "FromDate": to_iso8601(emp.get('from_date', '')),
                "ToDate": to_iso8601(emp.get('to_date', ''))
            }
            cleaned_emp_hist.append(emp_entry)

    # Process emergency contact
    emergency_config = config.get('emergency_contact', {})
    emergency = {
        "OfferId": offer_id,
        "ContactType": emergency_config.get('contact_type', 'Emergency'),
        "Relationship": emergency_config.get('relationship', 'Parent'),
        "ContactName": emergency_config.get('contact_name', 'Wei Zhang'),
        "Address": emergency_config.get('address', '123 Collins St, Melbourne VIC 3000'),
        "Phone": emergency_config.get('phone', '+61 3 xxxx xxxx'),
        "Email": emergency_config.get('email', 'parent@example.com')
    }

    # Process leads marketing
    leads_config = config.get('leads_marketing', {})
    leads_mkt = {
        "OfferId": offer_id,
        "KnowFrom": leads_config.get('know_from', 'Agent'),
        "LeadSource": leads_config.get('lead_source', 'Web'),
        "CampaignName": leads_config.get('campaign_name', 'Website')
    }

    # Assemble final offer
    offer["ComplianceAndOtherInfo"] = compliance
    offer["Addresses"] = cleaned_addrs
    offer["AppliedCourses"] = cleaned_courses
    offer["Disabilities"] = cleaned_disabilities
    offer["EmergencyContact"] = emergency
    offer["EducationHistoryList"] = cleaned_edu_hist
    offer["EmploymentHistoryList"] = cleaned_emp_hist
    offer["Leads_MarketingCampaign"] = leads_mkt

    return offer, issues

def build_arg_parser():
    p = argparse.ArgumentParser(description="Compose StudentOffer JSON - Robust Edition")
    p.add_argument("--out", required=True, help="Output JSON file path")

    # Power Automate 专用参数
    p.add_argument("--yaml-content", help="YAML content as string")
    p.add_argument("--yaml-base64", help="Base64 encoded YAML content")
    p.add_argument("--yaml-stdin", action="store_true", help="Read YAML from stdin")

    # 兼容原有参数
    p.add_argument("--config", help="Configuration file (YAML or JSON)")
    p.add_argument("--quick", action="store_true", help="Generate with default test data")

    return p

def main():
    args = build_arg_parser().parse_args()

    try:
        # 处理不同的输入方式
        if args.yaml_content:
            # 直接从命令行参数读取 YAML
            yaml_content = detect_and_fix_yaml_content(args.yaml_content)
            offer, issues = coerce_student_offer_from_yaml_content(yaml_content)
        elif args.yaml_base64:
            # 从 Base64 编码的 YAML 读取
            try:
                yaml_content = base64.b64decode(args.yaml_base64).decode('utf-8')
                yaml_content = detect_and_fix_yaml_content(yaml_content)
                offer, issues = coerce_student_offer_from_yaml_content(yaml_content)
            except Exception as e:
                print(f"[ERROR] Failed to decode Base64 YAML: {e}")
                sys.exit(1)
        elif args.yaml_stdin:
            # 从标准输入读取 YAML
            yaml_content = sys.stdin.read()
            yaml_content = detect_and_fix_yaml_content(yaml_content)
            offer, issues = coerce_student_offer_from_yaml_content(yaml_content)
        elif args.config:
            # 从配置文件读取 - 使用强健的文件读取器
            if yaml is None:
                print("[ERROR] PyYAML not installed. Run: pip install pyyaml")
                sys.exit(1)
            try:
                yaml_content = robust_file_reader(args.config)
                offer, issues = coerce_student_offer_from_yaml_content(yaml_content)
            except Exception as e:
                print(f"[ERROR] Failed to load config file: {e}")
                sys.exit(1)
        elif args.quick:
            # 快速测试模式
            quick_yaml = """
student_info:
  title: "Mr"
  first_name: "Test"
  last_name: "Student"
  gender: "M"
  dob: "1995-01-01"
  email: "test@example.com"
  student_origin: "OverseasStudent"
compliance:
  visa_type: "Student Visa"
addresses:
  - address_type: "Current"
    is_primary: true
applied_courses:
  - course_id: "CPC50220"
disabilities: []
emergency_contact: {}
education_history: []
employment_history: []
leads_marketing: {}
"""
            offer, issues = coerce_student_offer_from_yaml_content(quick_yaml)
        else:
            print("[ERROR] No input method specified. Use --yaml-content, --yaml-base64, --yaml-stdin, --config, or --quick")
            sys.exit(1)

        # 写入输出文件
        out_path = os.path.abspath(args.out)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(offer, ensure_ascii=False, indent=2))
        print(f"Written to {out_path}")

        if issues:
            print("[WARN] Auto-fix notes:")
            for it in issues:
                print(f" - {it}")

    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()