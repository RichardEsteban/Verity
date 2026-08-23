import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/app/components/common/ErrorBoundary";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </ErrorBoundary>
  );
}
