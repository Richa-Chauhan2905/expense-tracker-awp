import bcrypt from "bcrypt";

import User from "../models/user.model.js";

export const seedAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@expenzo.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "Expenzo Admin";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (!existingAdmin.isAdmin) {
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
    }
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await User.create({
    fullName: adminName,
    email: adminEmail,
    password: hashedPassword,
    currencyPreference: "INR",
    isAdmin: true,
  });

  console.log(`Seeded admin user: ${adminEmail}`);
};
