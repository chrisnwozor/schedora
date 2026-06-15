import "dotenv/config";
import {
  AppointmentStatus,
  BusinessRole,
  PlatformRole,
  PrismaClient,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Cleaning database...");

  await prisma.adminNote.deleteMany();
  await prisma.bookingUsage.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.businessMembership.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating demo user...");

  const owner = await prisma.user.create({
    data: {
      name: "Ugochukwu",
      email: "owner@schedora.app",
      platformRole: PlatformRole.PLATFORM_ADMIN,
    },
  });

  console.log("Creating demo business...");

  const business = await prisma.business.create({
    data: {
      name: "Glow Barbershop",
      slug: "glowbarbershop",
      businessType: "Barber",
      phone: "+1 519 555 0188",
      email: "hello@glowbarbershop.com",
      address: "London, Ontario, Canada",
      description:
        "Modern barbershop offering haircuts, fades, beard trims, and grooming services.",
      ownerUserId: owner.id,
    },
  });

  await prisma.businessMembership.create({
    data: {
      userId: owner.id,
      businessId: business.id,
      role: BusinessRole.OWNER,
    },
  });

  await prisma.subscription.create({
    data: {
      businessId: business.id,
      plan: SubscriptionPlan.STARTER,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  await prisma.bookingUsage.create({
    data: {
      businessId: business.id,
      month: 6,
      year: 2026,
      bookingCount: 68,
    },
  });

  console.log("Creating services...");

  const haircut = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Haircut",
      description: "Clean professional haircut.",
      priceCents: 3500,
      durationMinutes: 30,
    },
  });

  const fade = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Fade",
      description: "Fresh fade haircut.",
      priceCents: 4000,
      durationMinutes: 35,
    },
  });

  const fadeBeard = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Fade + Beard",
      description: "Fade haircut with beard trim.",
      priceCents: 5500,
      durationMinutes: 50,
    },
  });

  const beardTrim = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Beard Trim",
      description: "Shape and clean beard trim.",
      priceCents: 2000,
      durationMinutes: 20,
    },
  });

  console.log("Creating staff...");

  const james = await prisma.staffMember.create({
    data: {
      businessId: business.id,
      name: "James Wilson",
      email: "james@glowbarbershop.com",
      phone: "+1 519 555 0101",
      roleTitle: "Barber",
    },
  });

  const mike = await prisma.staffMember.create({
    data: {
      businessId: business.id,
      name: "Mike Adams",
      email: "mike@glowbarbershop.com",
      phone: "+1 519 555 0102",
      roleTitle: "Barber",
    },
  });

  console.log("Creating availability...");

  const availability = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isClosed: false },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isClosed: false },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isClosed: false },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isClosed: false },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isClosed: false },
    { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isClosed: false },
    { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isClosed: true },
  ];

  for (const rule of availability) {
    await prisma.availabilityRule.create({
      data: {
        businessId: business.id,
        ...rule,
      },
    });
  }

  console.log("Creating customers...");

  const dwayne = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Dwayne Carter",
      email: "dwayne@example.com",
      phone: "+1 519 555 0134",
    },
  });

  const marvin = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Marvin McKinney",
      email: "marvin@example.com",
      phone: "+1 519 555 0188",
    },
  });

  const cody = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Cody Fisher",
      email: "cody@example.com",
      phone: "+1 519 555 0199",
    },
  });

  const brooklyn = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Brooklyn Simmons",
      email: "brooklyn@example.com",
      phone: "+1 519 555 0110",
    },
  });

  const esther = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Esther Howard",
      email: "esther@example.com",
      phone: "+1 519 555 0105",
    },
  });

  console.log("Creating appointments...");

  const appointmentDate = new Date("2026-06-15T00:00:00.000Z");

  await prisma.appointment.createMany({
    data: [
      {
        businessId: business.id,
        customerId: dwayne.id,
        serviceId: fadeBeard.id,
        staffMemberId: james.id,
        date: appointmentDate,
        startTime: "09:00",
        endTime: "09:50",
        status: AppointmentStatus.CONFIRMED,
      },
      {
        businessId: business.id,
        customerId: marvin.id,
        serviceId: haircut.id,
        staffMemberId: james.id,
        date: appointmentDate,
        startTime: "10:30",
        endTime: "11:00",
        status: AppointmentStatus.CONFIRMED,
      },
      {
        businessId: business.id,
        customerId: cody.id,
        serviceId: fade.id,
        staffMemberId: mike.id,
        date: appointmentDate,
        startTime: "12:00",
        endTime: "12:35",
        status: AppointmentStatus.PENDING,
      },
      {
        businessId: business.id,
        customerId: brooklyn.id,
        serviceId: fadeBeard.id,
        staffMemberId: james.id,
        date: appointmentDate,
        startTime: "13:30",
        endTime: "14:20",
        status: AppointmentStatus.COMPLETED,
      },
      {
        businessId: business.id,
        customerId: esther.id,
        serviceId: beardTrim.id,
        staffMemberId: mike.id,
        date: appointmentDate,
        startTime: "15:00",
        endTime: "15:20",
        status: AppointmentStatus.CONFIRMED,
      },
    ],
  });

  await prisma.adminNote.create({
    data: {
      businessId: business.id,
      note: "Demo tenant for Schedora MVP development.",
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
