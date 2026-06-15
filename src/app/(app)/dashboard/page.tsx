import { BusinessDashboard } from "@/components/dashboard/business-dashboard";
import { getDashboardData } from "@/server/dashboard/get-dashboard-data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <BusinessDashboard data={data} />;
}
