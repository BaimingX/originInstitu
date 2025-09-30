# Student & Agent Application System

A comprehensive React-based dual-portal application system for educational institutions, supporting both direct student applications and agent-mediated submissions. The system features modern UI design, robust file handling, and flexible backend integration options.

## ✨ Key Features

- 🎓 **Dual Portal System**: Separate interfaces for direct student applications and agent-mediated submissions
- 📝 **Comprehensive Forms**: Detailed student applications and agent registration forms
- 📁 **Advanced File Upload**: Categorized file upload with drag-and-drop support
- ✅ **Real-time Validation**: Form validation with immediate feedback
- 🔐 **Azure AD Integration**: Microsoft MSAL authentication support
- 🚀 **Multiple Backend Options**: Power Automate, SharePoint REST API, and mock API
- 🎨 **Modern UI**: Tailwind CSS with responsive design
- 🔔 **Smart Notifications**: React Hot Toast integration
- 📱 **Mobile Responsive**: Optimized for all device sizes

## 🛠 Tech Stack

- **Frontend Framework**: React 19.1.0
- **Authentication**: Microsoft MSAL Browser & React
- **Form Management**: React Hook Form 7.58.1
- **UI Framework**: Tailwind CSS 3.4.17
- **File Upload**: React Dropzone 14.3.8
- **Notifications**: React Hot Toast 2.5.2
- **Icons**: Lucide React 0.516.0
- **Testing**: React Testing Library

## ⚠️ Technical Limitations

### Routing System
- **Current Implementation**: Uses React state management (`useState`) for page navigation instead of a proper routing library
- **Impact**: 
  - URL remains unchanged during page navigation (always shows root path `/`)
  - Browser back/forward buttons don't work as expected
  - Page refresh returns to homepage
  - Direct URL access to specific pages not supported
  - Not SEO-friendly
- **Recommended Enhancement**: Add `react-router-dom` for proper URL-based routing
- **Priority**: High for production deployment

### Planned Improvements
- [ ] Implement React Router for proper URL management
- [ ] Add URL-based navigation with browser history support
- [ ] Enable deep linking to specific application forms
- [ ] Improve SEO compatibility

## 📁 Project Architecture

```
src/
├── components/
│   ├── HomePage.js                 # Main portal selection page
│   ├── AgentPage.js               # Agent portal navigation
│   ├── FormComponents/
│   │   ├── PersonalInfoForm.js     # Student application form
│   │   ├── AgentApplicationForm.js # Agent registration form
│   │   ├── FileUpload.js          # Advanced file upload component
│   │   ├── SimpleFileUpload.js    # Simplified file upload for agents
│   │   ├── FormField.js           # Reusable form field component
│   │   └── SubmitButton.js        # Smart submit button with status
│   ├── Auth/
│   │   └── LoginButton.js         # MSAL authentication component
│   └── UI/
│       ├── ErrorMessage.js        # Error display component
│       └── LoadingSpinner.js      # Loading indicator
├── hooks/
│   └── useFormSubmit.js           # Form submission logic with backend selection
├── services/
│   ├── powerAutomateService.js    # Power Automate flow integration
│   ├── sharePointService.js       # SharePoint REST API service
│   ├── authService.js             # MSAL authentication service
│   ├── graphService.js            # Microsoft Graph API integration
│   └── mockApi.js                 # Development/testing API
├── utils/
│   ├── validation.js              # Form validation rules and field definitions
│   └── fileHelpers.js             # File processing and validation utilities
├── config/
│   ├── api.js                     # API configuration
│   └── authConfig.js              # MSAL authentication configuration
└── App.js                         # Main application router
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- SharePoint Online access (for production)
- Power Automate premium license (recommended)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd applicaiton_form
npm install
```

2. **Environment Configuration:**
```bash
# Copy the configuration template
cp SharePoint-Config.env .env

# Edit .env with your settings
REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL=your_student_flow_url
REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL=your_agent_flow_url
REACT_APP_SHAREPOINT_SITE_URL=your_sharepoint_site_url
```

3. **Start development server:**
```bash
npm start
```

4. **Build for production:**
```bash
npm run build
```

## 🔧 Backend Integration Options

### Option 1: Power Automate (Recommended)
- **Student Flow**: Processes student applications and saves to SharePoint
- **Agent Flow**: Handles agent registrations and document uploads
- **Benefits**: Visual workflow design, automatic approvals, email notifications

### Option 2: SharePoint REST API
- **Direct Integration**: REST API calls to SharePoint Lists
- **Authentication**: Uses included credentials or Azure AD
- **Benefits**: Direct control, no additional licensing

### Option 3: Mock API
- **Development Mode**: Simulates backend for testing
- **Benefits**: No external dependencies, immediate feedback

## 📋 Application Forms

### Student Application Form
**Complete personal information collection:**
- Personal Details (Name, Gender, Date of Birth, Email)
- Birth & Nationality Information
- Passport & Visa Details
- Australian Address Information
- Contact Information (Mobile, Home, Work)
- Language & Course Preferences
- Academic Background

**File Requirements:**
- Photo ID (Passport, Driver's License)
- Residency/Visa Proof Documents
- Supported formats: PDF, DOC, DOCX, JPG, PNG
- Maximum: 10MB per file, up to 10 files

### Agent Application Form
**Comprehensive agency registration:**
- Agency Information (Name, Contact Person, Phone)
- Email Contacts (Primary & Alternate)
- Full Address Details
- Business Registration (ACN/ABN numbers)
- Target Recruitment Country
- Agency Profile Documents

**File Requirements:**
- Agency profile and introduction materials
- Business registration certificates
- Marketing materials and credentials
- Supported formats: PDF, DOC, DOCX, JPG, PNG
- Maximum: 10MB per file, up to 5 files

## 🔒 Security Features

- **Microsoft Authentication**: MSAL integration for secure login
- **File Validation**: Client-side file type and size validation
- **Data Sanitization**: Form data validation and sanitization
- **Secure Transmission**: HTTPS enforcement for all API calls

## 🌐 Deployment

### Azure Static Web Apps (Recommended)
```bash
# Build the application
npm run build

# Deploy to Azure Static Web Apps
# Configure in Azure portal with:
# - Build preset: React
# - App location: /
# - Build location: build
```

### Custom Deployment
```bash
# Build for production
npm run build

# Deploy the 'build' folder to your web server
# Ensure proper routing for SPA
```

## ⚙️ Configuration

### Environment Variables
```env
# Power Automate Flows
REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL=
REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL=

# SharePoint Configuration
REACT_APP_SHAREPOINT_SITE_URL=
REACT_APP_SHAREPOINT_LIST_NAME=
REACT_APP_SHAREPOINT_AGENT_LIST_NAME=

# Azure AD (if using authentication)
REACT_APP_CLIENT_ID=
REACT_APP_AUTHORITY=
```

### Tailwind CSS Customization
Custom color scheme defined in `tailwind.config.js`:
- Primary Blue: `#3B82F6`
- Success Green: `#10B981`
- Error Red: `#EF4444`
- Custom gray variations

## 🧪 Development & Testing

### Available Scripts
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

### Testing Checklist
- [ ] Form validation on all required fields
- [ ] File upload functionality with drag-and-drop
- [ ] Backend integration (Power Automate/SharePoint)
- [ ] Responsive design on mobile devices
- [ ] Cross-browser compatibility
- [ ] Authentication flow (if enabled)

## 🔍 Troubleshooting

### Common Issues

**Power Automate Flow Not Triggered:**
- Verify flow URL in environment variables
- Check flow permissions and activation status
- Monitor flow run history in Power Automate

**File Upload Failures:**
- Confirm file size limits (10MB max)
- Verify supported file formats
- Check browser console for errors

**SharePoint Authentication Issues:**
- Verify site permissions
- Check CORS settings
- Ensure proper authentication configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code style and conventions
4. Add tests for new functionality
5. Submit a pull request

## 📋 Pending Improvements

### 🔄 Content & Business Requirements
- **Form Content Review**: All form fields and validation rules need to be finalized with Tiffany
  - Student application form fields verification
  - Agent application form requirements confirmation
  - Validation rules and error messages review
  - Field labels and descriptions finalization

### 📁 File Upload System Enhancements
- **PDF-Only File Support**: Currently all application forms should only accept PDF files
  - **Impact**: This change affects both student and agent application forms
  - **Required Actions**:
    - Update file validation logic to accept only PDF format
    - Modify Power Automate flow configurations to handle PDF-only uploads
    - Update SharePoint document libraries to optimize for PDF storage
    - Revise user interface to reflect PDF-only requirement
  - **Dependencies**: Power Automate flow reconfiguration required
  - **Priority**: High - affects user experience and backend processing

### 🔗 Data Integration Issues
- **Agent ID Linkage Problem**: Agent Application ID is not properly connected to Agent Code in agent student application forms
  - **Current Issue**: When an agent registers, their application ID doesn't automatically populate in the agent code field of student applications submitted through that agent
  - **Impact**: 
    - Manual agent code entry required for student applications
    - Potential data inconsistency between agent registrations and student applications
    - Difficulty tracking which students are associated with which agents
  - **Required Actions**:
    - Implement automatic agent code generation upon agent registration
    - Create agent code dropdown/selection in student application forms
    - Establish data relationship between agent applications and student applications
    - Update Power Automate flows to handle agent-student relationship data
  - **Priority**: Medium - affects data integrity and user experience for agent workflows

### 🔧 Technical Debt
- **Form Field Configuration**: Dynamic form field configuration system needed
- **File Type Management**: Centralized file type validation system
- **Power Automate Integration**: Enhanced error handling and retry mechanisms

### 📝 Documentation Updates
- [ ] Update file upload documentation to reflect PDF-only policy
- [ ] Create Power Automate configuration guide for PDF handling
- [ ] Document form field validation rules
- [ ] Update user guides with current form requirements

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review configuration documentation
- Contact your system administrator for SharePoint/Power Automate access

---

**Note**: This application requires proper backend configuration (Power Automate or SharePoint) for production use. The mock API is provided for development and testing purposes only.
