import { fetchCommissions } from "./actions/commissionActions";
import DashboardShell from "@/components/DashboardShell";
import { isAuthenticated } from "@/lib/auth";

export default async function Home() {
  const commissions = await fetchCommissions();
  const isAuth = await isAuthenticated();

  return (
    <DashboardShell initialCommissions={commissions} isAuthenticated={isAuth} />
  );
}
