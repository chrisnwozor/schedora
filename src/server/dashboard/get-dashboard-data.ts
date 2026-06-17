import { prisma } from "@/lib/prisma";
import {
  getMonthDateRangeForTimeZone,
  getTodayDateRangeForTimeZone,
} from "@/lib/date";
import { getActiveBusiness } from "@/server/business/get-active-business";

export async function getDashboardData() {
  const { business } = await getActiveBusiness();

  const timeZone = business.timeZone;

  const { start: todayStart, end: todayEnd } =
    getTodayDateRangeForTimeZone(timeZone);

  const {
    start: monthStart,
    end: monthEnd,
    month,
    year,
  } = getMonthDateRangeForTimeZone(timeZone);

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
        status: {
          not: "CANCELLED",
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
      timeZone,
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

    bookingLink: `${
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    }/book/${business.slug}`,
  };
}
