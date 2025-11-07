import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";
import ImportForm from "@/components/ImportForm";

export default async function ImportPage() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import CSV</h1>
          <p className="text-gray-600 mt-2">
            Nahrajte CSV soubor s restauracemi pro jednorázový import.
          </p>
        </div>

        <ImportForm />

        <div className="mt-8 text-center">
          <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
            ← Zpět do administrace
          </a>
        </div>
      </div>
    </div>
  );
}
