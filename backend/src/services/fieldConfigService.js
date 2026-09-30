const {
  OBJECT_NAMES,
  getFieldsForObject: getFieldsFallback,
  getQueryableFieldNames: getQueryableFallback,
  isValidObjectName,
} = require("../config/objects");

const db = require("../../../database/src/index");

// Object aur field config ke liye database ko prefer karta hai, aur static config fallback hai.
async function getObjectNames() {
  try {
    if (!db.isDatabaseConnected()) {
      return OBJECT_NAMES;
    }
    const names = await db.repositories.fieldConfigRepository.listObjectNames();
    return names.length ? names : OBJECT_NAMES;
  } catch {
    return OBJECT_NAMES;
  }
}

// Valid object ke fields database se laata hai; unavailable ya empty config par static fields deta hai.
async function getFieldsForObject(objectName) {
  if (!isValidObjectName(objectName)) {
    return null;
  }

  try {
    if (db.isDatabaseConnected()) {
      const fields =
        await db.repositories.fieldConfigRepository.getFieldsByObjectName(
          objectName,
        );
      if (fields.length) {
        return fields.map(({ apiName, label, type, requiredOnCreate }) => ({
          apiName,
          label,
          type,
          requiredOnCreate,
        }));
      }
    }
  } catch {
    // Database read fail ho to neeche static config se fields return honge.
  }

  return getFieldsFallback(objectName);
}

// SOQL query ke liye object fields ke saath Id aur Case ke liye CaseNumber bhi deta hai.
async function getQueryableFieldNames(objectName) {
  const fields = await getFieldsForObject(objectName);
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
  getObjectNames,
  getFieldsForObject,
  getQueryableFieldNames,
  isValidObjectName,
};
