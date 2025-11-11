"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  success: boolean;
  importedRestaurants: number;
  importedTrendings: number;
  importedBakeries: number;
  totalRestaurants: number;
  totalTrendings: number;
  totalBakeries: number;
  errors?: Array<{ row: number; error: string }>;
}

export default function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Pouze CSV soubory jsou podporovány");
        setFile(null);
      } else {
        setFile(selectedFile);
        setError("");
        setResult(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Vyberte CSV soubor");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        // Show detailed error information
        let errorMsg = data.error || "Chyba při importu";
        if (data.errors && data.errors.length > 0) {
          errorMsg += "\n\nPrvních 5 chyb:\n";
          errorMsg += data.errors.slice(0, 5).map((e: any) => `- Řádek ${e.row}: ${e.error}`).join("\n");
        }
        if (data.debug) {
          console.log("CSV Debug Info:", data.debug);
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("Nepodařilo se importovat soubor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV soubor
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none p-2"
          />
          <p className="mt-2 text-xs text-gray-500">
            Podporovaný formát: CSV soubor exportovaný z Google Sheets
          </p>
        </div>

        {file && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              Vybraný soubor: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-900 rounded-md">
            <h3 className="font-semibold mb-2">✓ Import byl úspěšný!</h3>
            <p className="text-sm mb-1">
              Restaurace: <strong>{String(result.importedRestaurants || 0)}</strong> z {String(result.totalRestaurants || 0)}
            </p>
            <p className="text-sm mb-1">
              Cukrárny: <strong>{String(result.importedBakeries || 0)}</strong> z {String(result.totalBakeries || 0)}
            </p>
            <p className="text-sm mb-2">
              Trendingy: <strong>{String(result.importedTrendings || 0)}</strong> z {String(result.totalTrendings || 0)}
            </p>

            {result.errors && Array.isArray(result.errors) && result.errors.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Varování: {String(result.errors.length)} řádků nebylo importováno
                </p>
                <ul className="text-xs text-yellow-800 space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>
                      Řádek {String(err.row)}: {String(err.error)}
                    </li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="font-semibold">
                      ... a dalších {String(result.errors.length - 10)} chyb
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Přejít do administrace
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!file || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Importuji..." : "Importovat"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
        </div>
      </form>

      {/* Info about CSV format */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">Formát CSV souboru</h3>
        <p className="text-sm text-gray-600 mb-2">
          CSV soubor musí obsahovat tyto sloupce (začínající od řádku 4):
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Sloupec D: Trendy podniky (TOP 10)</li>
          <li>Sloupec E: Název restaurace</li>
          <li>Sloupec F: Lokalita</li>
          <li>Sloupec G: Typ kuchyně</li>
          <li>Sloupec H: (ignorován)</li>
          <li>Sloupec I: Cena za osobu (číslo v Kč)</li>
          <li>Sloupec J: Hodnocení (formát: 9/10 nebo 9)</li>
        </ul>
      </div>
    </div>
  );
}
