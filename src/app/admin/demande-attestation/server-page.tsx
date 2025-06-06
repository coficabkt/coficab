import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatDistanceToNow } from "date-fns";
import { FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";
import { Prisma } from "@prisma/client";
import nodemailer from "nodemailer";

function highlight(text: string, search: string | null | undefined) {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200">{part}</mark>
    ) : (
      part
    )
  );
}

export default async function ServerPage({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);

  const filters: Prisma.DemandeAttestationWhereInput = {};
  const nom = searchParams.get("nom");
  const prenom = searchParams.get("prenom");
  const matricule = searchParams.get("matricule");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (nom) filters.nom = { contains: nom, mode: "insensitive" };
  if (prenom) filters.prenom = { contains: prenom, mode: "insensitive" };
  if (matricule) filters.matricule = { contains: matricule, mode: "insensitive" };
  if (dateFrom && dateTo) {
    filters.createdAt = {
      gte: new Date(dateFrom),
      lte: new Date(dateTo),
    };
  }

  const total = await prisma.demandeAttestation.count({ where: filters });
  const demandes = await prisma.demandeAttestation.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const enCours = await prisma.demandeAttestation.count({
    where: { ...filters, status: "en cours" },
  });
  const traite = await prisma.demandeAttestation.count({
    where: { ...filters, status: "traité" },
  });

  const searchParamsObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value) searchParamsObj[key] = value;
  });

  return (
    <main className="flex-1 p-4 space-y-6">
      <h1 className="text-2xl font-bold">Demandes d&apos;attestation</h1>

      {/* 🔍 Search Filter Form */}
      <form className="flex flex-wrap gap-4 bg-gray-100 p-4 rounded">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          defaultValue={nom || ""}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          defaultValue={prenom || ""}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          name="matricule"
          placeholder="Matricule"
          defaultValue={matricule || ""}
          className="border p-2 rounded flex-1"
        />
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom || ""}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo || ""}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Filtrer
        </button>
      </form>

      {/* 🔵 Filter Cards */}
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

      {/* Table */}
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left font-semibold whitespace-nowrap">
              <th>Nom</th>
              <th>Prénom</th>
              <th>Matricule</th>
              <th>Objet</th>
              <th>Email</th>
              <th>Status</th>
              <th>Créé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id} className="border-t">
                <td>{highlight(d.nom, nom)}</td>
                <td>{highlight(d.prenom, prenom)}</td>
                <td>{highlight(d.matricule, matricule)}</td>
                <td>{d.objet}</td>
                <td>{d.email}</td>
                <td>{d.status}</td>
                <td className="flex items-center gap-1 whitespace-nowrap">
                  <FaClock className="text-gray-500" />
                  {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                </td>
                <td className="flex gap-2 items-center flex-wrap whitespace-nowrap">
                  {d.status === "en cours" && (
                    <form
                      action={async () => {
                        "use server";
                        const updated = await prisma.demandeAttestation.update({
                          where: { id: d.id },
                          data: { status: "traité" },
                        });

                        // Send email when status updated
                        if (updated.email) {
                          const transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                              user: process.env.SMTP_USER!,
                              pass: process.env.SMTP_PASS!,
                            },
                          });
                          await transporter.sendMail({
                            from: `"Coficab Admin" <${process.env.SMTP_USER}>`,
                            to: updated.email,
                            subject: "Mise à jour de votre demande d'attestation",
                            text: `Bonjour ${updated.prenom},\n\nVotre demande a été mise à jour au statut : ${updated.status}.\n\nCordialement,\nCoficab`,
                          });
                        }

                        revalidatePath("/admin/demande-attestation");
                      }}
                    >
                      <button type="submit" title="Traiter">
                        <FaCheckCircle className="text-green-500 hover:text-green-700 transition" />
                      </button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await prisma.demandeAttestation.delete({
                        where: { id: d.id },
                      });
                      revalidatePath("/admin/demande-attestation");
                    }}
                  >
                    <button type="submit" title="Supprimer">
                      <FaTrash className="text-red-500 hover:text-red-700 transition" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <a
          href={`?${new URLSearchParams({
            ...searchParamsObj,
            page: (page - 1).toString(),
          })}`}
          className={`px-4 py-2 rounded ${
            page <= 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Précédent
        </a>
        <a
          href={`?${new URLSearchParams({
            ...searchParamsObj,
            page: (page + 1).toString(),
          })}`}
          className={`px-4 py-2 rounded ${
            page * perPage >= total
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Suivant
        </a>
      </div>
    </main>
  );
}
