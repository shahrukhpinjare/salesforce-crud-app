const { mongoose } = require("../connection");

// Salesforce objects ki field configuration database mein store karne ka schema.
const OBJECT_NAMES = ["Account", "Opportunity", "Lead", "Contact", "Case"];

const objectFieldConfigSchema = new mongoose.Schema(
  {
    // Field kis supported Salesforce object ka hai; index se object lookup fast hota hai.
    objectName: {
      type: String,
      required: true,
      enum: OBJECT_NAMES,
      index: true,
    },
    // Salesforce API field name aur UI mein dikhne wala label.
    fieldApiName: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    // Field ka data type; unknown type na diya ho to string default hota hai.
    fieldType: {
      type: String,
      required: true,
      enum: ["string", "number", "date", "boolean", "picklist"],
      default: "string",
    },
    // UI field order aur record create karte waqt field required hai ya nahi.
    sortOrder: { type: Number, required: true, default: 0 },
    requiredOnCreate: { type: Boolean, default: false },
  },
  // Har document ke create/update time ko automatically track karta hai.
  { timestamps: true },
);

// Ek object mein ek API field ki duplicate configuration ko rokta hai.
objectFieldConfigSchema.index(
  { objectName: 1, fieldApiName: 1 },
  { unique: true },
);

// Existing Mongoose model reuse hota hai; warna naya ObjectFieldConfig model banta hai.
const ObjectFieldConfig =
  mongoose.models.ObjectFieldConfig ||
  mongoose.model("ObjectFieldConfig", objectFieldConfigSchema);

module.exports = ObjectFieldConfig;
