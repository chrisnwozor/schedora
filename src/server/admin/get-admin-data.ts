import { prisma } from "@/lib/prisma";

export async function getAdminOverviewData() {
  const [
    totalBusinesses,
    totalUsers,
    totalAppointments,
    activeSubscriptions,
    topBusinesses,
    recentBusinesses,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.business.findMany({
      include: {
        subscription: true,
        appointments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.business.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    metrics: {
      totalBusinesses,
      totalUsers,
      totalAppointments,
      monthlyRevenue: activeSubscriptions * 19,
      activeSubscriptions,
    },
    topBusinesses,
    recentBusinesses,
  };
}

export async function getAdminBusinessesData(search = "") {
  const query = search.trim();

  const businesses = await prisma.business.findMany({
    where: query
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              businessType: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    include: {
      owner: true,
      subscription: true,
      appointments: true,
      customers: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    businesses,
    total: businesses.length,
    active: businesses.filter((business) => business.status === "ACTIVE")
      .length,
    suspended: businesses.filter((business) => business.status === "SUSPENDED")
      .length,
    freePlans: businesses.filter(
      (business) => business.subscription?.plan === "FREE",
    ).length,
  };
}

export async function getAdminUsersData() {
  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: {
          business: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    users,
    total: users.length,
    platformAdmins: users.filter(
      (user) => user.platformRole === "PLATFORM_ADMIN",
    ).length,
    businessOwners: users.filter((user) =>
      user.memberships.some((membership) => membership.role === "OWNER"),
    ).length,
    staffUsers: users.filter((user) =>
      user.memberships.some((membership) => membership.role === "STAFF"),
    ).length,
  };
}

export async function getAdminSubscriptionsData() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      business: {
        include: {
          bookingUsage: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    subscriptions,
    free: subscriptions.filter((sub) => sub.plan === "FREE").length,
    starter: subscriptions.filter((sub) => sub.plan === "STARTER").length,
    pro: subscriptions.filter((sub) => sub.plan === "PRO").length,
    active: subscriptions.filter((sub) => sub.status === "ACTIVE").length,
  };
}
