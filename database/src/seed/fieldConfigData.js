// Supported Salesforce objects aur unke default fields ki seed configuration.
const OBJECT_NAMES = ["Account", "Opportunity", "Lead", "Contact", "Case"];

const OBJECT_FIELD_CONFIG = {
  // Har field mein Salesforce API name, UI label, data type aur create par required status hai.
  // Company/account ki basic details.
  Account: [
    {
      apiName: "Name",
      label: "Account Name",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "Industry",
      label: "Industry",
      type: "string",
      requiredOnCreate: false,
    },
    { apiName: "Type", label: "Type", type: "string", requiredOnCreate: false },
    {
      apiName: "Phone",
      label: "Phone",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Website",
      label: "Website",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "BillingCity",
      label: "Billing City",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "NumberOfEmployees",
      label: "Employees",
      type: "number",
      requiredOnCreate: false,
    },
  ],
  // Sales opportunity ki details aur required stage/close date.
  Opportunity: [
    {
      apiName: "Name",
      label: "Opportunity Name",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "StageName",
      label: "Stage",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "CloseDate",
      label: "Close Date",
      type: "date",
      requiredOnCreate: true,
    },
    {
      apiName: "Amount",
      label: "Amount",
      type: "number",
      requiredOnCreate: false,
    },
    { apiName: "Type", label: "Type", type: "string", requiredOnCreate: false },
    {
      apiName: "Probability",
      label: "Probability (%)",
      type: "number",
      requiredOnCreate: false,
    },
    {
      apiName: "LeadSource",
      label: "Lead Source",
      type: "string",
      requiredOnCreate: false,
    },
  ],
  // Potential customer ki contact aur company details.
  Lead: [
    {
      apiName: "FirstName",
      label: "First Name",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "LastName",
      label: "Last Name",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "Company",
      label: "Company",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "Status",
      label: "Status",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Email",
      label: "Email",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Phone",
      label: "Phone",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "LeadSource",
      label: "Lead Source",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Industry",
      label: "Industry",
      type: "string",
      requiredOnCreate: false,
    },
  ],
  // Existing customer/contact ki personal aur work details.
  Contact: [
    {
      apiName: "FirstName",
      label: "First Name",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "LastName",
      label: "Last Name",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "Email",
      label: "Email",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Phone",
      label: "Phone",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Title",
      label: "Title",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Department",
      label: "Department",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "MailingCity",
      label: "Mailing City",
      type: "string",
      requiredOnCreate: false,
    },
  ],
  // Customer support case ki subject, status aur priority details.
  Case: [
    {
      apiName: "Subject",
      label: "Subject",
      type: "string",
      requiredOnCreate: true,
    },
    {
      apiName: "Status",
      label: "Status",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Priority",
      label: "Priority",
      type: "string",
      requiredOnCreate: false,
    },
    {
      apiName: "Origin",
      label: "Case Origin",
      type: "string",
      requiredOnCreate: false,
    },
    { apiName: "Type", label: "Type", type: "string", requiredOnCreate: false },
    {
      apiName: "Reason",
      label: "Case Reason",
      type: "string",
      requiredOnCreate: false,
    },
  ],
};

// Object names aur field config ko seed/service modules ke liye export karta hai.
module.exports = {
  OBJECT_NAMES,
  OBJECT_FIELD_CONFIG,
};
