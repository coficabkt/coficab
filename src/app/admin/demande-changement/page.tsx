"use client";

import { useEffect, useState, useCallback } from "react";
import { FaTrash, FaCheckCircle, FaClock, FaEdit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExportButtonsChangement from "@/app/components/ExportButtonsChangement";
import LogoLoader from "@/app/components/LogoLoader";
import { DemandeChangementParada } from "../../../types";

export default function Page() {
  const [demandes, setDemandes] = useState<DemandeChangementParada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nom: "", prenom: "", matricule: "", dateFrom: "", dateTo: "" });
  const [page] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [enCours, setEnCours] = useState(0);
  const [traite, setTraite] = useState(0);
  const [selected, setSelected] = useState<DemandeChangementParada | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editParada, setEditParada] = useState("");

  const loadDemandes = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ ...filters, page: page.toString(), perPage: perPage.toString() });
    try {
      const res = await fetch(`/api/demande-changement-parada?${query}`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setDemandes(data.demandes || []);
      setTotal(data.total || 0);
      setEnCours(data.enCours || 0);
      setTraite(data.traite || 0);
    } catch {
      toast.error("Erreur lors du chargement des demandes.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, perPage]);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const handleDelete = async () => {
    if (!selected) return;
    const res = await fetch("/api/demande-changement-parada", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id }),
    });
    if (res.ok) {
      toast.success("Demande supprimée !");
      loadDemandes();
    } else {
      toast.error("Erreur lors de la suppression !");
    }
    setShowModal(false);
    setSelected(null);
  };

  const handleTraiter = async (id: string) => {
    const res = await fetch("/api/demande-changement-parada", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "traité" }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Statut mis à jour !");
      if (data.emailStatus?.includes("succès")) {
        toast.info("Email envoyé !");
      }
      loadDemandes();
    } else {
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    const res = await fetch("/api/demande-changement-parada", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, nouvelleParada: editParada }),
    });
    if (res.ok) {
      toast.success("Parada modifiée !");
      loadDemandes();
    } else {
      toast.error("Erreur lors de la modification !");
    }
    setShowModal(false);
    setSelected(null);
  };

  return (
    <main className="flex-1 p-4 space-y-6">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h1 className="text-2xl font-bold">Demandes de changement</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-gray-100 p-4 rounded">
        {["nom", "prenom", "matricule"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={filters[field as keyof typeof filters]}
            onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
            className="border p-2 rounded flex-1"
          />
        ))}
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="border p-2 rounded" />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="border p-2 rounded" />
        <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border p-2 rounded">
          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button onClick={loadDemandes} className="bg-[#020495] text-white px-4 py-2 rounded hover:bg-blue-600 transition">Filtrer</button>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-[#020495] text-white rounded p-4 flex-1 min-w-[120px]">
          <p className="text-xl font-bold">En cours</p>
          <p>{enCours}</p>
        </div>
        <div className="bg-[#B87333] text-white rounded p-4 flex-1 min-w-[120px]">
          <p className="text-xl font-bold">Traité</p>
          <p>{traite}</p>
        </div>
      </div>

      <ExportButtonsChangement demandes={demandes} />

      {/* Table */}
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
                <th>Ancienne Parada</th>
                <th>Nouvelle Parada</th>
                <th>Email</th>
                <th className="text-right">Status</th>
                <th>Créé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(demandes) && demandes.length > 0 ? (
                demandes.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td>{d.nom}</td>
                    <td>{d.prenom}</td>
                    <td>{d.matricule}</td>
                    <td>{d.ancienneParada}</td>
                    <td className="flex items-center gap-2">
                      {d.nouvelleParada}
                      <FaEdit className="text-blue-500 cursor-pointer" onClick={() => { setSelected(d); setEditParada(d.nouvelleParada); setShowModal(true); }} />
                    </td>
                    <td>{d.email}</td>
                    <td className="text-right">
                      <span className={`inline-flex items-center justify-end gap-1 px-2 py-1 rounded-full text-white text-xs font-medium w-fit ml-auto ${d.status === "en cours" ? "bg-blue-600" : d.status === "traité" ? "bg-green-600" : d.status === "rejeté" ? "bg-red-600" : d.status === "en attente" ? "bg-yellow-500 text-black" : "bg-gray-400"}`}>
                        {d.status === "en cours" && <FaClock className="text-white text-xs" />}
                        {d.status === "traité" && <FaCheckCircle className="text-white text-xs" />}
                        {d.status === "rejeté" && <FaTrash className="text-white text-xs" />}
                        {d.status === "en attente" && <FaClock className="text-black text-xs" />}
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td className="flex items-center gap-1 whitespace-nowrap">
                      <FaClock className="text-gray-500" />
                      {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                    </td>
                    <td className="flex gap-2 items-center whitespace-nowrap">
                      {d.status === "en cours" && (
                        <button onClick={() => handleTraiter(d.id)} title="Traiter" className="text-green-500 hover:text-green-700 transition">
                          <FaCheckCircle />
                        </button>
                      )}
                      <button onClick={() => { setSelected(d); setShowModal(true); }} title="Supprimer" className="text-red-500 hover:text-red-700 transition">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    Aucune demande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">Modifier la parada</h2>
            <input
              type="text"
              value={editParada}
              onChange={(e) => setEditParada(e.target.value)}
              className="w-full border rounded p-2"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
              <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
