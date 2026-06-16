import { prisma } from "@/lib/prisma";
import { getActiveBusiness } from "@/server/business/get-active-business";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function getMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    start,
    end,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export async function getDashboardData() {
  const { business } = await getActiveBusiness();

  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: monthStart, end: monthEnd, month, year } = getMonthRange();

  const businessWithBilling = await prisma.business.findUnique({
    where: {
      id: business.id,
    },
    include: {
      subscription: true,
    },
  });

  if (!businessWithBilling) {
    throw new Error("Active business was not found.");
  }

  const [
    todayAppointments,
    totalCustomers,
    monthlyBookings,
    upcomingAppointments,
    recentAppointments,
    currentUsageRecord,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: {
          gte: todayStart,
          lt: todayEnd,
        },
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
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    }),

    prisma.appointment.count({
      where: {
        businessId: business.id,
        date: {
          gte: todayStart,
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

    prisma.bookingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId: business.id,
          month,
          year,
        },
      },
    }),
  ]);

  const currentUsage = currentUsageRecord?.bookingCount ?? 0;

  const planLimit =
    businessWithBilling.subscription?.plan === "PRO"
      ? null
      : businessWithBilling.subscription?.plan === "STARTER"
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
      plan: businessWithBilling.subscription?.plan ?? "FREE",
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
