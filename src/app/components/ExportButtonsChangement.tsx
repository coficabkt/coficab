"use client";

import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DemandeChangementParada } from "@/types";

export default function ExportButtonsChangement({ demandes }: { demandes: DemandeChangementParada[] }) {
  function exportToExcel() {
    const data = demandes.map((d) => ({
      Nom: d.nom,
      Prenom: d.prenom,
      Matricule: d.matricule,
      AncienneParada: d.ancienneParada,
      NouvelleParada: d.nouvelleParada,
      Departement: d.departement || "—",
      Email: d.email,
      Status: d.status,
      Créé: new Date(d.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demandes Changement");
    XLSX.writeFile(workbook, "demandes_changement.xlsx");
  }

  function exportToPDF() {
    const doc = new jsPDF();
    doc.text("Demandes de changement de parada", 14, 16);

    const tableColumn = [
      "Nom",
      "Prenom",
      "Matricule",
      "Ancienne Parada",
      "Nouvelle Parada",
      "Departement",
      "Email",
      "Status",
      "Créé",
    ];
    const tableRows = demandes.map((d) => [
      d.nom,
      d.prenom,
      d.matricule,
      d.ancienneParada,
      d.nouvelleParada,
      d.departement || "—",
      d.email,
      d.status,
      new Date(d.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("demandes_changement.pdf");
  }

  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        <FaFileExcel />
        Exporter Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        <FaFilePdf />
        Exporter PDF
      </button>
    </div>
  );
}
