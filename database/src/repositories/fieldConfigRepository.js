const ObjectFieldConfig = require("../models/ObjectFieldConfig");
const { OBJECT_NAMES } = require("../seed/fieldConfigData");

// Database document ko backend ke expected field format mein convert karta hai.
function mapFieldDoc(doc) {
  return {
    apiName: doc.fieldApiName,
    label: doc.label,
    type: doc.fieldType,
    requiredOnCreate: doc.requiredOnCreate,
    sortOrder: doc.sortOrder,
  };
}

// Database se configured objects nikalta hai; config empty ho to default list deta hai.
async function listObjectNames() {
  const distinct = await ObjectFieldConfig.distinct("objectName");
  if (distinct.length === 0) {
    return OBJECT_NAMES;
  }
  return OBJECT_NAMES.filter((name) => distinct.includes(name));
}

// Object ke fields sort order ke hisaab se laakar simple objects mein map karta hai.
async function getFieldsByObjectName(objectName) {
  const docs = await ObjectFieldConfig.find({ objectName })
    .sort({ sortOrder: 1 })
    .lean();
  return docs.map(mapFieldDoc);
}

// Diye gaye object ke total configured fields count karta hai.
async function countByObjectName(objectName) {
  return ObjectFieldConfig.countDocuments({ objectName });
}

// Repository methods ko service aur doosre modules ke liye export karta hai.
module.exports = {
  listObjectNames,
  getFieldsByObjectName,
  countByObjectName,
  mapFieldDoc,
};
