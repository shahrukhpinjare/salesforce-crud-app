// Salesforce ke supported objects aur unke fields ki configuration yahan hai.
// Is config se app object validate karke fields aur query ke liye names nikalta hai.
const OBJECT_NAMES = ["Account", "Opportunity", "Lead", "Contact", "Case"];

// Har object ke fields ka API name, UI label, data type aur create par required status.
const OBJECT_FIELD_CONFIG = {
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

// Check karta hai ki diya gaya Salesforce object supported list mein hai ya nahi.
function isValidObjectName(name) {
  return OBJECT_NAMES.includes(name);
}

// Valid object ke configured fields deta hai; invalid object ke liye null.
function getFieldsForObject(objectName) {
  if (!isValidObjectName(objectName)) {
    return null;
  }
  return OBJECT_FIELD_CONFIG[objectName];
}

// Query mein use hone wale field names deta hai; har object mein Id aur Case mein CaseNumber bhi hota hai.
function getQueryableFieldNames(objectName) {
  const fields = getFieldsForObject(objectName);
  if (!fields) return null;
  const names = new Set(["Id"]);
  if (objectName === "Case") {
    names.add("CaseNumber");
  }
  for (const f of fields) {
    names.add(f.apiName);
  }
  return [...names];
}

module.exports = {
  OBJECT_NAMES,
  OBJECT_FIELD_CONFIG,
  isValidObjectName,
  getFieldsForObject,
  getQueryableFieldNames,
};
