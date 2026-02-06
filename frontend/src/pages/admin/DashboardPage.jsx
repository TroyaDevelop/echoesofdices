import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DashboardHero from '../../components/admin/dashboard/DashboardHero.jsx';
import DashboardHint from '../../components/admin/dashboard/DashboardHint.jsx';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <DashboardHero />
        <DashboardHint />
      </div>
    </AdminLayout>
  );
}
