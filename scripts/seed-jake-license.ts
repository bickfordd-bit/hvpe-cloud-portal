import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.license.upsert({
    where: { key: "BICK-JAKE-LIFETIME-0001" },
    update: {
      status: "ACTIVE",
      role: "JAKE",
      mode: "JAKE_BUILD",
      tenant: "jake",
      tier: "LIFETIME",
      readOnly: true,
    },
    create: {
      key: "BICK-JAKE-LIFETIME-0001",
      email: "jake@hvpe.cloud",
      status: "ACTIVE",
      role: "JAKE",
      mode: "JAKE_BUILD",
      tenant: "jake",
      tier: "LIFETIME",
      readOnly: true,
    },
  });

  console.log("✅ Seeded/updated Jake license: BICK-JAKE-LIFETIME-0001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
