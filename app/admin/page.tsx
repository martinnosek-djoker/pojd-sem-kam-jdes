import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";
import { getAllRestaurants } from "@/lib/db";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  try {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      redirect("/admin/login");
    }

    const restaurants = await getAllRestaurants();

    return <AdminDashboard initialRestaurants={restaurants} />;
  } catch (error) {
    console.error("Admin page error:", error);
    throw error;
  }
}
