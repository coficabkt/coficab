"use client";

import Image from "next/image";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";

// ✅ Zod schemas
const demandeSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  matricule: z.string().regex(/^[0-9]{4}$/, "Matricule doit être 4 chiffres"),
  objet: z.string().min(1, "Objet requis"),
  departement: z.string().min(1, "Département requis"),
  attestations: z.array(z.string()).min(1, "Au moins une attestation requise"),
});

const changementSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  matricule: z.string().regex(/^[0-9]{4}$/, "Matricule doit être 4 chiffres"),
  ancienneParada: z.string().min(1, "Ancienne parada requise"),
  nouvelleParada: z.string().min(1, "Nouvelle parada requise"),
  departement: z.string().min(1, "Département requis"),
});

export default function DemandePage() {
  const [formType, setFormType] = useState<"attestation" | "changement">("attestation");

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

  const paradas = [
  "DIMACHK",
  "KHITANO",
  "MASSJID AL MUSTAPHA",
  "OULED OUIJH (BANQUE POPULAIRE)",
  "OULED OUIJH 'BANQUE SG'",
  "OULED OUIJH CHÂTEAU 'CAFE LOS ANGELES'",
  "OULED OUIJH MOSQUE RAYAN",
  "CAFE ISMAILIA",
  "PHARMACIE EL HADDADA",
  "BACHAWIYA",
  "CAFE ALAM",
  "CAFE HASSNAOUI",
  "OULED OUIJH (ZIZ)",
  "OULED OUIJH (PHARMACIE ZOHOUR)",
  "PHARMACIE ESSOUFI",
  "ECOLE ABDERRAHMAN NACER",
  "ECOLE HOMMAN FETOUAKI",
  "CAFE BROADWAY",
  "PHARMACIE AZHAROUN",
  "ASWAK SALAM 'ECOLE ZOHOUR'",
  "BIR RAMI ALKARD LFILAHI",
  "ECOLE SAFAA",
  "MOSQUE TAOUFIK ou HAMAM KAOUMIA",
  "LHANCHA PHARMACIE (IBN TOUFAIL)",
  "LHANCHA BIRAMI TAKWIN",
  "MAGHRIB ARABI (BANQUE POPULAIRE)",
  "CAFE SIGMA",
  "MIMOUZA (CIH BANQUE)",
  "NAFOURA",
  "SAL COUVERTE BIR RAMI",
  "ASSAM (KIADA)",
  "BAB FES / Inwi",
  "CAFE SPORTIF",
  "CROISEMENT NKHARHSSA",
  "MIZAN",
  "OLYMPIC ITIHAD",
  "ZONE FRANCHE OULED BOURAHMA",
  "ROND POINT LA ZONE",
  "ECOLE OULED BOUREHMA",
  "20 Août",
  "TAJHIZ AIN SEBAA MOSQUE ABU BAKR",
  "AIN SEBAA PONT",
  "AIN SEBAA (ROND POINT)",
  "AIN SEBAA TAHOUNA",
  "AIN SEBAA LBIR",
  "AMANA",
  "PHARMACIE NAKHIL",
  "CAFE NAKHLA",
  "MASJID AL RHOUFRAN",
  "PHARMACIE ALWAFA",
  "PHARMACIE MAGHRIB ARABI (WAFAA)",
  "QUACHLA",
  "WAFA 2 AMANA",
  "WAFA 4 CHÂTEAU",
  "WAFA 4 IBN ROCHED",
  "WAFAA ITIHAD NISWI",
  "CAFE BROJ",
  "PHARMACIE SMIRI",
  "CAFE NAJMA DAHBIYA",
  "FOUARAT (BANQUE CHAABI)",
  "FOUARAT (CAFE HIDAMOU)",
  "TERMINUS BUS ALBASSATIN",
  "TIHRON FEU ROUGE",
  "OULED AARFA (CAFE JAWHARAT RIF)",
  "OULED AARFA (Double voix) WIAM",
  "OULED AARFA (NAJMA DAHABIYA)",
  "OULED AARFA (PHARMACIE MOSSA)",
  "OULED AARFA TERMINUS 5",
  "PHARMACIE KHALID",
  "HALOUF (3 EME ) MEDIA BOUTIQUE",
  "ISKANDARIA",
  "KISARIYA (BANQUE POPULAIRE)",
  "MOSQUEE MILOUD",
  "OULED ARFA (TIRMINUS 12)",
  "PAAM (TIRMINUS 12)",
  "PHARMACIE NAKHIL",
  "ROND POINT ENTRER DE LA ZONE",
  "CAFE HIZAM",
  "SAKNIA LA RAK",
  "ATLASS",
  "ATLASS BMCE BANQUE",
  "CAFE WRIDA 'meditel'",
  "DAR CHABAB",
  "ECOLE MOKHTAR ESSOUSSI",
  "PHARMACIE BIS MILAH",
  "CAFE BILAL",
  "CHNANFA",
  "CREDIT AGRICOLE",
  "ECOLE ALMAARIFA (SIDI YAHIA )",
  "GENDARMERIE ROYALE",
  "HAMAM ALWAHDA",
  "PHARMACIE SIDI HYA LGHARB",
  "ECOLE ALWAHDA",
  "CAFE France",
  "HOTEL AMAL",
  "HAMAM RAHA",
  "ECOLE RHAWNA",
  "CAFE JDIAT",
  "MAROC TELECOM SY",
  "ADDOHA (MAHATA DAKH)",
  "CAFE INSAF",
  "PHARMACIE DEBBAGH",
  "ALIANCE TERMINUS BUS",
  "GROUPE 119 DOHA",
  "JARDIN ALIANCE",
  "TERAIN ALIANCE",
  "ISMAILIA CAFE OMAR",
  "ISMAILIA CAFE ANGELINA",
  "KASBA BANK CHAABI (ROND-POINT)",
  "KIYADA KASBA (KARD ALFILAHI)",
  "KIYADA KASBA (MAROC TELECOM)",
  "STATION IFRIQUIA (KASBA)",
  "SUPERMARCHE MERKAL",
  "TAIBIA 'LA POSTE '",
  "AUTRES"
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
<Image className="absolute left-5 top-5 " src="/logosvgnew.svg" width={120} height={60} alt="logo coficab" />
      <div className="flex gap-4 m-10">
        {/* <button 
          onClick={() => setFormType("attestation")}
          className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
            formType === "attestation"
              ? "bg-[#020495] text-white"
              : "bg-white text-[#020495] border border-[#020495]"
          }`}
        >
          Demande d&apos;attestation 
        </button> */}
        {/* <button
          onClick={() => setFormType("changement")}
          className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
            formType === "changement"
              ? "bg-[#020495] text-white"
              : "bg-white text-[#B87333] border border-[#B87333]"
          }`}
        >
          Changement des stations de transport
        </button> */}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        {formType === "attestation" ? (
           <form onSubmit={handleChangementSubmit} className="space-y-3">
            <h2 className="text-2xl font-semibold text-center mb-4 text-slate-800">
              Changement Des Stations De Transport
            </h2>
            {[
              "nom",
              "prenom",
              "email",
              "matricule",
            ].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                value={changementForm[field as keyof typeof changementForm] as string}
                onChange={handleChangementChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ))}

            {["ancienneParada", "nouvelleParada"].map((field) => (
              <input
                key={field}
                list="parada-list"
                name={field}
                placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                value={changementForm[field as keyof typeof changementForm] as string}
                onChange={handleChangementChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ))}
            <datalist id="parada-list">
              {paradas.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>

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
                  ? "bg-[#B87333] cursor-not-allowed"
                  : "bg-[#B87333] hover:bg-green-600"
              } text-white font-semibold py-2 rounded transition`}
            >
              {isSubmittingChangement ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        ) : (
        
           <form onSubmit={handleDemandeSubmit} className="space-y-3">
            <h2 className="text-2xl font-semibold text-center mb-4 text-slate-800">
              Demande d&apos;attestation
            </h2>
            {[
              { name: "nom", placeholder: "Nom" },
              { name: "prenom", placeholder: "Prénom" },
              { name: "email", placeholder: "Email", type: "email" },
              { name: "matricule", placeholder: "Matricule" },
              { name: "objet", placeholder: "Objet" },
            ].map(({ name, placeholder, type = "text" }) => (
              <input
                key={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={demandeForm[name as keyof typeof demandeForm] as string}
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

            <fieldset className="border border-gray-300 rounded px-3 py-2">
              <legend className="text-sm font-semibold">Attestations demandées</legend>
              {[
                "Attestation de Travail",
                "Attestation de Salaire",
                "Attestation de domicialisation de salaire",
                "Attestation de restitution de IR",
                "Bulletin de paie",
              ].map((att) => (
                <label key={att} className="block">
                  <input
                    type="checkbox"
                    name="attestations"
                    value={att}
                    checked={demandeForm.attestations.includes(att)}
                    onChange={handleDemandeChange}
                    className="mr-2"
                  />
                  {att}
                </label>
              ))}
            </fieldset>

            <button
              type="submit"
              disabled={isSubmittingDemande}
              className={`w-full ${
                isSubmittingDemande
                  ? "bg-[#020495] cursor-not-allowed"
                  : "bg-[#020495] hover:bg-blue-600"
              } text-white font-semibold py-2 rounded transition`}
            >
              {isSubmittingDemande ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
