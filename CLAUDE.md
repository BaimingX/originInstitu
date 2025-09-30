# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-portal React application system for educational institutions, supporting both direct student applications and agent-mediated submissions. The application uses a state-based navigation system (no routing library) and integrates with SharePoint/Power Automate for backend services.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not recommended)
npm run eject
```

## Architecture Overview

### Navigation System
- **No routing library**: Uses React `useState` for page navigation via `App.js:10`
- **Pages managed by state**: `currentPage` state controls which component renders
- **Navigation flow**: HomePage → AgentPage → Forms
- **Limitation**: URLs don't change, browser back/forward buttons don't work

### Key Application States
- `home`: HomePage (portal selection)
- `student-form`: Direct student application
- `agent`: Agent portal navigation
- `agent-student-form`: Agent-mediated student application
- `new-agent`: Agent registration form

### Backend Integration Options

The application supports three backend integration modes:

1. **Power Automate Flows** (Primary): Configured via environment variables
   - Student flow: `REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL`
   - Agent flow: `REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL`

2. **SharePoint REST API** (Alternative): Direct SharePoint integration
   - Site URL: `REACT_APP_SHAREPOINT_SITE_URL`
   - Lists: Student and Agent application lists with predefined IDs

3. **Mock API** (Development): Fallback when no backend is configured

### Form System Architecture

- **PersonalInfoForm**: Student applications with conditional agent code field
- **AgentApplicationForm**: Agent registration with business details
- **File Upload**: Categorized upload system with validation
- **Form Validation**: Uses react-hook-form with custom validation rules in `src/utils/validation.js`

### Service Layer

- `useFormSubmit.js`: Central form submission logic with backend selection
- `sharePointService.js`: SharePoint REST API integration
- `powerAutomateService.js`: Power Automate flow integration
- `authService.js`: MSAL authentication (optional)
- `mockApi.js`: Development/testing API

## Configuration

### Environment Setup
Copy `SharePoint-Config.env` to `.env` and configure:
- SharePoint site URLs and list IDs
- Power Automate flow URLs
- Azure AD settings (if using authentication)

### Required SharePoint Lists
- **Student Applications**: "Long Course Student Application Data List" (ID: 08d619d7-d12f-42c8-a0c9-e569e28e01a9)
- **Agent Applications**: "New Agent Application List" (ID: e413dacf-63c7-4135-836d-82a8f5210dc3)

### File Upload Configuration
- **Current**: Supports PDF, DOC, DOCX, JPG, PNG (max 10MB)
- **Note**: Per README, forms should only accept PDF files (pending implementation)

## Known Issues & Technical Debt

1. **Routing**: No URL-based navigation - consider adding react-router-dom
2. **Agent ID Linkage**: Agent application ID not connected to student form agent codes
3. **File Types**: PDF-only requirement not fully implemented
4. **Form Configuration**: Hard-coded validation rules need centralization

## Key Files for Development

- `src/App.js`: Main application router and state management
- `src/components/HomePage.js`: Portal selection interface
- `src/components/AgentPage.js`: Agent-specific navigation
- `src/utils/validation.js`: Form field definitions and validation rules
- `src/hooks/useFormSubmit.js`: Form submission logic with backend switching
- `src/services/`: Backend integration services
- `tailwind.config.js`: Custom color scheme configuration

## Testing

- Uses React Testing Library
- No specific test commands beyond `npm test`
- Mock API available for development testing without backend dependencies

## Deployment Notes

- Built for Azure Static Web Apps deployment
- Requires SharePoint Online access for production
- Power Automate premium license recommended for full functionality
- All sensitive configuration should be in environment variables, not committed to code