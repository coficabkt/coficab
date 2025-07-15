import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

// 🔸 GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);
  const nom = searchParams.get("nom")?.toLowerCase();
  const prenom = searchParams.get("prenom")?.toLowerCase();
  const matricule = searchParams.get("matricule");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const filters: Prisma.DemandeChangementParadaWhereInput = {};
  if (nom) filters.nom = { contains: nom, mode: "insensitive" };
  if (prenom) filters.prenom = { contains: prenom, mode: "insensitive" };
  if (matricule) filters.matricule = { contains: matricule, mode: "insensitive" };
  if (dateFrom || dateTo) {
    filters.createdAt = {};
    if (dateFrom) filters.createdAt.gte = new Date(dateFrom);
    if (dateTo) filters.createdAt.lte = new Date(dateTo);
  }

  const [total, enCours, traite, demandes] = await Promise.all([
    prisma.demandeChangementParada.count({ where: filters }),
    prisma.demandeChangementParada.count({ where: { ...filters, status: "en cours" } }),
    prisma.demandeChangementParada.count({ where: { ...filters, status: "traité" } }),
    prisma.demandeChangementParada.findMany({
      where: filters,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ total, demandes, enCours, traite });
}

// 🔸 POST
export async function POST(req: Request) {
  const body = await req.json();

  const newDemande = await prisma.demandeChangementParada.create({
    data: {
      ...body,
      status: body.status || "en cours",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(newDemande);
}

// 🔸 PATCH
export async function PATCH(req: Request) {
  const { id, status, nouvelleParada } = await req.json();

  if (!id || (!status && !nouvelleParada)) {
    return NextResponse.json(
      { error: "ID et au moins une mise à jour requise." },
      { status: 400 }
    );
  }

  const updated = await prisma.demandeChangementParada.update({
    where: { id },
    data: {
      status: status || undefined,
      nouvelleParada: nouvelleParada || undefined,
      updatedAt: new Date(),
    },
  });

  let emailMessage = "Aucun email envoyé.";

  if ((status === "traité" || updated.status === "traité") && updated.email) {
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
        to: updated.email,
        subject: "Mise à jour de votre demande",
        text: `Bonjour ${updated.prenom} ${updated.nom},\n\nVotre demande a été ${updated.status}.\n\nAncienne parada : ${updated.ancienneParada}\nNouvelle parada : ${updated.nouvelleParada}\n\nCordialement,\nHR Services.`,
      });
      emailMessage = "Email envoyé avec succès !";
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erreur email:", error.message);
      } else {
        console.error("Erreur email inconnue:", error);
      }
      emailMessage = "Erreur lors de l'envoi de l'email.";
    }
  }

  return NextResponse.json({
    message: "Mise à jour réussie.",
    emailStatus: emailMessage,
    updated,
  });
}

// 🔸 DELETE
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID requis." }, { status: 400 });
  }

  const deleted = await prisma.demandeChangementParada.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Demande supprimée avec succès.",
    deleted,
  });
}
