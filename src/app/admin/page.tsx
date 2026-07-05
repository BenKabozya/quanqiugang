import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [userCount, activityCount, quotationCount, shipmentCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.quotation.count({ where: { status: "new" } }),
      prisma.shipment.count(),
    ]);

  const stats = [
    { label: "Registered users", value: userCount },
    { label: "Activity posts", value: activityCount },
    { label: "New quotations", value: quotationCount },
    { label: "Active shipments", value: shipmentCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-white/50 text-sm mb-8">
        Overview of Quanqiugang International.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-panel border border-line rounded-xl p-5"
          >
            <p className="text-3xl font-bold text-teal mb-1">{stat.value}</p>
            <p className="text-white/50 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}