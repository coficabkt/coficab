"use client";

import { useEffect, useState, useCallback } from "react";
import { FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExportButtonsAttestation from "@/app/components/ExportButtonsAttestation";
import LogoLoader from "@/app/components/LogoLoader";
import { DemandeAttestation } from "../../../types";

export default function Page() {
  const [demandes, setDemandes] = useState<DemandeAttestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    dateFrom: "",
    dateTo: "",
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [enCours, setEnCours] = useState(0);
  const [traite, setTraite] = useState(0);

  const loadDemandes = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      ...filters,
      page: page.toString(),
      perPage: perPage.toString(),
    });
    const res = await fetch(`/api/demande-attestation?${query}`);
    const data = await res.json();
    setDemandes(data.demandes);
    setTotal(data.total);
    setEnCours(data.enCours);
    setTraite(data.traite);
    setLoading(false);
  }, [filters, page, perPage]);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ?")) return;
    const res = await fetch("/api/demande-attestation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Demande supprimée !");
      loadDemandes();
    } else {
      toast.error("Erreur lors de la suppression !");
    }
  };

  const handleTraiter = async (id: string) => {
    const res = await fetch("/api/demande-attestation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "traité" }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Statut mis à jour !");
      if (data.emailStatus.includes("succès")) {
        toast.info("Email envoyé !");
      }
      loadDemandes();
    } else {
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  return (
    <main className="flex-1 p-4 space-y-6">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <h1 className="text-2xl font-bold">Demandes d&apos;attestation</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-gray-100 p-4 rounded">
        {["nom", "prenom", "matricule"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={filters[field as keyof typeof filters]}
            onChange={(e) =>
              setFilters({ ...filters, [field]: e.target.value })
            }
            className="border p-2 rounded flex-1"
          />
        ))}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={perPage}
          onChange={(e) => setPerPage(parseInt(e.target.value))}
          className="border p-2 rounded"
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        <button
          onClick={loadDemandes}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Filtrer
        </button>
      </div>

      {/* Filter Cards */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-blue-500 text-white rounded p-4 flex-1 min-w-[120px]">
          <p className="text-xl font-bold">En cours</p>
          <p>{enCours}</p>
        </div>
        <div className="bg-green-500 text-white rounded p-4 flex-1 min-w-[120px]">
          <p className="text-xl font-bold">Traité</p>
          <p>{traite}</p>
        </div>
      </div>

      {/* Export Buttons */}
    <ExportButtonsAttestation demandes={demandes} />

      {/* Table or Loader */}
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        {loading ? (
          <div className="py-10 w-full flex justify-center">
            <LogoLoader />
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left font-semibold whitespace-nowrap">
                <th>Nom</th>
                <th>Prénom</th>
                <th>Matricule</th>
                <th>Objet</th>
                <th>Département</th>
                <th>Attestations</th>
                <th>Email</th>
                <th>Status</th>
                <th>Créé</th>
             
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td>{d.nom}</td>
                  <td>{d.prenom}</td>
                  <td>{d.matricule}</td>
                  <td>{d.objet}</td>
                  <td>{d.departement || "—"}</td>
                  <td>
  {d.attestations && d.attestations.length > 0
    ? d.attestations.map((a, idx) => (
        <div key={idx}>{a}</div>
      ))
    : "—"}
</td>
                  <td>{d.email}</td>
                  <td>{d.status}</td>
                  <td className="flex items-center gap-1 whitespace-nowrap">
                    <FaClock className="text-gray-500" />
                    {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                  </td>
                  <td className="flex gap-2 items-center whitespace-nowrap">
                    {d.status === "en cours" && (
                      <button
                        onClick={() => handleTraiter(d.id)}
                        title="Traiter"
                        className="text-green-500 hover:text-green-700 transition"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d.id)}
                      title="Supprimer"
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
          className={`px-4 py-2 rounded ${
            page <= 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Précédent
        </button>
        <button
          onClick={() => setPage((prev) => (page * perPage >= total ? prev : prev + 1))}
          disabled={page * perPage >= total}
          className={`px-4 py-2 rounded ${
            page * perPage >= total
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Suivant
        </button>
      </div>
    </main>
  );
}
