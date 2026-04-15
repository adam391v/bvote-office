const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function seed() {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash("Bvote@2026", 10);

  const dept1 = await prisma.department.create({ data: { name: "Ban Giám đốc" } });
  const dept2 = await prisma.department.create({ data: { name: "Phòng Nhân sự" } });
  const dept3 = await prisma.department.create({ data: { name: "Phòng Kỹ thuật" } });

  const admin = await prisma.user.create({
    data: { email: "admin@bvote.vn", name: "Admin Bvote", password: hash, role: "ADMIN", departmentId: dept1.id },
  });
  const manager = await prisma.user.create({
    data: { email: "manager@bvote.vn", name: "Quản lý Bvote", password: hash, role: "MANAGER", departmentId: dept2.id },
  });
  const staff = await prisma.user.create({
    data: { email: "staff@bvote.vn", name: "Nhân viên Bvote", password: hash, role: "EMPLOYEE", departmentId: dept3.id },
  });

  await prisma.userStars.createMany({
    data: [
      { userId: admin.id, totalStars: 0 },
      { userId: manager.id, totalStars: 0 },
      { userId: staff.id, totalStars: 0 },
    ],
  });

  console.log("Seed thanh cong!");
  console.log("Admin:", admin.email);
  console.log("Manager:", manager.email);
  console.log("Staff:", staff.email);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
