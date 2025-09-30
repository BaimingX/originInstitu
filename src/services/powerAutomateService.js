// Power Automate服务 - 通过HTTP请求触发流
const POWER_AUTOMATE_CONFIG = {
  studentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL || '',
  agentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL || ''
};

// 提交学生申请到Power Automate流
export const submitStudentApplicationToPowerAutomate = async (formData, files = []) => {
  try {
    const flowUrl = POWER_AUTOMATE_CONFIG.studentFlowUrl;
    
    if (!flowUrl) {
      throw new Error('Student application Power Automate flow URL not configured');
    }

    console.log('Original form data:', formData);
    console.log('File data:', files);

    // 创建FormData对象
    const submitData = new FormData();
    
    // 定义所有字段并逐一添加（带调试）
    const fields = [
      ['title', `${formData.firstName || ''} ${formData.middleName || ''} ${formData.familyName || ''}`.trim()],
      ['studentType', formData.studentType || ''],
      ['selectedAgent', formData.selectedAgent || ''],
      ['firstName', formData.firstName || ''],
      ['middleName', formData.middleName || ''],
      ['familyName', formData.familyName || ''],
      ['gender', formData.gender || ''],
      ['preferredName', formData.preferredName || ''],
      ['dateOfBirth', formData.dateOfBirth || ''],
      ['email', formData.email || ''],
      ['birthplace', formData.birthplace || ''],
      ['countryOfBirth', formData.countryOfBirth || ''],
      ['nationality', formData.nationality || ''],
      ['passportNumber', formData.passportNumber || ''],
      ['passportExpiryDate', formData.passportExpiryDate || ''],
      ['visaNumber', formData.visaNumber || ''],
      ['visaExpiryDate', formData.visaExpiryDate || ''],
      ['country', formData.country || ''],
      ['buildingName', formData.buildingName || ''],
      ['flatDetails', formData.flatDetails || ''],
      ['streetNumber', formData.streetNumber || ''],
      ['streetName', formData.streetName || ''],
      ['cityTownSuburb', formData.cityTownSuburb || ''],
      ['state', formData.state || ''],
      ['postcode', formData.postcode || ''],
      ['homePhone', formData.homePhone || ''],
      ['workPhone', formData.workPhone || ''],
      ['mobilePhone', formData.mobilePhone || ''],
      ['languageInHome', formData.languageInHome || ''],
      ['intakeYear', formData.intakeYear || ''],
      ['course', formData.course || ''],
      ['preferredStudyPeriod', formData.preferredStudyPeriod || ''],
      ['submissionDate', new Date().toISOString()],
      ['status', '已提交']
    ];

    // 逐一添加字段并捕获错误
    fields.forEach(([key, value]) => {
      try {
        const stringValue = String(value);
        console.log(`Adding field: ${key} = ${stringValue} (type: ${typeof value})`);
        submitData.append(key, stringValue);
      } catch (error) {
        console.error(`Field ${key} addition failed:`, error, 'Value:', value, 'Type:', typeof value);
        throw new Error(`Field ${key} addition failed: ${error.message}`);
      }
    });
    
    // 分析文件类型 - 使用fileCategory属性
    const photoIdFile = files.find(f => f.fileCategory === 'photo-id');
    const residencyProofFile = files.find(f => f.fileCategory === 'residency-proof');
    
    console.log('Photo ID file:', photoIdFile);
    console.log('Residency Proof file:', residencyProofFile);
    
    // 添加文件
    try {
      if (photoIdFile) {
        console.log('Adding Photo ID file:', photoIdFile.name, 'MIME type:', photoIdFile.type);
        submitData.append('photoIdFile', photoIdFile, photoIdFile.name);
      }
      
      if (residencyProofFile) {
        console.log('Adding Residency Proof file:', residencyProofFile.name, 'MIME type:', residencyProofFile.type);
        submitData.append('residencyProofFile', residencyProofFile, residencyProofFile.name);
      }
    } catch (error) {
      console.error('File addition failed:', error);
      throw new Error(`File addition failed: ${error.message}`);
    }
    
    // 文件信息（转换为字符串）
    const fileFields = [
      ['hasFiles', String(files.length > 0)],
      ['fileCount', String(files.length)],
      ['hasPhotoId', String(!!photoIdFile)],
      ['hasResidencyProof', String(!!residencyProofFile)],
      ['Photo ID', !!photoIdFile ? 'Yes' : 'No'],
      ['Residency/Visa proof', !!residencyProofFile ? 'Yes' : 'No']
    ];

    fileFields.forEach(([key, value]) => {
      try {
        console.log(`Adding file information field: ${key} = ${value}`);
        submitData.append(key, value);
      } catch (error) {
        console.error(`File information field ${key} addition failed:`, error);
        throw new Error(`File information field ${key} addition failed: ${error.message}`);
      }
    });

    console.log('FormData created successfully, starting submission...');

    const response = await fetch(flowUrl, {
      method: 'POST',
      // 注意：不设置Content-Type，让浏览器自动设置multipart/form-data
      body: submitData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Power Automate flow call failed: ${response.status} - ${errorText}`);
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = { success: true };
    }

    return {
      success: true,
      message: 'Student application submitted successfully to SharePoint list!',
      data: {
        id: result.id || Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'processed',
        powerAutomateResponse: result
      }
    };

  } catch (error) {
    console.error('Power Automate student application submission error:', error);
    throw new Error(`Student application submission failed: ${error.message}`);
  }
};

// 提交中介申请到Power Automate流
export const submitAgentApplicationToPowerAutomate = async (formData, files = []) => {
  try {
    const flowUrl = POWER_AUTOMATE_CONFIG.agentFlowUrl;
    
    if (!flowUrl) {
      throw new Error('Agent application Power Automate flow URL not configured');
    }

    // 验证必须文件（稍后检查agentIntroductionFile）

    console.log('Original Agent form data:', formData);
    console.log('Agent files:', files);

    // 创建FormData对象
    const submitData = new FormData();
    
    // 定义所有字段并逐一添加（带调试）
    const fields = [
      ['title', formData.agentApplicationId || ''],
      ['agencyName', formData.agencyName || ''],
      ['contactPerson', formData.contactPerson || ''],
      ['primaryEmail', formData.primaryEmail || ''],
      ['alternateEmail', formData.alternateEmail || ''],
      ['tel', formData.tel || ''],
      ['country', formData.country || ''],
      ['address', formData.address || ''],
      ['cityTownSuburb', formData.cityTownSuburb || ''],
      ['stateProvince', formData.stateProvince || ''],
      ['postcode', formData.postcode || ''],
      ['acn', formData.acn || ''],
      ['abn', formData.abn || ''],
      ['targetRecruitmentCountryPrimary', formData.targetRecruitmentCountry || ''],
      ['submissionDate', new Date().toISOString()],
      ['status', '已提交']
    ];

    // 逐一添加字段并捕获错误
    fields.forEach(([key, value]) => {
      try {
        const stringValue = String(value);
        console.log(`Adding Agent field: ${key} = ${stringValue} (type: ${typeof value})`);
        submitData.append(key, stringValue);
      } catch (error) {
        console.error(`Agent field ${key} addition failed:`, error, 'Value:', value, 'Type:', typeof value);
        throw new Error(`Agent field ${key} addition failed: ${error.message}`);
      }
    });
    
    // 分析文件类型 - 现在只支持一个PDF文件
    const agentIntroductionFile = files.find(f => f.fileCategory === 'agent-introduction' || !f.fileCategory);
    
    console.log('Agent Introduction file:', agentIntroductionFile);
    
    // 验证必须文件
    if (!agentIntroductionFile) {
      throw new Error('Agent introduction document is required. Please upload a PDF document.');
    }
    
    // 验证文件格式为PDF
    if (agentIntroductionFile.type !== 'application/pdf' && !agentIntroductionFile.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are supported for agent introduction documents.');
    }
    
    // 添加文件信息（转换为字符串）
    const fileFields = [
      ['hasFiles', String(files.length > 0)],
      ['fileCount', String(files.length)],
      ['hasAgentIntroduction', String(!!agentIntroductionFile)],
      ['AgentProfile_x002f_Introductionf', !!agentIntroductionFile ? 'Yes' : 'No'],
      ['AgentIntroduction', !!agentIntroductionFile ? 'Yes' : 'No']
    ];

    fileFields.forEach(([key, value]) => {
      try {
        console.log(`Adding Agent file information field: ${key} = ${value}`);
        submitData.append(key, value);
      } catch (error) {
        console.error(`Agent file information field ${key} addition failed:`, error);
        throw new Error(`Agent file information field ${key} addition failed: ${error.message}`);
      }
    });
    
    // 添加Agent Introduction PDF文件
    try {
      if (agentIntroductionFile) {
        console.log('Adding Agent Introduction PDF file:', agentIntroductionFile.name, 'MIME type:', agentIntroductionFile.type);
        
        // 添加文件本身
        submitData.append('agentIntroductionFile', agentIntroductionFile, agentIntroductionFile.name);
        
        // 添加文件名信息供Power Automate使用
        const fileName = agentIntroductionFile.name;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        
        submitData.append('agentIntroductionFile_name', fileName);
        submitData.append('agentIntroductionFile_extension', fileExtension);
        submitData.append('agentIntroductionFile_nameOnly', fileNameWithoutExt);
        
        console.log('PDF file information:', {
          fileName,
          fileExtension,
          fileNameWithoutExt
        });
      }
    } catch (error) {
      console.error('Agent Introduction PDF file addition failed:', error);
      throw new Error(`Agent Introduction PDF file addition failed: ${error.message}`);
    }

    console.log('Agent FormData created successfully, starting submission...');

    const response = await fetch(flowUrl, {
      method: 'POST',
      body: submitData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Power Automate flow call failed: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = { success: true };
    }

    return {
      success: true,
      message: 'Agent application submitted successfully to SharePoint!',
      data: {
        id: result.id || Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'processed',
        powerAutomateResponse: result
      }
    };

  } catch (error) {
    console.error('Power Automate Agent Application Error:', error);
    throw new Error(`Agent application submission failed: ${error.message}`);
  }
};

// 统一的提交函数
export const submitToPowerAutomate = async (formData, files = []) => {
  if (formData.formType === 'agent-application') {
    return await submitAgentApplicationToPowerAutomate(formData, files);
  } else {
    return await submitStudentApplicationToPowerAutomate(formData, files);
  }
};

// 检查Power Automate是否已配置
export const isPowerAutomateConfigured = () => {
  return !!(POWER_AUTOMATE_CONFIG.studentFlowUrl && POWER_AUTOMATE_CONFIG.agentFlowUrl);
};

// 检查特定类型的流是否已配置
export const isStudentFlowConfigured = () => {
  return !!POWER_AUTOMATE_CONFIG.studentFlowUrl;
};

export const isAgentFlowConfigured = () => {
  return !!POWER_AUTOMATE_CONFIG.agentFlowUrl;
}; 