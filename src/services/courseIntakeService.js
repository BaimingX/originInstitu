/**
 * Course Intake Service
 * 处理CRICOS课程入学日期API调用
 */

const API_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const API_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;

// Supported course catalog for selection and defaults
const COURSE_CATALOG = {
  CPC30220: 'Certificate III in Carpentry',
  CPC40120: 'Certificate IV in Building and Construction',
  CPC50220: 'Diploma of Building and Construction (Building)'
};

/**
 * 获取访问令牌（复用cricosApiService.js的逻辑）
 */
const getAccessToken = async () => {
  if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
    throw new Error('CRICOS API credentials not configured in environment variables');
  }

  const tokenUrl = `${API_BASE_URL}/token`;

  const formData = new URLSearchParams({
    grant_type: 'password',
    username: API_USERNAME,
    password: API_PASSWORD
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('获取访问令牌错误:', error);
    throw error;
  }
};

/**
 * 格式化日期为用户友好的显示格式
 */
const formatIntakeDate = (isoDateString) => {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return isoDateString; // 如果格式化失败，返回原始字符串
  }
};


/**
 * 执行API查询的辅助函数
 */
const executeQuery = async (token, queryParams) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const intakeUrl = `${API_BASE_URL}/api/V1/CourseIntakes?${queryString}`;

  console.log(`📋 查询: ${intakeUrl}`);

  const response = await fetch(intakeUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API请求失败: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`);
  }

  const data = await response.json();
  console.log(`📊 找到 ${data.length} 条记录`);
  return data;
};

/**
 * 获取课程入学日期列表 (多策略查询)
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 入学日期列表结果
 */
export const fetchCourseIntakes = async (params = {}) => {
  try {
    console.log('🔍 开始获取课程入学日期...');

    // 详细的环境变量调试信息
    console.log('🔧 调试环境变量:');
    console.log('  - API_BASE_URL:', !!API_BASE_URL, API_BASE_URL ? API_BASE_URL.substring(0, 50) + '...' : 'undefined');
    console.log('  - API_USERNAME:', !!API_USERNAME, API_USERNAME ? API_USERNAME.substring(0, 5) + '...' : 'undefined');
    console.log('  - API_PASSWORD:', !!API_PASSWORD, API_PASSWORD ? '***' : 'undefined');

    // 检查环境变量
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      const missingVars = [];
      if (!API_BASE_URL) missingVars.push('REACT_APP_CRICOS_API_BASE_URL');
      if (!API_USERNAME) missingVars.push('REACT_APP_CRICOS_API_USERNAME');
      if (!API_PASSWORD) missingVars.push('REACT_APP_CRICOS_API_PASSWORD');

      const errorMsg = `CRICOS API 配置缺失。缺少环境变量：${missingVars.join(', ')}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🔑 正在获取访问令牌...');
    const token = await getAccessToken();
    console.log('✅ 访问令牌获取成功');

    const currentYear = new Date().getFullYear();
    const courseId = params.courseid || params.courseId || 'CPC50220';
    let intakeData = [];

    // 策略 1: 精确匹配查询（根据后端数据调整）
    console.log('🎯 策略1: 精确查询 (campus+年份+课程+VET+Both)');
    const exactQueryParams = {
      campusid: 1,
      year: currentYear,
      courseid: courseId,
      coursetype: 'VET',
      targetfor: 'Both'
    };

    try {
      intakeData = await executeQuery(token, exactQueryParams);
      if (intakeData.length > 0) {
        console.log('✅ 策略1成功，找到精确匹配数据');
      }
    } catch (error) {
      console.warn('⚠️ 策略1失败:', error.message);
    }

    // 策略 2: 不限制发布状态（因为后端可能没有发布）
    if (intakeData.length === 0) {
      console.log('🎯 策略2: 查询所有状态（不限制发布状态）');
      const noPublishParams = {
        campusid: 1,
        year: currentYear,
        courseid: courseId,
        coursetype: 'VET'
      };

      try {
        intakeData = await executeQuery(token, noPublishParams);
        if (intakeData.length > 0) {
          console.log('✅ 策略2成功，找到未发布数据');
        }
      } catch (error) {
        console.warn('⚠️ 策略2失败:', error.message);
      }
    }

    // 策略 3: 基本查询（年份+课程类型+校区）
    if (intakeData.length === 0) {
      console.log('🎯 策略3: 基本查询 (campus+年份+VET)');
      const basicQueryParams = {
        campusid: 1,
        year: currentYear,
        coursetype: 'VET'
      };

      try {
        intakeData = await executeQuery(token, basicQueryParams);
        if (intakeData.length > 0) {
          console.log('✅ 策略3成功，找到基本数据');
        }
      } catch (error) {
        console.warn('⚠️ 策略3失败:', error.message);
      }
    }

    // 策略 4: 尝试International目标群体
    if (intakeData.length === 0) {
      console.log('🎯 策略4: 尝试International目标群体');
      const intlTargetParams = {
        campusid: 1,
        year: currentYear,
        coursetype: 'VET',
        targetfor: 'International'
      };

      try {
        intakeData = await executeQuery(token, intlTargetParams);
        if (intakeData.length > 0) {
          console.log('✅ 策略4成功，找到International数据');
        }
      } catch (error) {
        console.warn('⚠️ 策略4失败:', error.message);
      }
    }

    // 策略 5: 调试查询 - 获取所有2025年数据看看结构
    if (intakeData.length === 0) {
      console.log('🎯 策略5: 调试查询 - 获取所有2025年数据');
      const debugParams = {
        year: currentYear
      };

      try {
        intakeData = await executeQuery(token, debugParams);
        if (intakeData.length > 0) {
          console.log('✅ 策略5成功，找到调试数据');
          console.log('🔍 调试: 所有2025年数据结构:', intakeData);
        }
      } catch (error) {
        console.warn('⚠️ 策略5失败:', error.message);
      }
    }

    // 如果找到数据，还要查询明年的数据并合并
    if (intakeData.length > 0) {
      console.log('🎯 额外查询: 获取明年(' + (currentYear + 1) + ')数据');
      try {
        const nextYearParams = {
          campusid: 1,
          year: currentYear + 1,
          courseid: courseId,
          coursetype: 'VET'
        };

        const nextYearData = await executeQuery(token, nextYearParams);
        if (nextYearData.length > 0) {
          console.log(`✅ 明年查询成功，找到${nextYearData.length}条数据`);
          intakeData = [...intakeData, ...nextYearData]; // 合并数据
        }
      } catch (error) {
        console.warn('⚠️ 明年数据查询失败:', error.message);
      }
    }

    console.log('✅ 原始入学日期数据(含明年):', intakeData);

    // 过滤和格式化数据
    const today = new Date();
    const filteredIntakes = intakeData
      .filter(intake => {
        // 只显示未来的入学日期（发布状态可选，因为后端数据可能未设置）
        const intakeDate = new Date(intake.IntakeDate);
        const isFuture = intakeDate >= today;
        const isPublished = intake.IsPublished;
        // Normalize for comparison
        const normalizedCourseId = courseId ? courseId.trim().toUpperCase() : '';
        const intakeCourseId = intake.CourseId ? intake.CourseId.trim().toUpperCase() : '';
        const intakeCourseCode = intake.CourseCode ? intake.CourseCode.trim().toUpperCase() : '';

        // Match against CourseId or CourseCode (handling potential API field variance)
        const matchesCourse = !normalizedCourseId ||
          intakeCourseId === normalizedCourseId ||
          intakeCourseCode === normalizedCourseId;

        // Debug logging for mismatch analysis
        if (!matchesCourse && isFuture) {
          console.log(`❌ 过滤掉不匹配课程: IntakeCourse=${intakeCourseId}, TargetCourse=${normalizedCourseId}`);
        }

        // 优先显示已发布的未来日期，如果没有已发布的，则显示所有未来日期
        return isFuture && matchesCourse; // 暂时不强制要求发布状态
      })
      .map(intake => ({
        ...intake,
        formattedDate: formatIntakeDate(intake.IntakeDate),
        displayText: `${formatIntakeDate(intake.IntakeDate)} - ${intake.CourseName}`,
        value: intake.IntakeDate // 用于表单提交的值
      }))
      .sort((a, b) => new Date(a.IntakeDate) - new Date(b.IntakeDate)); // 按日期排序

    console.log('📅 处理后的入学日期:', filteredIntakes);

    return {
      success: true,
      data: filteredIntakes,
      count: filteredIntakes.length,
      message: `找到 ${filteredIntakes.length} 个可用入学日期`,
      queryStrategy: `使用多策略查询，原始数据 ${intakeData.length} 条，过滤后 ${filteredIntakes.length} 条`
    };

  } catch (error) {
    console.error('❌ 获取课程入学日期失败:', error);
    return {
      success: false,
      data: [],
      count: 0,
      message: `获取入学日期失败: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * 获取默认的入学日期选项（用于离线或错误情况）
 */
export const getDefaultIntakeOptions = (courseId = 'CPC50220') => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const today = new Date();
  const courseName = COURSE_CATALOG[courseId] || COURSE_CATALOG.CPC50220;

  const options = [
    // 当前年份的入学日期
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: currentYear,
      IntakeDate: `${currentYear}-01-13T00:00:00+11:00`,
      formattedDate: `January 13, ${currentYear}`,
      displayText: `January 13, ${currentYear} - ${courseName}`,
      value: `${currentYear}-01-13T00:00:00+11:00`,
      IsPublished: true
    },
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: currentYear,
      IntakeDate: `${currentYear}-04-08T00:00:00+11:00`,
      formattedDate: `April 8, ${currentYear}`,
      displayText: `April 8, ${currentYear} - ${courseName}`,
      value: `${currentYear}-04-08T00:00:00+11:00`,
      IsPublished: true
    },
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: currentYear,
      IntakeDate: `${currentYear}-08-04T00:00:00+11:00`,
      formattedDate: `August 4, ${currentYear}`,
      displayText: `August 4, ${currentYear} - ${courseName}`,
      value: `${currentYear}-08-04T00:00:00+11:00`,
      IsPublished: true
    },
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: currentYear,
      IntakeDate: `${currentYear}-11-17T00:00:00+11:00`,
      formattedDate: `November 17, ${currentYear}`,
      displayText: `November 17, ${currentYear} - ${courseName}`,
      value: `${currentYear}-11-17T00:00:00+11:00`,
      IsPublished: true
    },
    // 明年的入学日期
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: nextYear,
      IntakeDate: `${nextYear}-01-13T00:00:00+11:00`,
      formattedDate: `January 13, ${nextYear}`,
      displayText: `January 13, ${nextYear} - ${courseName}`,
      value: `${nextYear}-01-13T00:00:00+11:00`,
      IsPublished: true
    },
    {
      CampusId: 1,
      CampusName: "Main Campus",
      CourseId: courseId,
      CourseName: courseName,
      CourseType: "VET",
      IntakeYear: nextYear,
      IntakeDate: `${nextYear}-04-08T00:00:00+11:00`,
      formattedDate: `April 8, ${nextYear}`,
      displayText: `April 8, ${nextYear} - ${courseName}`,
      value: `${nextYear}-04-08T00:00:00+11:00`,
      IsPublished: true
    }
  ];

  // 只返回未来的日期
  return options.filter(option => {
    const intakeDate = new Date(option.IntakeDate);
    return intakeDate >= today;
  });
};
