// SharePoint REST API Service (without authentication)
// Note: This approach works for anonymous access or when deployed in SharePoint environment

// SharePoint站点和列表配置
const SHAREPOINT_CONFIG = {
  siteUrl: process.env.REACT_APP_SHAREPOINT_SITE_URL || "https://origininstitute.sharepoint.com/sites/OriginInstituteAdministrationTeam", // e.g., "https://contoso.sharepoint.com/sites/yoursite"
  listName: process.env.REACT_APP_SHAREPOINT_LIST_NAME || "Long Course Student Application Data List", // Your list name
  listId: process.env.REACT_APP_SHAREPOINT_LIST_ID || "08d619d7-d12f-42c8-a0c9-e569e28e01a9", // SharePoint List ID
  agentListName: process.env.REACT_APP_SHAREPOINT_AGENT_LIST_NAME || "New Agent Application List", // Agent list name
  agentListId: process.env.REACT_APP_SHAREPOINT_AGENT_LIST_ID || "e413dacf-63c7-4135-836d-82a8f5210dc5", // Agent SharePoint List ID
};

// 提交表单数据到SharePoint列表使用REST API
export const submitToSharePointList = async (formData, files = []) => {
  try {
    // 检查SharePoint是否配置
    const isSharePointConfigured = SHAREPOINT_CONFIG.siteUrl && 
                                   SHAREPOINT_CONFIG.siteUrl !== "YOUR_SHAREPOINT_SITE_URL";
    
    if (isSharePointConfigured) {
      // 使用真实的SharePoint API
      console.log('Using real SharePoint API to submit...');
      return await submitToSharePointDirect(formData, files);
    } else {
      // 如果没有配置，使用模拟API
      console.log('SharePoint not configured, using mock API...');
      // ... existing mock code ...
    }
  } catch (error) {
    console.error('SharePoint submission error:', error);
    throw new Error(`SharePoint submission failed: ${error.message}`);
  }
};

// 提交代理申请表单到SharePoint
export const submitAgentApplicationToSharePoint = async (formData, files = []) => {
  try {
    const listItem = {
      Title: formData.agencyName || '',
      AgentApplicationId: formData.agentApplicationId || '',
      AgencyName: formData.agencyName || '',
      ContactPerson: formData.contactPerson || '',
      PrimaryEmail: formData.primaryEmail || '',
      AlternateEmail: formData.alternateEmail || '',
      Tel: formData.tel || '',
      Country: formData.country || '',
      Address: formData.address || '',
      CityTownSuburb: formData.cityTownSuburb || '',
      StateProvince: formData.stateProvince || '',
      Postcode: formData.postcode || '',
      ACN: formData.acn || '',
      ABN: formData.abn || '',
      TargetRecruitmentCountryPrimary: formData.targetRecruitmentCountry || '',
      // 系统字段
      SubmissionDate: new Date().toISOString(),
      Status: 'Submitted'
    };

    // Simulate successful submission for now
    console.log('Agent Application SharePoint List Item Data:', listItem);
    console.log('Agent Profile Files to upload:', files);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      message: 'Agent application submitted successfully to SharePoint!',
      data: {
        id: Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'processed',
        sharePointConfig: SHAREPOINT_CONFIG
      }
    };
  } catch (error) {
    console.error('Error submitting agent application to SharePoint:', error);
    throw new Error(`Failed to submit agent application to SharePoint: ${error.message}`);
  }
};

// 实际的SharePoint REST API调用实现
export const submitToSharePointDirect = async (formData, files = []) => {
  try {
    const siteUrl = SHAREPOINT_CONFIG.siteUrl;
    const listName = formData.formType === 'agent-application' 
      ? SHAREPOINT_CONFIG.agentListName 
      : SHAREPOINT_CONFIG.listName;
    
    // 获取表单摘要令牌（SharePoint REST API所需）
    const digestResponse = await fetch(`${siteUrl}/_api/contextinfo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
      },
      credentials: 'include' // 包含cookies用于身份验证
    });

    if (!digestResponse.ok) {
      throw new Error('Failed to get form digest token');
    }

    const digestData = await digestResponse.json();
    const formDigestValue = digestData.d.GetContextWebInformation.FormDigestValue;

    // 准备列表项数据
    const itemData = formData.formType === 'agent-application' 
      ? prepareAgentItemData(formData)
      : prepareStudentItemData(formData);

    // 提交到SharePoint列表
    const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': formDigestValue,
      },
      body: JSON.stringify(itemData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SharePoint submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const itemId = result.d.Id;

    // 如果有文件，上传附件
    if (files.length > 0) {
      await uploadAttachments(siteUrl, listName, itemId, files, formDigestValue);
    }

    return {
      success: true,
      message: 'Successfully submitted to SharePoint list!',
      data: {
        id: itemId,
        submittedAt: new Date().toISOString(),
        status: 'processed',
        sharePointItemId: itemId
      }
    };
  } catch (error) {
    console.error('SharePoint submission error:', error);
    throw new Error(`SharePoint submission failed: ${error.message}`);
  }
};

// 准备学生申请数据
const prepareStudentItemData = (formData) => {
  return {
    __metadata: { 
      type: "SP.Data.LongCourseStudentApplicationDataListListItem" 
    },
    Title: `${formData.firstName || ''} ${formData.middleName || ''} ${formData.familyName || ''}`.trim(),
    StudentType: formData.studentType || '',
    FirstName: formData.firstName || '',
    MiddleName: formData.middleName || '',
    FamilyName: formData.familyName || '',
    Gender: formData.gender || '',
    PreferredName: formData.preferredName || '',
    DateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
    Email: formData.email || '',
    Birthplace: formData.birthplace || '',
    CountryOfBirth: formData.countryOfBirth || '',
    Nationality: formData.nationality || '',
    PassportNumber: formData.passportNumber || '',
    PassportExpiryDate: formData.passportExpiryDate ? new Date(formData.passportExpiryDate).toISOString() : null,
    VisaNumber: formData.visaNumber || '',
    VisaExpiryDate: formData.visaExpiryDate ? new Date(formData.visaExpiryDate).toISOString() : null,
    Country: formData.country || '',
    BuildingName: formData.buildingName || '',
    FlatDetails: formData.flatDetails || '',
    StreetNumber: formData.streetNumber || '',
    StreetName: formData.streetName || '',
    CityTownSuburb: formData.cityTownSuburb || '',
    State: formData.state || '',
    Postcode: formData.postcode || '',
    HomePhone: formData.homePhone || '',
    WorkPhone: formData.workPhone || '',
    MobilePhone: formData.mobilePhone || '',
    LanguageInHome: formData.languageInHome || '',
    IntakeYear: formData.intakeYear || '',
    Course: formData.course || '',
    PreferredStudyPeriod: formData.preferredStudyPeriod || '',
    SubmissionDate: new Date().toISOString(),
    Status: 'Submitted'
  };
};

// 准备中介申请数据
const prepareAgentItemData = (formData) => {
  return {
    __metadata: { 
      type: "SP.Data.NewAgentApplicationListListItem" 
    },
    Title: formData.agencyName || '',
    AgentApplicationId: formData.agentApplicationId || '',
    AgencyName: formData.agencyName || '',
    ContactPerson: formData.contactPerson || '',
    PrimaryEmail: formData.primaryEmail || '',
    AlternateEmail: formData.alternateEmail || '',
    Tel: formData.tel || '',
    Country: formData.country || '',
    Address: formData.address || '',
    CityTownSuburb: formData.cityTownSuburb || '',
    StateProvince: formData.stateProvince || '',
    Postcode: formData.postcode || '',
    ACN: formData.acn || '',
    ABN: formData.abn || '',
    TargetRecruitmentCountryPrimary: formData.targetRecruitmentCountry || '',
    SubmissionDate: new Date().toISOString(),
    Status: 'Submitted'
  };
};

// 上传附件到SharePoint列表项目
const uploadAttachments = async (siteUrl, listName, itemId, files, formDigestValue) => {
  const uploadPromises = files.map(async (file) => {
    const buffer = await fileToArrayBuffer(file);
    
    const response = await fetch(
      `${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})/AttachmentFiles/add(FileName='${encodeURIComponent(file.name)}')`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'X-RequestDigest': formDigestValue,
        },
        body: buffer,
        credentials: 'include'
      }
    );

    if (!response.ok) {
      console.error(`File upload failed: ${file.name}`);
      throw new Error(`File upload failed: ${file.name}`);
    }

    return response.json();
  });

  return Promise.all(uploadPromises);
};

// 文件转换为ArrayBuffer
const fileToArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// 获取列表项目（用于显示/管理目的）
export const getListItems = async () => {
  try {
    const siteUrl = SHAREPOINT_CONFIG.siteUrl;
    const listName = SHAREPOINT_CONFIG.listName;
    
    const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      headers: {
        'Accept': 'application/json;odata=verbose',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch list items');
    }

    const data = await response.json();
    return data.d.results;
  } catch (error) {
    console.error('Error getting list items:', error);
    throw error;
  }
};

// 测试是否能访问您的列表
fetch('https://origininstitute.sharepoint.com/sites/OriginInstituteAdministrationTeam/_api/web/lists(guid\'08d619d7-d12f-42c8-a0c9-e569e28e01a9\')', {
  headers: {
    'Accept': 'application/json;odata=verbose',
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('List connection successful:', data))
.catch(error => console.error('Connection failed:', error)); 