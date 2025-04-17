
import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <div className="p-6 bg-gray-100">
          <Link to="/" className="inline-flex items-center gap-2 text-skyward-primary hover:text-skyward-dark mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Homepage</span>
          </Link>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
