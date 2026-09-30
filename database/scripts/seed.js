const path = require("path");
// Pehle database/.env, phir backend/.env load hoti hai; duplicate values mein pehli value bani rehti hai.
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

const { connectDatabase, disconnectDatabase, seed } = require("../src/index");

// MongoDB se connect karke Salesforce object field configurations seed karta hai.
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Connection URI na mile to script ko error ke saath rokta hai.
    console.error("Set MONGODB_URI in database/.env or backend/.env");
    process.exit(1);
  }

  await connectDatabase(uri);
  // Default field configs ko database mein insert ya update karke connection band karta hai.
  const result = await seed.seedFieldConfigs();
  console.log(
    `Field config seed complete (${result.upserted} documents upserted).`,
  );
  await disconnectDatabase();
}

// Seeding ke dauran koi error aaye to use log karke process ko failure status deta hai.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
