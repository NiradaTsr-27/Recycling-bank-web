const { PrismaClient } = require("@prisma/client"); 
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  const defaultPassword = await bcrypt.hash("123456", 10);

  //////////////////////////////////////////////////////
  // ADMIN + ACCOUNT
  //////////////////////////////////////////////////////
  const adminAccount = await prisma.account.create({
    data: {
      username: "admin",
      email: "admin@gmail.com",
      password: defaultPassword,
      admin: {
        create: {
          nationalId: "1111111111111",
          firstName: "Warang",
          lastName: "Mabo",
        },
      },
    },
  });

  //////////////////////////////////////////////////////
  // ORGANIZATION
  //////////////////////////////////////////////////////
  const organization = await prisma.organization.create({
    data: {
      name: "ธนาคารขยะชุมชนหนองหาน",
      subDistrict: "หนองหาน",
      district: "หนองหาน",
      province: "อุดรธานี",
      postalCode: "41130",
      phone: "0420000000",
    },
  });

  //////////////////////////////////////////////////////
  // EMPLOYEES
  //////////////////////////////////////////////////////
  const employeesData = [
    ["สมชาย", "ใจดี"],
    ["วิชัย", "บุญช่วย"],
    ["ประยุทธ", "ทองสุข"],
    ["อนันต์", "ศรีสวัสดิ์"],
    ["ธนพล", "มีสุข"],
    ["สุชาติ", "สุขใจ"],
    ["มนตรี", "บุญมาก"],
    ["ชาญชัย", "ดีงาม"],
    ["ประเสริฐ", "คำดี"],
    ["กิตติ", "พูนทรัพย์"],
  ];

  const employees = [];

  for (let i = 0; i < employeesData.length; i++) {
    const emp = await prisma.account.create({
      data: {
        username: `employee${i + 1}`,
        email: `employee${i + 1}@gmail.com`,
        password: defaultPassword,
        employee: {
          create: {
            nationalId: `22222222222${i}`,
            firstName: employeesData[i][0],
            lastName: employeesData[i][1],
            phone: `081111111${i}`,
            houseNo: `${i + 10}`,
            village: "หมู่ 2",
            subDistrict: "หนองหาน",
            district: "หนองหาน",
            province: "อุดรธานี",
            postalCode: "41130",
            organizationId: organization.id,
          },
        },
      },
      include: { employee: true },
    });

    employees.push(emp.employee);
  }

  //////////////////////////////////////////////////////
  // MEMBERS + WALLET
  //////////////////////////////////////////////////////
  const membersData = [
    ["สมหญิง", "รักสะอาด"],
    ["สายฝน", "บุญมี"],
    ["อรทัย", "สุขดี"],
    ["ปวีณา", "คำแก้ว"],
    ["วิไล", "จันทร์ดี"],
    ["รัตนา", "ศรีสุข"],
    ["จินตนา", "ใจงาม"],
    ["สุพัตรา", "บุญรอด"],
    ["กมล", "คำสิงห์"],
    ["ศิริพร", "ดีมาก"],
  ];

  const members = [];

  for (let i = 0; i < membersData.length; i++) {
    const mem = await prisma.account.create({
      data: {
        username: `member${i + 1}`,
        email: `member${i + 1}@gmail.com`,
        password: defaultPassword,
        member: {
          create: {
            nationalId: `33333333333${i}`,
            firstName: membersData[i][0],
            lastName: membersData[i][1],
            phone: `089999999${i}`,
            houseNo: `${i + 10}`,
            village: "หมู่ 2",
            subDistrict: "หนองหาน",
            district: "หนองหาน",
            province: "อุดรธานี",
            postalCode: "41130",
            wallet: { create: { balance: 0 } },
          },
        },
      },
      include: { member: { include: { wallet: true } } },
    });

    members.push(mem.member);
  }

  //////////////////////////////////////////////////////
  // RECYCLE CATEGORY & WASTE TYPES
  //////////////////////////////////////////////////////
  const metalCategory = await prisma.recycleCategory.create({ data: { name: "โลหะ" } });
  const plasticCategory = await prisma.recycleCategory.create({ data: { name: "พลาสติก" } });
  const paperCategory = await prisma.recycleCategory.create({ data: { name: "กระดาษ" } });

  const wasteTypesData = [
    { name: "กระป๋องอลูมิเนียม", price: 15, unit: "กก.", categoryId: metalCategory.id },
    { name: "เหล็ก", price: 8, unit: "กก.", categoryId: metalCategory.id },
    { name: "ขวดพลาสติกใส", price: 5, unit: "กก.", categoryId: plasticCategory.id },
    { name: "ขวดน้ำพลาสติก", price: 4, unit: "กก.", categoryId: plasticCategory.id },
    { name: "ถุงพลาสติก", price: 3, unit: "กก.", categoryId: plasticCategory.id },
    { name: "หนังสือพิมพ์", price: 2, unit: "กก.", categoryId: paperCategory.id },
    { name: "กล่องกระดาษ", price: 3, unit: "กก.", categoryId: paperCategory.id },
    { name: "กระดาษขาวดำ", price: 2.5, unit: "กก.", categoryId: paperCategory.id },
  ];

  for (const wt of wasteTypesData) {
    await prisma.wasteType.create({ data: wt });
  }

  //////////////////////////////////////////////////////
  // SALES + UPDATE BALANCE + TRANSACTION
  //////////////////////////////////////////////////////
  const wasteList = await prisma.wasteType.findMany();

  for (let i = 0; i < 20; i++) {
    const member = members[Math.floor(Math.random() * members.length)];
    const waste = wasteList[Math.floor(Math.random() * wasteList.length)];
    const employee = employees[Math.floor(Math.random() * employees.length)];

    const quantity = Number((Math.random() * 5 + 1).toFixed(2));
    const totalPrice = quantity * waste.price;

    // สร้าง Sale
    const sale = await prisma.sale.create({
      data: {
        memberId: member.id,
        wasteTypeId: waste.id,
        quantity,
        totalPrice,
        status: "APPROVED",
        approvedBy: employee.id,
      },
    });

    // อัปเดต balance ของสมาชิก
    await prisma.wallet.update({
      where: { id: member.wallet.id },
      data: { balance: { increment: totalPrice } },
    });

    // สร้าง Transaction record (ประวัติ)
    await prisma.transaction.create({
      data: {
        walletId: member.wallet.id,
        memberId: member.id,
        type: "DEPOSIT",
        amount: totalPrice,
        status: "APPROVED",
        approvedBy: employee.id,
        note: `ขาย ${quantity} ${waste.unit} ของ ${waste.name}`,
      },
    });
  }

  //////////////////////////////////////////////////////
  // ANNOUNCEMENT
  //////////////////////////////////////////////////////
  await prisma.announcement.create({
    data: {
      title: "เปิดรับซื้อขยะทุกวันเสาร์",
      content: "เปิดรับซื้อเวลา 09:00 - 12:00 น.",
      createdBy: adminAccount.id,
      newsstatus: "PUBLISHED",
    },
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });