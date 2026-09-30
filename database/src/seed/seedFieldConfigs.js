const ObjectFieldConfig = require("../models/ObjectFieldConfig");
const { OBJECT_NAMES, OBJECT_FIELD_CONFIG } = require("./fieldConfigData");

// Default field configs ko MongoDB mein bulk upsert karne wala seed function.
async function seedFieldConfigs() {
  const ops = [];

  // Har supported object ke liye uske configured fields par database operations banata hai.
  for (const objectName of OBJECT_NAMES) {
    const fields = OBJECT_FIELD_CONFIG[objectName] || [];
    fields.forEach((field, index) => {
      ops.push({
        updateOne: {
          // Object aur API name se existing config dhoondh kar update ya insert karta hai.
          filter: { objectName, fieldApiName: field.apiName },
          update: {
            $set: {
              objectName,
              fieldApiName: field.apiName,
              label: field.label,
              fieldType: field.type,
              requiredOnCreate: Boolean(field.requiredOnCreate),
              // Array ka index UI mein fields ka display order set karta hai.
              sortOrder: index,
            },
          },
          upsert: true,
        },
      });
    });
  }

  // Seed data empty ho to database bulk operation chalane ki zaroorat nahi.
  if (ops.length === 0) {
    return { upserted: 0 };
  }

  // Ek hi bulk call mein sab changes apply karke insert/update count return karta hai.
  const result = await ObjectFieldConfig.bulkWrite(ops);
  return {
    upserted: result.upsertedCount + result.modifiedCount,
  };
}

module.exports = {
  seedFieldConfigs,
};
