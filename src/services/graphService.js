// Microsoft Graph API服务
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/authConfig';

// SharePoint站点和列表配置
const SHAREPOINT_CONFIG = {
  siteUrl: process.env.REACT_APP_SHAREPOINT_SITE_URL || "https://origininstitute.sharepoint.com/sites/OriginInstituteAdministrationTeam",
  listName: process.env.REACT_APP_SHAREPOINT_LIST_NAME || "Long Course Student Application Data List",
  listId: process.env.REACT_APP_SHAREPOINT_LIST_ID || "08d619d7-d12f-42c8-a0c9-e569e28e01a9",
  agentListName: process.env.REACT_APP_SHAREPOINT_AGENT_LIST_NAME || "New Agent Application List",
  agentListId: process.env.REACT_APP_SHAREPOINT_AGENT_LIST_ID || "e413dacf-63c7-4135-836d-82a8f5210dc3",
};

// 初始化MSAL实例
const msalInstance = new PublicClientApplication(msalConfig);

class GraphService {
  constructor() {
    this.accessToken = null;
  }

  // 登录并获取访问令牌
  async authenticate() {
    try {
      // 尝试静默获取令牌
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const silentRequest = {
          ...loginRequest,
          account: accounts[0]
        };
        
        try {
          const response = await msalInstance.acquireTokenSilent(silentRequest);
          this.accessToken = response.accessToken;
          return response;
        } catch (error) {
          console.log('Failed to get silent token, trying popup login');
        }
      }

      // 弹出登录
      const response = await msalInstance.loginPopup(loginRequest);
      this.accessToken = response.accessToken;
      return response;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  // 获取SharePoint站点信息
  async getSiteInfo(siteUrl) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const hostname = new URL(siteUrl).hostname;
    const sitePath = new URL(siteUrl).pathname;
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get site information');
    }

    return response.json();
  }

  // 获取SharePoint列表信息
  async getListInfo(siteId, listName) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$filter=displayName eq '${listName}'`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get list information');
    }

    const data = await response.json();
    return data.value[0];
  }

  // 创建列表项
  async createListItem(siteId, listId, itemData) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: itemData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create list item failed: ${errorText}`);
    }

    return response.json();
  }

  // 上传文件到SharePoint文档库
  async uploadFile(siteId, driveId, fileName, fileContent) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:/${fileName}:/content`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream'
        },
        body: fileContent
      }
    );

    if (!response.ok) {
      throw new Error(`File upload failed: ${fileName}`);
    }

    return response.json();
  }
}

export const graphService = new GraphService();

// 使用Graph API提交表单数据
export const submitToSharePointViaGraph = async (formData, files = []) => {
  try {
    // 身份验证
    await graphService.authenticate();

    // 获取站点信息
    const siteInfo = await graphService.getSiteInfo(SHAREPOINT_CONFIG.siteUrl);
    const siteId = siteInfo.id;

    // 确定要使用的列表
    const listName = formData.formType === 'agent-application' 
      ? SHAREPOINT_CONFIG.agentListName 
      : SHAREPOINT_CONFIG.listName;

    // 获取列表信息
    const listInfo = await graphService.getListInfo(siteId, listName);
    const listId = listInfo.id;

    // 准备数据
    const itemData = formData.formType === 'agent-application' 
      ? prepareAgentGraphData(formData)
      : prepareStudentGraphData(formData);

    // 创建列表项
    const listItem = await graphService.createListItem(siteId, listId, itemData);

    // 处理文件上传（如果有文件）
    let uploadedFiles = [];
    if (files.length > 0) {
      // 获取默认文档库
      const drivesResponse = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
        {
          headers: {
            'Authorization': `Bearer ${graphService.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const drives = await drivesResponse.json();
      const defaultDrive = drives.value.find(drive => drive.name === 'Documents');
      
      if (defaultDrive) {
        for (const file of files) {
          const arrayBuffer = await fileToArrayBuffer(file);
          const fileName = `${listItem.id}_${file.name}`;
          const uploadResult = await graphService.uploadFile(
            siteId, 
            defaultDrive.id, 
            fileName, 
            arrayBuffer
          );
          uploadedFiles.push(uploadResult);
        }
      }
    }

    return {
      success: true,
      message: 'Submitted to SharePoint list!',
      data: {
        id: listItem.id,
        submittedAt: new Date().toISOString(),
        status: 'processed',
        sharePointItemId: listItem.id,
        uploadedFiles: uploadedFiles
      }
    };

  } catch (error) {
    console.error('Graph API submission error:', error);
    throw new Error(`SharePoint submission failed: ${error.message}`);
  }
};

// 为Graph API准备学生数据
const prepareStudentGraphData = (formData) => {
  return {
    Title: `${formData.firstName || ''} ${formData.middleName || ''} ${formData.familyName || ''}`.trim(),
    StudentType: formData.studentType || '',
    FirstName: formData.firstName || '',
    MiddleName: formData.middleName || '',
    FamilyName: formData.familyName || '',
    Gender: formData.gender || '',
    PreferredName: formData.preferredName || '',
    DateOfBirth: formData.dateOfBirth || '',
    Email: formData.email || '',
    Birthplace: formData.birthplace || '',
    CountryOfBirth: formData.countryOfBirth || '',
    Nationality: formData.nationality || '',
    PassportNumber: formData.passportNumber || '',
    PassportExpiryDate: formData.passportExpiryDate || '',
    VisaNumber: formData.visaNumber || '',
    VisaExpiryDate: formData.visaExpiryDate || '',
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
    Status: '已提交'
  };
};

// 为Graph API准备中介数据
const prepareAgentGraphData = (formData) => {
  return {
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
    Status: '已提交'
  };
};

// 工具函数：文件转ArrayBuffer
const fileToArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}; 