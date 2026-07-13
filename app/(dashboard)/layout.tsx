import AppHeader from "@/components/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />

      <main className="p-6 w-full">
        {children}
      </main>
    </div>
  );
}