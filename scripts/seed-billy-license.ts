import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed BICK-BILLY-LIFETIME-0001
  await prisma.license.upsert({
    where: { key: "BICK-BILLY-LIFETIME-0001" },
    update: {
      status: "ACTIVE",
      role: "BILLY",
      mode: "TRADING_ENGINE",
      tenant: "billy",
      tier: "LIFETIME",
      readOnly: false,
    },
    create: {
      key: "BICK-BILLY-LIFETIME-0001",
      email: "billy@hvpe.cloud",
      status: "ACTIVE",
      role: "BILLY",
      mode: "TRADING_ENGINE",
      tenant: "billy",
      tier: "LIFETIME",
      readOnly: false,
    },
  });

  console.log("✅ Seeded/updated Billy license: BICK-BILLY-LIFETIME-0001");

  // Seed BICK-BILLY-LIFETIME-0002
  await prisma.license.upsert({
    where: { key: "BICK-BILLY-LIFETIME-0002" },
    update: {
      status: "ACTIVE",
      role: "BILLY",
      mode: "TRADING_ENGINE",
      tenant: "billy",
      tier: "LIFETIME",
      readOnly: false,
    },
    create: {
      key: "BICK-BILLY-LIFETIME-0002",
      email: "billy@hvpe.cloud",
      status: "ACTIVE",
      role: "BILLY",
      mode: "TRADING_ENGINE",
      tenant: "billy",
      tier: "LIFETIME",
      readOnly: false,
    },
  });

  console.log("✅ Seeded/updated Billy license: BICK-BILLY-LIFETIME-0002");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
