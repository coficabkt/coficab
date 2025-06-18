"use client";

import { useState, useCallback, useEffect } from "react";
import { FaTrash, FaCheckCircle, FaClock, FaEdit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LogoLoader from "@/app/components/LogoLoader";
import { DemandeChangementParada } from "../../../types";
import ExportButtonsChangement from "@/app/components/ExportButtonsChangement";

export default function DemandeChangementPage() {
  const [demandes, setDemandes] = useState<DemandeChangementParada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nom: "", prenom: "", matricule: "", dateFrom: "", dateTo: "" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [enCours, setEnCours] = useState(0);
  const [traite, setTraite] = useState(0);

  const [selectedDemande, setSelectedDemande] = useState<DemandeChangementParada | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [nouvelleParadaInput, setNouvelleParadaInput] = useState("");

  const loadDemandes = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ ...filters, page: page.toString(), perPage: perPage.toString() });
    const res = await fetch(`/api/demande-changement-parada?${query}`);
    const data = await res.json();
    setDemandes(data.paginated);
    setTotal(data.total);
    setEnCours(data.enCours);
    setTraite(data.traite);
    setLoading(false);
  }, [filters, page, perPage]);

  useEffect(() => { loadDemandes(); }, [loadDemandes]);

  const handleTraiter = async (id: string) => {
    const res = await fetch("/api/demande-changement-parada", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "traité" }),
    });
    if (res.ok) {
      toast.success("Statut mis à jour !");
      loadDemandes();
    } else {
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  const confirmDelete = (demande: DemandeChangementParada) => {
    setSelectedDemande(demande);
    setShowDeleteModal(true);
  };

  const openUpdate = (demande: DemandeChangementParada) => {
    setSelectedDemande(demande);
    setNouvelleParadaInput(demande.nouvelleParada || "");
    setShowUpdateModal(true);
  };

  const confirmDeleteAction = async () => {
    if (!selectedDemande) return;
    const res = await fetch("/api/demande-changement-parada", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedDemande.id }),
    });
    if (res.ok) {
      toast.success("Demande supprimée !");
      loadDemandes();
    } else {
      toast.error("Erreur lors de la suppression !");
    }
    setShowDeleteModal(false);
    setSelectedDemande(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;

    const res = await fetch("/api/demande-changement-parada", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedDemande.id, nouvelleParada: nouvelleParadaInput }),
    });

    if (res.ok) {
      toast.success("Mise à jour réussie !");
      setShowUpdateModal(false);
      setSelectedDemande(null);
      loadDemandes();
    } else {
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  return (
    <main className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-[#B87333]">Demandes de Changement Des Stations Transport</h1>

      <div className="flex flex-wrap gap-4 bg-white p-6 rounded-xl shadow-md">
        <input type="text" placeholder="Nom" value={filters.nom} onChange={(e) => setFilters({ ...filters, nom: e.target.value })} className="border p-2 rounded flex-1" />
        <input type="text" placeholder="Prénom" value={filters.prenom} onChange={(e) => setFilters({ ...filters, prenom: e.target.value })} className="border p-2 rounded flex-1" />
        <input type="text" placeholder="Matricule" value={filters.matricule} onChange={(e) => setFilters({ ...filters, matricule: e.target.value })} className="border p-2 rounded flex-1" />
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="border p-2 rounded" />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="border p-2 rounded" />
        <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border p-2 rounded">
          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button onClick={loadDemandes} className="bg-[#020495] text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold">Filtrer</button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="bg-[#020495] text-white rounded-2xl p-6 flex-1 min-w-[160px] shadow-md">
          <p className="text-lg font-semibold">En cours</p>
          <p className="text-2xl font-bold">{enCours}</p>
        </div>
        <div className="bg-[#B87333] text-white rounded-2xl p-6 flex-1 min-w-[160px] shadow-md">
          <p className="text-lg font-semibold">Traité</p>
          <p className="text-2xl font-bold">{traite}</p>
        </div>
      </div>

      <ExportButtonsChangement demandes={demandes} />

      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        {loading ? (
          <div className="py-10 w-full flex justify-center">
            <LogoLoader />
          </div>
        ) : (
          <table className="min-w-full text-sm table-auto">
            <thead>
              <tr className="text-left font-semibold text-gray-700 border-b">
                <th>Nom</th>
                <th>Prénom</th>
                <th>Matricule</th>
                <th>Ancienne Parada</th>
                <th>Nouvelle Parada</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Créé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{d.nom}</td>
                  <td>{d.prenom}</td>
                  <td>{d.matricule}</td>
                  <td>{d.ancienneParada}</td>
                  <td>{d.nouvelleParada}</td>
                  <td>{d.email}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === "traité" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-gray-500 px-3 py-2">
  <div className="flex items-center gap-1">
    <FaClock /> {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
  </div>
</td>
                  <td className="whitespace-nowrap px-3 py-2">
  <div className="flex items-center gap-3">
    {d.status === "en cours" && (
      <button onClick={() => handleTraiter(d.id)} className="text-green-500 hover:text-green-700 transition" title="Traiter">
        <FaCheckCircle size={18} />
      </button>
    )}
    <button onClick={() => openUpdate(d)} className="text-blue-500 hover:text-blue-700 transition" title="Modifier">
      <FaEdit size={18} />
    </button>
    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(d); }} className="text-red-500 hover:text-red-700 transition" title="Supprimer">
      <FaTrash size={18} />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className={`px-4 py-2 rounded-xl font-medium ${page <= 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Précédent</button>
        <span className="text-gray-600 font-medium">Page {page}</span>
        <button onClick={() => setPage((prev) => (page * perPage >= total ? prev : prev + 1))} disabled={page * perPage >= total} className={`px-4 py-2 rounded-xl font-medium ${page * perPage >= total ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Suivant</button>
      </div>

      {showUpdateModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Modifier la demande</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <input
                type="text"
                value={nouvelleParadaInput}
                onChange={(e) => setNouvelleParadaInput(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowUpdateModal(false)} type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}
    {showDeleteModal && selectedDemande && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-red-600">Confirmation de suppression</h2>
      <p className="mb-4">Êtes-vous sûr de vouloir supprimer la demande de <strong>{selectedDemande.nom} {selectedDemande.prenom}</strong> ?</p>
      <div className="flex justify-end gap-4">
        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Annuler</button>
        <button onClick={confirmDeleteAction} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Supprimer</button>
      </div>
    </div>
  </div>
)}

</main>
  );
}
