const {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  mongoose,
} = require("./connection");
const User = require("./models/User");
const OAuthToken = require("./models/OAuthToken");
const ObjectFieldConfig = require("./models/ObjectFieldConfig");
const AuditLog = require("./models/AuditLog");
const oauthTokenRepository = require("./repositories/oauthTokenRepository");
const fieldConfigRepository = require("./repositories/fieldConfigRepository");
const userRepository = require("./repositories/userRepository");
const auditLogRepository = require("./repositories/auditLogRepository");
const { seedFieldConfigs } = require("./seed/seedFieldConfigs");
const { OBJECT_NAMES, OBJECT_FIELD_CONFIG } = require("./seed/fieldConfigData");

// Database ke connection tools, models, repositories aur seed data ka central export point.
module.exports = {
  // MongoDB connect/disconnect aur connection status check karne ke helpers.
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  mongoose,
  // Database collections ke Mongoose models.
  models: {
    User,
    OAuthToken,
    ObjectFieldConfig,
    AuditLog,
  },
  // Models par common database operations chalane wale repositories.
  repositories: {
    oauthTokenRepository,
    fieldConfigRepository,
    userRepository,
    auditLogRepository,
  },
  // Default Salesforce field configs seed karne aur unka data access karne ke exports.
  seed: {
    seedFieldConfigs,
    OBJECT_NAMES,
    OBJECT_FIELD_CONFIG,
  },
};
