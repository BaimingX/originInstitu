export const MESHED_TEST_VALUE_DEFAULTS = {
  "keyword": "test",
  "pageIndex": 1,
  "pageSize": 5,
  "agentId": 1,
  "campusId": 1,
  "courseId": "CPC50220",
  "offerId": "OFFER_20250424_TEST",
  "studentId": "STU_1",
  "resultsId": 1,
  "subjectId": "SUBJECT_1",
  "unitId": "UNIT_1",
  "serviceCategoryId": 1,
  "facilityId": 1,
  "eventType": "StudentUpdated",
  "targetUrl": "https://example.com/webhook"
};

export const MESHED_TEST_FIELDS = [
  {
    "key": "keyword",
    "label": "Search keyword",
    "type": "text"
  },
  {
    "key": "pageIndex",
    "label": "Page index",
    "type": "number"
  },
  {
    "key": "pageSize",
    "label": "Page size",
    "type": "number"
  },
  {
    "key": "agentId",
    "label": "Agent ID",
    "type": "number"
  },
  {
    "key": "campusId",
    "label": "Campus ID",
    "type": "number"
  },
  {
    "key": "courseId",
    "label": "Course ID",
    "type": "text"
  },
  {
    "key": "offerId",
    "label": "Offer ID",
    "type": "text"
  },
  {
    "key": "studentId",
    "label": "Student ID",
    "type": "text"
  },
  {
    "key": "resultsId",
    "label": "Results ID",
    "type": "number"
  },
  {
    "key": "subjectId",
    "label": "Subject ID",
    "type": "text"
  },
  {
    "key": "unitId",
    "label": "Unit ID",
    "type": "text"
  },
  {
    "key": "serviceCategoryId",
    "label": "Service category ID",
    "type": "number"
  },
  {
    "key": "facilityId",
    "label": "Facility ID",
    "type": "number"
  },
  {
    "key": "eventType",
    "label": "Webhook event",
    "type": "text"
  },
  {
    "key": "targetUrl",
    "label": "Webhook target URL",
    "type": "text"
  }
];

export const MESHED_API_CATEGORIES = [
  {
    "id": "app-authentication",
    "label": "AppAuthentication",
    "docTag": "AppAuthentication",
    "operations": [
      {
        "id": "app-authentication-post-token",
        "label": "Get Token",
        "method": "POST",
        "provider": "meshed-auth",
        "pathTemplate": "token",
        "queryTemplate": "",
        "kind": "auth",
        "bodyType": "json",
        "bodyTemplate": {
          "userName": "Test",
          "password": "string"
        }
      }
    ]
  },
  {
    "id": "agent",
    "label": "Agent",
    "docTag": "Agent",
    "operations": [
      {
        "id": "agent-get-api-agent",
        "label": "Get Agent List",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Agent",
        "queryTemplate": "pageIndex={{pageIndex}}&pageSize={{pageSize}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "agent-get-api-agent-id",
        "label": "Get Agent by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Agent/{{agentId}}",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "agent-post-api-agent",
        "label": "Add New Agent",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Agent",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "form",
        "bodyTemplate": {
          "AgentName": "Origin Test Agent",
          "AgentOrigin": "Mainland China",
          "ContactPerson": "Test User",
          "PrimaryEmail": "test@example.com",
          "NumberOfEmployees": 5,
          "PrimaryTargetCountry": "Australia",
          "IsGSTRegistered": false
        }
      }
    ]
  },
  {
    "id": "campus",
    "label": "Campus",
    "docTag": "Campus",
    "operations": [
      {
        "id": "campus-get-api-campus",
        "label": "Get Campuses",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Campus",
        "queryTemplate": "refresh=true",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "campus-get-api-campus-id",
        "label": "Get Campus by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Campus/{{campusId}}",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "campus-get-api-campus-id-course",
        "label": "Get Campus Courses",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Campus/{{campusId}}/Course",
        "queryTemplate": "active=true",
        "kind": "read",
        "bodyType": null
      }
    ]
  },
  {
    "id": "classification",
    "label": "Classification",
    "docTag": "Classification",
    "operations": [
      {
        "id": "classification-get-api-classification-agent-address-type",
        "label": "Get Agent Address Types",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/AgentAddressType",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-agent-document-checklist",
        "label": "Get Agent Document Checklist",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/AgentDocumentChecklist",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-agent-origin",
        "label": "Get Agent Origins",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/AgentOrigin",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-country-nationality",
        "label": "Get Country/Nationality",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/CountryNationality",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-current-employment-status",
        "label": "Get Current Employment Status",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/CurrentEmploymentStatus",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-custom-field",
        "label": "Get Custom Fields",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/CustomField",
        "queryTemplate": "IsMandatory=true&IsOpenedForAppliedByStudent=true&StudentOrigin=Overseas Student",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-disability",
        "label": "Get Disability",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/Disability",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-education-level",
        "label": "Get Education Levels",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/EducationLevel",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-gender",
        "label": "Get Genders",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/Gender",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-how-well-eng-spoken",
        "label": "Get Proficiency in Spoken English",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/HowWellEngSpoken",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-know-from",
        "label": "Get CRM KnowFroms",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/KnowFrom",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-language",
        "label": "Get Languages",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/Language",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-lead-source",
        "label": "Get CRM LeadSources",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/LeadSource",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-name-title",
        "label": "Get Name Titles",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/NameTitle",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-offer-document-checklist",
        "label": "Get Offer Documents Checklist",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/OfferDocumentChecklist",
        "queryTemplate": "StudentOrigin=Overseas Student&IsMandatory=true",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-residential-visa-type",
        "label": "Get Visa Types",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/ResidentialVisaType",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-service-facility",
        "label": "Get Service Facilities",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/ServiceFacility",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-service-facility-provider",
        "label": "Get Service Provider with Facility",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/ServiceFacilityProvider",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-student-address-type",
        "label": "Get Student Address Types",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/StudentAddressType",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-student-origin",
        "label": "Get Student Origins",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/StudentOrigin",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "classification-get-api-classification-study-reason",
        "label": "Get Study Reasons",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Classification/StudyReason",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      }
    ]
  },
  {
    "id": "course",
    "label": "Course",
    "docTag": "Course",
    "operations": [
      {
        "id": "course-get-api-course",
        "label": "Get Courses",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Course",
        "queryTemplate": "active=true",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "course-get-api-course-id",
        "label": "Get Course by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Course/{{courseId}}",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "course-get-api-course-id-campus",
        "label": "Get Campuses by Course ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Course/{{courseId}}/Campus",
        "queryTemplate": "courseid={{courseId}}",
        "kind": "read",
        "bodyType": null
      }
    ]
  },
  {
    "id": "intake",
    "label": "Intake",
    "docTag": "Intake",
    "operations": [
      {
        "id": "intake-get-api-intake",
        "label": "Get Intakes",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Intake",
        "queryTemplate": "pageIndex={{pageIndex}}&pageSize={{pageSize}}&publish=true&courseid={{courseId}}",
        "kind": "read",
        "bodyType": null
      }
    ]
  },
  {
    "id": "offer",
    "label": "Offer",
    "docTag": "Offer",
    "operations": [
      {
        "id": "offer-get-api-offer",
        "label": "Get Offer by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer",
        "queryTemplate": "offerId={{offerId}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-get-api-offer-offer-id-disability",
        "label": "Get Disability by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/Disability",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-get-api-offer-offer-id-education-history",
        "label": "Get Education History by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EducationHistory",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-get-api-offer-offer-id-emergency-contact",
        "label": "Get Emergency Contact by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EmergencyContact",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-get-api-offer-offer-id-employment-history",
        "label": "Get Employment History by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EmploymentHistory",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-get-api-offer-offer-id-service-request",
        "label": "Get Service Request by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/ServiceRequest",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "offer-post-api-offer",
        "label": "Submit Offer Application",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "form",
        "bodyTemplate": {
          "Title": "Mr",
          "FirstName": "Test",
          "LastName": "User",
          "Gender": "M",
          "DateOfBirth": "1995-01-01",
          "PersonalEmail": "test@example.com",
          "StudentOrigin": "Overseas Student",
          "CountryOfBirth": "China",
          "Nationality": "Chinese",
          "ResidentialType": "Student Visa",
          "PrimarySpokenLanguage": "English",
          "HowWellEnglishSpeak": "1",
          "CurrentEmploymentStatus": "01",
          "IsAboriginal": false,
          "IsTorresStraitIslander": false,
          "OfferAddresses": [
            {
              "addressType": "Postal Address",
              "streetNumber": "1",
              "streetName": "Test Street",
              "suburb": "Melbourne",
              "state": "VIC",
              "postcode": "3000",
              "country": "Australia"
            }
          ],
          "OfferAppliedCourses": [
            {
              "courseId": "{{courseId}}",
              "agentId": "{{agentId}}",
              "campusId": "{{campusId}}",
              "intakeDate": "2026-04-24T00:00:00.000Z",
              "startDate": "2026-04-24T00:00:00.000Z",
              "finishDate": "2027-04-24T00:00:00.000Z",
              "tuitionFee": 0,
              "upfrontFee": 0,
              "enrolmentFee": 0,
              "materialFee": 0,
              "studyReason": "11"
            }
          ]
        }
      },
      {
        "id": "offer-post-api-offer-offer-id-disability",
        "label": "Add Disability",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/Disability",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "offerId": "{{offerId}}",
            "disabilityCode": "HEARING"
          }
        ]
      },
      {
        "id": "offer-post-api-offer-offer-id-education-history",
        "label": "Add Education History",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EducationHistory",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "offerId": "{{offerId}}",
            "qualificationLevel": "Bachelor Degree"
          }
        ]
      },
      {
        "id": "offer-post-api-offer-offer-id-emergency-contact",
        "label": "Add Emergency Contact",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EmergencyContact",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": {
          "contactType": "Mobile",
          "relationship": "Friend",
          "firstName": "Test",
          "isPrimaryContact": true,
          "offerId": "{{offerId}}"
        }
      },
      {
        "id": "offer-post-api-offer-offer-id-employment-history",
        "label": "Add Employment History",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/EmploymentHistory",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "offerId": "{{offerId}}",
            "companyName": "Test Company",
            "jobTitle": "Administrator",
            "startDate": "2024-01-01"
          }
        ]
      },
      {
        "id": "offer-post-api-offer-offer-id-service-request",
        "label": "Add Service Request",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Offer/{{offerId}}/ServiceRequest",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "categoryId": "{{serviceCategoryId}}",
            "facilityId": "{{facilityId}}",
            "studentPrice_SubTotal": 0,
            "offerId": "{{offerId}}"
          }
        ]
      }
    ]
  },
  {
    "id": "student",
    "label": "Student",
    "docTag": "Student",
    "operations": [
      {
        "id": "student-get-api-student",
        "label": "Get Student by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student",
        "queryTemplate": "studentId={{studentId}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-student-id-disability",
        "label": "Get Disability by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/Disability",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-student-id-education-history",
        "label": "Get Education History by Student ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EducationHistory",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-student-id-emergency-contact",
        "label": "Get Emergency Contact by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EmergencyContact",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-student-id-employment-history",
        "label": "Get Employment History by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EmploymentHistory",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-student-id-service-request",
        "label": "Get Service Request by ID",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/ServiceRequest",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-get-api-student-search",
        "label": "Search Student",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Student/Search",
        "queryTemplate": "q={{keyword}}&pageIndex={{pageIndex}}&pageSize={{pageSize}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "student-post-api-student",
        "label": "Add New Student",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "form",
        "bodyTemplate": {
          "Title": "Mr",
          "FirstName": "Test",
          "LastName": "Student",
          "Gender": "M",
          "DateOfBirth": "1995-01-01",
          "PersonalEmail": "student@example.com",
          "StudentOrigin": "Overseas Student",
          "CountryOfBirth": "China",
          "Nationality": "Chinese",
          "ResidentialType": "Student Visa",
          "PrimarySpokenLanguage": "English",
          "HowWellEnglishSpeak": "1",
          "CurrentEmploymentStatus": "01",
          "IsAboriginal": false,
          "IsTorresStraitIslander": false,
          "Addresses": [
            {
              "addressType": "Postal Address",
              "streetNumber": "1",
              "streetName": "Test Street",
              "suburb": "Melbourne",
              "state": "VIC",
              "postcode": "3000",
              "country": "Australia"
            }
          ],
          "AppliedCourses": [
            {
              "courseId": "{{courseId}}",
              "agentId": "{{agentId}}",
              "campusId": "{{campusId}}",
              "intakeDate": "2026-04-24T00:00:00.000Z",
              "startDate": "2026-04-24T00:00:00.000Z",
              "finishDate": "2027-04-24T00:00:00.000Z",
              "tuitionFee": 0,
              "upfrontFee": 0,
              "enrolmentFee": 0,
              "materialFee": 0,
              "studyReason": "11"
            }
          ]
        }
      },
      {
        "id": "student-post-api-student-student-id-applied-course",
        "label": "Add Applied Courses for Existing Student",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/AppliedCourse",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "courseId": "{{courseId}}",
            "agentId": "{{agentId}}",
            "campusId": "{{campusId}}",
            "intakeDate": "2026-04-24T00:00:00.000Z",
            "startDate": "2026-04-24T00:00:00.000Z",
            "finishDate": "2027-04-24T00:00:00.000Z",
            "tuitionFee": 0,
            "upfrontFee": 0,
            "enrolmentFee": 0,
            "materialFee": 0,
            "studyReason": "11"
          }
        ]
      },
      {
        "id": "student-post-api-student-student-id-disability",
        "label": "Add Disability",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/Disability",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "studentId": "{{studentId}}",
            "disabilityCode": "HEARING"
          }
        ]
      },
      {
        "id": "student-post-api-student-student-id-education-history",
        "label": "Add Education History",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EducationHistory",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "studentId": "{{studentId}}",
            "qualificationLevel": "Bachelor Degree"
          }
        ]
      },
      {
        "id": "student-post-api-student-student-id-emergency-contact",
        "label": "Add Emergency Contact",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EmergencyContact",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": {
          "contactType": "Mobile",
          "relationship": "Friend",
          "firstName": "Test",
          "isPrimaryContact": true,
          "studentId": "{{studentId}}"
        }
      },
      {
        "id": "student-post-api-student-student-id-employment-history",
        "label": "Add Employment History",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/EmploymentHistory",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "studentId": "{{studentId}}",
            "companyName": "Test Company",
            "jobTitle": "Administrator",
            "startDate": "2024-01-01"
          }
        ]
      },
      {
        "id": "student-post-api-student-student-id-service-request",
        "label": "Add Service Request",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Student/{{studentId}}/ServiceRequest",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "categoryId": "{{serviceCategoryId}}",
            "facilityId": "{{facilityId}}",
            "studentPrice_SubTotal": 0,
            "studentId": "{{studentId}}"
          }
        ]
      }
    ]
  },
  {
    "id": "study-activity",
    "label": "StudyActivity",
    "docTag": "StudyActivity",
    "operations": [
      {
        "id": "study-activity-get-api-study-activity-subject-enrolment",
        "label": "Get Subject Enrolment List",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/SubjectEnrolment",
        "queryTemplate": "pageIndex={{pageIndex}}&pageSize={{pageSize}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "study-activity-get-api-study-activity-unit-enrolment",
        "label": "Get Unit Enrolment List",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/UnitEnrolment",
        "queryTemplate": "pageIndex={{pageIndex}}&pageSize={{pageSize}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "study-activity-patch-api-study-activity-subject-enrolment-batch",
        "label": "Update Subject Outcome MethodA",
        "method": "PATCH",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/SubjectEnrolment/Batch",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "resultsId": "{{resultsId}}",
            "outcome": "PA",
            "marks": 75,
            "resultComments": "Connectivity test",
            "enforceToUpdate": false
          }
        ]
      },
      {
        "id": "study-activity-patch-api-study-activity-subject-enrolment-batch2",
        "label": "Update Subject Outcome MethodB",
        "method": "PATCH",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/SubjectEnrolment/Batch2",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "studentId": "{{studentId}}",
            "courseId": "{{courseId}}",
            "courseAttempt": 1,
            "semester": "2026S1",
            "term": "T1",
            "subjectId": "{{subjectId}}",
            "subjectAttempt": 1,
            "outcome": "PA",
            "marks": 75,
            "resultComments": "Connectivity test",
            "enforceToUpdate": false
          }
        ]
      },
      {
        "id": "study-activity-patch-api-study-activity-unit-enrolment-batch",
        "label": "Update Unit Outcome MethodA",
        "method": "PATCH",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/UnitEnrolment/Batch",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "resultsId": "{{resultsId}}",
            "unitId": "{{unitId}}",
            "outcome": "CA",
            "marks": 75,
            "resultComments": "Connectivity test",
            "enforceToUpdate": false
          }
        ]
      },
      {
        "id": "study-activity-patch-api-study-activity-unit-enrolment-batch2",
        "label": "Update Unit Outcome MethodB",
        "method": "PATCH",
        "provider": "meshed",
        "pathTemplate": "api/StudyActivity/UnitEnrolment/Batch2",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "json",
        "bodyTemplate": [
          {
            "studentId": "{{studentId}}",
            "courseId": "{{courseId}}",
            "courseAttempt": 1,
            "semester": "2026S1",
            "term": "T1",
            "subjectId": "{{subjectId}}",
            "subjectAttempt": 1,
            "unitId": "{{unitId}}",
            "outcome": "CA",
            "marks": 75,
            "resultComments": "Connectivity test",
            "enforceToUpdate": false
          }
        ]
      }
    ]
  },
  {
    "id": "webhook",
    "label": "Webhook",
    "docTag": "Webhook",
    "operations": [
      {
        "id": "webhook-get-api-webhook",
        "label": "Get all webhook subscriptions",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Webhook",
        "queryTemplate": "",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "webhook-get-api-webhook-get-webhook-activity-log",
        "label": "Get Webhook Activity Log List",
        "method": "GET",
        "provider": "meshed",
        "pathTemplate": "api/Webhook/GetWebhookActivityLog",
        "queryTemplate": "PageIndex={{pageIndex}}&PageSize={{pageSize}}",
        "kind": "read",
        "bodyType": null
      },
      {
        "id": "webhook-patch-api-webhook-event-type",
        "label": "Update Webhook subscription",
        "method": "PATCH",
        "provider": "meshed",
        "pathTemplate": "api/Webhook/EventType",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "form",
        "bodyTemplate": {
          "EventType": "{{eventType}}"
        }
      },
      {
        "id": "webhook-post-api-webhook",
        "label": "Add New Webhook subscription",
        "method": "POST",
        "provider": "meshed",
        "pathTemplate": "api/Webhook",
        "queryTemplate": "",
        "kind": "write",
        "bodyType": "form",
        "bodyTemplate": {
          "EventType": "{{eventType}}",
          "TargetUrl": "{{targetUrl}}"
        }
      }
    ]
  }
];
