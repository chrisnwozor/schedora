import { prisma } from "@/lib/prisma";

const DEMO_BUSINESS_SLUG = "glowbarbershop";

export async function getDashboardData() {
  const business = await prisma.business.findUnique({
    where: {
      slug: DEMO_BUSINESS_SLUG,
    },
    include: {
      subscription: true,
      bookingUsage: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!business) {
    throw new Error(
      "Demo business was not found. Run `npx prisma db seed` first.",
    );
  }

  const today = new Date("2026-06-15T00:00:00.000Z");

  const [
    todayAppointments,
    totalCustomers,
    monthlyBookings,
    upcomingAppointments,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: today,
      },
      include: {
        customer: true,
        service: true,
        staffMember: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),

    prisma.customer.count({
      where: {
        businessId: business.id,
      },
    }),

    prisma.appointment.count({
      where: {
        businessId: business.id,
      },
    }),

    prisma.appointment.count({
      where: {
        businessId: business.id,
        date: {
          gte: today,
        },
      },
    }),

    prisma.appointment.findMany({
      where: {
        businessId: business.id,
      },
      include: {
        customer: true,
        service: true,
        staffMember: true,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          startTime: "asc",
        },
      ],
      take: 5,
    }),
  ]);

  const currentUsage = business.bookingUsage[0]?.bookingCount ?? 0;

  const planLimit =
    business.subscription?.plan === "PRO"
      ? null
      : business.subscription?.plan === "STARTER"
        ? 100
        : 20;

  const usagePercentage = planLimit
    ? Math.round((currentUsage / planLimit) * 100)
    : 0;

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      businessType: business.businessType,
    },
    metrics: {
      todayAppointments: todayAppointments.length,
      pendingToday: todayAppointments.filter(
        (item) => item.status === "PENDING",
      ).length,
      upcomingAppointments,
      monthlyBookings,
      totalCustomers,
    },
    usage: {
      plan: business.subscription?.plan ?? "FREE",
      used: currentUsage,
      limit: planLimit,
      percentage: usagePercentage,
      remaining: planLimit ? Math.max(planLimit - currentUsage, 0) : null,
    },
    todaySchedule: todayAppointments,
    recentAppointments,
    bookingLink: `schedora.app/book/${business.slug}`,
  };
}
