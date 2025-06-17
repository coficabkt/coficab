import { NextResponse } from "next/server";
import { readData, writeData } from "@/app/lib/fileStorage";
import nodemailer from "nodemailer";
import { DemandeAttestation } from "@/types";

// GET: Filter & Pagination
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);

  const filters = {
    nom: searchParams.get("nom")?.toLowerCase(),
    prenom: searchParams.get("prenom")?.toLowerCase(),
    matricule: searchParams.get("matricule")?.toLowerCase(),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
  };

  try {
    const db = readData();
    const all = db.DemandeAttestation || [];

    const demandes = all.filter((d: DemandeAttestation) => {
      const matchNom = !filters.nom || d.nom.toLowerCase().includes(filters.nom);
      const matchPrenom = !filters.prenom || d.prenom.toLowerCase().includes(filters.prenom);
      const matchMatricule = !filters.matricule || d.matricule.toLowerCase().includes(filters.matricule);
      const createdAt = new Date(d.createdAt);
      const matchDate =
        (!filters.dateFrom || createdAt >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || createdAt <= new Date(filters.dateTo));
      return matchNom && matchPrenom && matchMatricule && matchDate;
    });

    const total = demandes.length;
    const paginated = demandes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((page - 1) * perPage, page * perPage);

    const enCours = demandes.filter((d) => d.status === "en cours").length;
    const traite = demandes.filter((d) => d.status === "traité").length;

    return NextResponse.json({ total, demandes: paginated, enCours, traite });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 });
  }
}

// POST: Create
export async function POST(req: Request) {
  const data = await req.json();

  try {
    const db = readData();
    const demandes = db.DemandeAttestation || [];

    const newEntry: DemandeAttestation = {
      ...data,
      id: crypto.randomUUID(),
      status: data.status || "en cours",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demandes.push(newEntry);
    db.DemandeAttestation = demandes;
    writeData(db);

    return NextResponse.json(newEntry);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
  }
}

// PATCH: Update status and send email
export async function PATCH(req: Request) {
  const { id, status }: { id: string; status: string } = await req.json();

  try {
    const db = readData();
    const demandes = db.DemandeAttestation || [];
    const demande = demandes.find((d) => d.id === id);

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée." }, { status: 404 });
    }

    demande.status = status;
    demande.updatedAt = new Date().toISOString();
    db.DemandeAttestation = demandes;
    writeData(db);

    let emailMessage = "Aucun email envoyé.";

    if (status === "traité" && demande.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      try {
        await transporter.sendMail({
          from: `"Service RH" <${process.env.SMTP_USER}>`,
<<<<<<< HEAD
          to: demande.email,
=======
          to: updated.email,
>>>>>>> 319e0a1dd3d43c0c474afb79499dc71335505adf
          subject: "Mise à jour de votre demande d'attestation",
          text: `Bonjour ${demande.prenom} ${demande.nom},\n\nVotre demande est maintenant : ${demande.status} vos documents sont disponibles.\n\ncoordialement\n coficab.`,
        });

        emailMessage = "Email envoyé avec succès !";
      } catch {
        emailMessage = "Erreur lors de l'envoi de l'email.";
      }
    }

    return NextResponse.json({ updated: demande, emailStatus: emailMessage });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

// DELETE: Delete demande
export async function DELETE(req: Request) {
  const { id }: { id: string } = await req.json();

  try {
    const db = readData();
    const demandes = db.DemandeAttestation || [];
    const index = demandes.findIndex((d) => d.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Demande non trouvée." }, { status: 404 });
    }

    demandes.splice(index, 1);
    db.DemandeAttestation = demandes;
    writeData(db);

    return NextResponse.json({ message: "Demande supprimée avec succès." });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
