// SharePoint Configuration Example
// Copy this file to sharepoint.config.js and update with your actual values

export const SHAREPOINT_CONFIG = {
  // Your SharePoint site URL
  siteUrl: "https://yourcompany.sharepoint.com/sites/yoursite",
  
  // Your SharePoint list name (the list you created)
  listName: "Personal Information Applications",
  
  // Optional: Direct list ID (can be found in SharePoint list settings)
  listId: "your-list-id-here",
  
  // List columns mapping (make sure these match your SharePoint list columns)
  columns: {
    title: "Title",
    firstName: "FirstName", 
    lastName: "LastName",
    email: "Email",
    phone: "PhoneNumber",
    address: "Address", 
    notes: "Notes",
    submissionDate: "SubmissionDate",
    status: "Status"
  }
};

// Note: To use this configuration:
// 1. Copy this file to sharepoint.config.js
// 2. Update the values with your actual SharePoint information
// 3. Set the environment variables in your .env file:
//    REACT_APP_SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/yoursite
//    REACT_APP_SHAREPOINT_LIST_NAME=Personal Information Applications 