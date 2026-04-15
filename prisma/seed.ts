import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...\n");

  // Xóa dữ liệu cũ (theo thứ tự để tránh FK constraint)
  await prisma.starTransaction.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.checkinDetail.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goalLink.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.userStars.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // ==================== PHÒNG BAN ====================
  const deptSales = await prisma.department.create({ data: { name: "Kinh doanh" } });
  const deptTech = await prisma.department.create({ data: { name: "Công nghệ" } });
  const deptHR = await prisma.department.create({ data: { name: "Nhân sự" } });

  console.log("✅ Tạo phòng ban xong");

  // ==================== USERS ====================
  const hashedPw = await bcrypt.hash("123456", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@bvote.vn",
      name: "Trần Quản Trị",
      password: hashedPw,
      role: "ADMIN",
      departmentId: deptHR.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@bvote.vn",
      name: "Nguyễn Quản Lý",
      password: hashedPw,
      role: "MANAGER",
      departmentId: deptSales.id,
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      email: "nv1@bvote.vn",
      name: "Lê Nhân Viên",
      password: hashedPw,
      role: "EMPLOYEE",
      departmentId: deptSales.id,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      email: "nv2@bvote.vn",
      name: "Phạm Developer",
      password: hashedPw,
      role: "EMPLOYEE",
      departmentId: deptTech.id,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      email: "nv3@bvote.vn",
      name: "Hoàng Marketing",
      password: hashedPw,
      role: "EMPLOYEE",
      departmentId: deptSales.id,
    },
  });

  console.log("✅ Tạo users xong");

  // ==================== USER STARS ====================
  await prisma.userStars.createMany({
    data: [
      { userId: admin.id, totalStars: 50 },
      { userId: manager.id, totalStars: 35 },
      { userId: emp1.id, totalStars: 28 },
      { userId: emp2.id, totalStars: 42 },
      { userId: emp3.id, totalStars: 15 },
    ],
  });

  console.log("✅ Tạo user stars xong");

  // ==================== GOALS ====================
  const goalCompany = await prisma.goal.create({
    data: {
      title: "Tăng doanh thu Q2 lên 2 tỷ",
      description: "Mục tiêu doanh thu toàn công ty quý 2",
      metric: "Doanh thu",
      targetValue: 2000,
      currentValue: 1200,
      unit: "triệu VND",
      period: "QUARTER",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      ownerId: manager.id,
      isTransparent: true,
    },
  });

  const goalSales = await prisma.goal.create({
    data: {
      title: "Ký 15 hợp đồng mới",
      description: "Mục tiêu ký hợp đồng mới cho nhóm kinh doanh",
      metric: "Hợp đồng",
      targetValue: 15,
      currentValue: 8,
      unit: "hợp đồng",
      period: "QUARTER",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      ownerId: emp1.id,
    },
  });

  const goalDev = await prisma.goal.create({
    data: {
      title: "Hoàn thành MVP Bvote v1.0",
      description: "Phát triển và triển khai phiên bản MVP của hệ thống Bvote",
      metric: "Features",
      targetValue: 20,
      currentValue: 14,
      unit: "tính năng",
      period: "QUARTER",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      ownerId: emp2.id,
    },
  });

  const goalMkt = await prisma.goal.create({
    data: {
      title: "Tăng lượng khách hàng tiềm năng 200%",
      description: "Chạy chiến dịch marketing để tăng leads",
      metric: "Leads",
      targetValue: 500,
      currentValue: 180,
      unit: "leads",
      period: "MONTH",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-30"),
      ownerId: emp3.id,
    },
  });

  // Liên kết goals
  await prisma.goalLink.createMany({
    data: [
      { goalId: goalSales.id, parentGoalId: goalCompany.id },
      { goalId: goalMkt.id, parentGoalId: goalCompany.id },
    ],
  });

  // Milestones
  await prisma.milestone.createMany({
    data: [
      { goalId: goalSales.id, title: "5 hợp đồng đầu tiên", value: 5, starReward: 5, isReached: true },
      { goalId: goalSales.id, title: "10 hợp đồng", value: 10, starReward: 10, isReached: false },
      { goalId: goalSales.id, title: "15 hợp đồng - Mục tiêu", value: 15, starReward: 20, isReached: false },
      { goalId: goalDev.id, title: "10 tính năng core", value: 10, starReward: 8, isReached: true },
      { goalId: goalDev.id, title: "MVP hoàn chỉnh", value: 20, starReward: 15, isReached: false },
    ],
  });

  console.log("✅ Tạo goals + links + milestones xong");

  // ==================== CHECKINS ====================
  const checkin1 = await prisma.checkin.create({
    data: {
      goalId: goalSales.id,
      ownerId: emp1.id,
      managerId: manager.id,
      progressPct: 53,
      confidence: "MEDIUM",
      speed: "NORMAL",
      effort: "HIGH",
      status: "REVIEWED",
    },
  });

  await prisma.checkinDetail.create({
    data: {
      checkinId: checkin1.id,
      progressNote: "Đã ký được 8/15 hợp đồng. Đang theo 4 leads nóng.",
      issue: "Đối thủ cạnh tranh giảm giá mạnh, khách hàng đang so sánh.",
      cause: "Thiếu chương trình ưu đãi riêng cho khách VIP. Giá sản phẩm cao hơn 15% so với đối thủ.",
      solution: "Đề xuất gói combo có chiết khấu 10% cho khách VIP. Tập trung vào giá trị gia tăng như hỗ trợ sau bán hàng.",
    },
  });

  const checkin2 = await prisma.checkin.create({
    data: {
      goalId: goalDev.id,
      ownerId: emp2.id,
      progressPct: 70,
      confidence: "HIGH",
      speed: "FAST",
      effort: "HIGH",
      status: "PENDING",
    },
  });

  await prisma.checkinDetail.create({
    data: {
      checkinId: checkin2.id,
      progressNote: "Hoàn thành 14/20 features. Dashboard, Goals, Checkins đã xong cơ bản.",
      issue: "API response chậm khi load nhiều goals cùng lúc. Cần tối ưu query.",
      cause: "N+1 query problem khi include nhiều relations. Chưa implement caching.",
      solution: "Sử dụng select cụ thể thay vì include all. Thêm Redis cache cho dashboard stats.",
    },
  });

  const checkin3 = await prisma.checkin.create({
    data: {
      goalId: goalMkt.id,
      ownerId: emp3.id,
      managerId: manager.id,
      progressPct: 36,
      confidence: "LOW",
      speed: "SLOW",
      effort: "MEDIUM",
      status: "REVIEWED",
    },
  });

  await prisma.checkinDetail.create({
    data: {
      checkinId: checkin3.id,
      progressNote: "180/500 leads. Facebook Ads đang chạy nhưng CPL cao.",
      issue: "Cost per lead tăng 40% so với tháng trước. Chất lượng lead thấp.",
      cause: "Targeting audience quá rộng. Nội dung quảng cáo chưa đủ hấp dẫn để filter đúng đối tượng.",
      solution: "Thu hẹp audience, dùng lookalike từ khách hàng cũ. A/B test 3 bộ creative mới trong tuần tới.",
    },
  });

  console.log("✅ Tạo check-ins xong");

  // ==================== FEEDBACKS ====================
  await prisma.feedback.createMany({
    data: [
      {
        fromUserId: manager.id,
        toUserId: emp1.id,
        checkinId: checkin1.id,
        rating: 4,
        comments: "Anh Lê đang làm tốt, đặc biệt là khả năng phân tích đối thủ. Cần cải thiện tốc độ follow-up khách hàng.",
        type: "POSITIVE",
      },
      {
        fromUserId: manager.id,
        toUserId: emp3.id,
        checkinId: checkin3.id,
        rating: 3,
        comments: "Cần xem lại chiến lược quảng cáo. Nên tập trung vào quality hơn quantity. Đề xuất A/B test là hướng đi đúng.",
        type: "CONSTRUCTIVE",
      },
      {
        fromUserId: emp1.id,
        toUserId: emp2.id,
        rating: 5,
        comments: "Hệ thống Bvote mà anh Phạm đang phát triển rất xuất sắc! UI đẹp, tốc độ load nhanh. Keep it up!",
        type: "POSITIVE",
      },
      {
        fromUserId: emp2.id,
        toUserId: emp1.id,
        rating: 4,
        comments: "Anh Lê rất nhiệt tình hỗ trợ team dev hiểu requirements từ khách hàng. Feedback nhanh và rõ ràng.",
        type: "POSITIVE",
      },
    ],
  });

  console.log("✅ Tạo feedbacks xong");

  // ==================== REWARDS ====================
  await prisma.reward.createMany({
    data: [
      {
        name: "☕ Cốc cà phê Highlands",
        description: "Voucher 1 cốc cà phê tại Highlands Coffee",
        starCost: 10,
        quantity: 20,
        isActive: true,
      },
      {
        name: "🍔 Voucher ăn trưa 100K",
        description: "Voucher ăn trưa trị giá 100.000đ tại nhà hàng đối tác",
        starCost: 20,
        quantity: 15,
        isActive: true,
      },
      {
        name: "🎧 Tai nghe Bluetooth",
        description: "Tai nghe không dây chất lượng cao",
        starCost: 50,
        quantity: 5,
        isActive: true,
      },
      {
        name: "🏖️ Nghỉ phép thêm 1 ngày",
        description: "Thêm 1 ngày nghỉ phép có lương",
        starCost: 100,
        quantity: 3,
        isActive: true,
      },
      {
        name: "🎁 Quà tặng surprise",
        description: "Quà bất ngờ từ công ty dành cho nhân viên xuất sắc",
        starCost: 30,
        quantity: 10,
        isActive: true,
      },
    ],
  });

  console.log("✅ Tạo rewards xong");

  // ==================== STAR TRANSACTIONS ====================
  await prisma.starTransaction.createMany({
    data: [
      { userId: emp1.id, amount: 2, reason: "Hoàn thành check-in tuần", type: "EARNED" },
      { userId: emp1.id, amount: 3, reason: "Nhận feedback tích cực", type: "EARNED" },
      { userId: emp1.id, amount: 5, reason: "Đạt mốc 5 hợp đồng", type: "EARNED" },
      { userId: emp2.id, amount: 2, reason: "Hoàn thành check-in tuần", type: "EARNED" },
      { userId: emp2.id, amount: 8, reason: "Đạt mốc 10 tính năng core", type: "EARNED" },
      { userId: emp2.id, amount: 1, reason: "Gửi phản hồi cho đồng nghiệp", type: "EARNED" },
      { userId: emp3.id, amount: 2, reason: "Hoàn thành check-in tuần", type: "EARNED" },
      { userId: manager.id, amount: 1, reason: "Phản hồi check-in nhân viên", type: "EARNED" },
      { userId: manager.id, amount: 1, reason: "Phản hồi check-in nhân viên", type: "EARNED" },
    ],
  });

  console.log("✅ Tạo star transactions xong");

  console.log("\n🎉 Seed thành công! Dữ liệu demo đã sẵn sàng.");
  console.log("\n📋 Tài khoản demo:");
  console.log("  Admin:    admin@bvote.vn / 123456");
  console.log("  Manager:  manager@bvote.vn / 123456");
  console.log("  Employee: nv1@bvote.vn / 123456");
  console.log("  Employee: nv2@bvote.vn / 123456");
  console.log("  Employee: nv3@bvote.vn / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
