import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readData, writeData } from "@/app/lib/fileStorage";
import { v4 as uuidv4 } from "uuid";

// 🔵 GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);
  const nom = searchParams.get("nom")?.toLowerCase();
  const prenom = searchParams.get("prenom")?.toLowerCase();
  const matricule = searchParams.get("matricule");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  let { DemandeChangementParada } = readData();

  if (nom)
    DemandeChangementParada = DemandeChangementParada.filter(item =>
      item.nom?.toLowerCase().includes(nom)
    );
  if (prenom)
    DemandeChangementParada = DemandeChangementParada.filter(item =>
      item.prenom?.toLowerCase().includes(prenom)
    );
  if (matricule)
    DemandeChangementParada = DemandeChangementParada.filter(item =>
      item.matricule?.includes(matricule)
    );
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    DemandeChangementParada = DemandeChangementParada.filter(item => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= from && createdAt <= to;
    });
  }

  const total = DemandeChangementParada.length;

  const paginated = DemandeChangementParada
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice((page - 1) * perPage, page * perPage);

  const enCours = DemandeChangementParada.filter(item => item.status === "en cours").length;
  const traite = DemandeChangementParada.filter(item => item.status === "traité").length;

  return NextResponse.json({ total, paginated, enCours, traite });
}

// 🔵 POST
export async function POST(req: Request) {
  const body = await req.json();
  const db = readData();

  const newDemande = {
    id: uuidv4(),
    ...body,
    status: body.status || "en cours",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.DemandeChangementParada.push(newDemande);
  writeData(db);

  return NextResponse.json(newDemande);
}

// 🔵 PATCH
export async function PATCH(req: Request) {
  const { id, status, nouvelleParada } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: "ID et statut requis." }, { status: 400 });
  }

  const db = readData();
  const index = db.DemandeChangementParada.findIndex(item => item.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const updatedDemande = {
    ...db.DemandeChangementParada[index],
    status,
    nouvelleParada: nouvelleParada || db.DemandeChangementParada[index].nouvelleParada,
    updatedAt: new Date().toISOString(),
  };

  db.DemandeChangementParada[index] = updatedDemande;
  writeData(db);

  let emailMessage = "Aucun email envoyé.";
  if (status === "traité" && updatedDemande.email) {
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
        to: updatedDemande.email,
        subject: "Mise à jour de votre demande",
        text: `Bonjour ${updatedDemande.prenom} ${updatedDemande.nom},\n\nVotre ancienne parada est : ${updatedDemande.ancienneParada}.\nVotre nouvelle parada est : ${updatedDemande.nouvelleParada}.\n\nCordialement,\nCoficab.`,
      });
      emailMessage = "Email envoyé avec succès !";
    } catch (error) {
      console.error("Erreur email:", error);
      emailMessage = "Erreur lors de l'envoi de l'email.";
    }
  }

  return NextResponse.json({
    message: "Mise à jour réussie.",
    emailStatus: emailMessage,
    updated: updatedDemande,
  });
}

// 🔵 DELETE
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID requis." }, { status: 400 });
  }

  const db = readData();
  const originalLength = db.DemandeChangementParada.length;
  db.DemandeChangementParada = db.DemandeChangementParada.filter(item => item.id !== id);

  if (db.DemandeChangementParada.length === originalLength) {
    return NextResponse.json({ error: "Demande non trouvée." }, { status: 404 });
  }

  writeData(db);
  return NextResponse.json({ message: "Demande supprimée avec succès." });
}
