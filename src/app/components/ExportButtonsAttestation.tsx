"use client";

import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DemandeAttestation } from "@/types";

export default function ExportButtonsAttestation({ demandes }: { demandes: DemandeAttestation[] }) {
  function exportToExcel() {
    const data = demandes.map((d) => ({
      Nom: d.nom,
      Prenom: d.prenom,
      Matricule: d.matricule,
      Objet: d.objet,
      Departement: d.departement || "—",
      Email: d.email,
      Status: d.status,
      Attestations: d.attestations?.join(", ") || "—",
      Créé: new Date(d.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demandes Attestation");
    XLSX.writeFile(workbook, "demandes_attestation.xlsx");
  }

  function exportToPDF() {
    const doc = new jsPDF();
    doc.text("Demandes d'attestation", 14, 16);

    const tableColumn = [
      "Nom",
      "Prenom",
      "Matricule",
      "Objet",
      "Departement",
      "Attestations",
      "Email",
      "Status",
      "Créé",
    ];
    const tableRows = demandes.map((d) => [
      d.nom,
      d.prenom,
      d.matricule,
      d.objet,
      d.departement || "—",
      d.attestations?.join(", ") || "—",
      d.email,
      d.status,
      new Date(d.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("demandes_attestation.pdf");
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
