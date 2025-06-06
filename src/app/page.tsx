"use client";

// import Image from "next/image";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";

// ✅ Zod schemas
const demandeSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  matricule: z.string().regex(/^\d{4}$/, "Matricule doit être 4 chiffres"),
  objet: z.string().min(1, "Objet requis"),
  departement: z.string().min(1, "Département requis"),
  attestations: z.array(z.string()).min(1, "Au moins une attestation requise"),
});

const changementSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  matricule: z.string().regex(/^\d{4}$/, "Matricule doit être 4 chiffres"),
  ancienneParada: z.string().min(1, "Ancienne parada requise"),
  nouvelleParada: z.string().min(1, "Nouvelle parada requise"),
  departement: z.string().min(1, "Département requis"),
});

export default function DemandePage() {
  const [demandeForm, setDemandeForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    matricule: "",
    objet: "",
    departement: "",
    attestations: [] as string[],
  });
  const [isSubmittingDemande, setIsSubmittingDemande] = useState(false);

  const [changementForm, setChangementForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    matricule: "",
    ancienneParada: "",
    nouvelleParada: "",
    departement: "",
  });
  const [isSubmittingChangement, setIsSubmittingChangement] = useState(false);

  const departments = [
    "extrusion",
    "metal",
    "achat",
    "it",
    "ip",
    "maintenance",
    "qualite",
    "finance",
    "rh",
    "manufacturing",
  ];

  const handleDemandeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      const checked = target.checked;
      setDemandeForm((prev) => ({
        ...prev,
        attestations: checked
          ? [...prev.attestations, value]
          : prev.attestations.filter((att) => att !== value),
      }));
    } else {
      setDemandeForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChangementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChangementForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDemandeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = demandeSchema.safeParse(demandeForm);
    if (!validation.success) {
      const message = validation.error.errors[0].message;
      toast.error(`❌ ${message}`);
      return;
    }

    setIsSubmittingDemande(true);
    try {
      const res = await fetch("/api/demande-attestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...demandeForm, status: "en cours" }),
      });

      if (res.ok) {
        toast.success("✅ Demande d'attestation enregistrée !");
        setDemandeForm({
          nom: "",
          prenom: "",
          email: "",
          matricule: "",
          objet: "",
          departement: "",
          attestations: [],
        });
      } else {
        toast.error("❌ Erreur lors de l'enregistrement de la demande.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de l'enregistrement de la demande.");
    } finally {
      setIsSubmittingDemande(false);
    }
  };

  const handleChangementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = changementSchema.safeParse(changementForm);
    if (!validation.success) {
      const message = validation.error.errors[0].message;
      toast.error(`❌ ${message}`);
      return;
    }

    setIsSubmittingChangement(true);
    try {
      const res = await fetch("/api/demande-changement-parada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...changementForm, status: "en cours" }),
      });

      if (res.ok) {
        toast.success("✅ Demande de changement de parada enregistrée !");
        setChangementForm({
          nom: "",
          prenom: "",
          email: "",
          matricule: "",
          ancienneParada: "",
          nouvelleParada: "",
          departement: "",
        });
      } else {
        toast.error("❌ Erreur lors de l'enregistrement de la demande.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de l'enregistrement de la demande.");
    } finally {
      setIsSubmittingChangement(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br bg-coficab from-blue-950 to-slate-200 min-h-screen flex flex-col items-center justify-center p-6">
      <ToastContainer position="bottom-right" autoClose={4000} />
       {/* <Image className="absolute left-0 top-0 m-3" src="/logosvgnew.svg" alt="logo coficab" width={300} height={80} /> */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 ">
       
        {/* Demande d'attestation */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-center mb-4 text-slate-800">
            Demande d&apos;attestation
          </h2>
          <form onSubmit={handleDemandeSubmit} className="space-y-3">
            {["nom", "prenom", "email", "matricule", "objet"].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={demandeForm[field as keyof typeof demandeForm] as string}
                onChange={handleDemandeChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}

            <select
              name="departement"
              value={demandeForm.departement}
              onChange={handleDemandeChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Sélectionnez un département</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>

            <div>
              <p className="font-semibold mb-2 text-slate-700">Choisissez les attestations :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Attestation de travail",
                  "attestation de salaire",
                  "attestation de domiciliation de salaire",
                  "attestation de restitution de IR",
                  "bulletin de paie",
                ].map((attestation) => (
                  <label
                    key={attestation}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded hover:bg-blue-100 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="attestations"
                      value={attestation}
                      checked={demandeForm.attestations.includes(attestation)}
                      onChange={handleDemandeChange}
                      className="accent-blue-500"
                    />
                    <span className="text-slate-700">{attestation}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingDemande}
              className={`w-full ${
                isSubmittingDemande
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white font-semibold py-2 rounded transition`}
            >
              {isSubmittingDemande ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        </div>

        {/* Demande de changement de parada */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-center mb-4 text-slate-800">
            Changement de parada
          </h2>
          <form onSubmit={handleChangementSubmit} className="space-y-3">
            {[
              "nom",
              "prenom",
              "email",
              "matricule",
              "ancienneParada",
              "nouvelleParada",
            ].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                value={changementForm[field as keyof typeof changementForm] as string}
                onChange={handleChangementChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ))}

            <select
              name="departement"
              value={changementForm.departement}
              onChange={handleChangementChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Sélectionnez un département</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isSubmittingChangement}
              className={`w-full ${
                isSubmittingChangement
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold py-2 rounded transition`}
            >
              {isSubmittingChangement ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
