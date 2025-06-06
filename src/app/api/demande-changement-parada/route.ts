import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import nodemailer from "nodemailer";

// 🔵 GET: Filtering, Pagination, and Stats
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);

  const filters: Prisma.DemandeChangementParadaWhereInput = {};

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

  try {
    const total = await prisma.demandeChangementParada.count({ where: filters });

    const demandes = await prisma.demandeChangementParada.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const enCours = await prisma.demandeChangementParada.count({
      where: { ...filters, status: "en cours" },
    });

    const traite = await prisma.demandeChangementParada.count({
      where: { ...filters, status: "traité" },
    });

    return NextResponse.json({
      total,
      demandes,
      enCours,
      traite,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données." },
      { status: 500 }
    );
  }
}

// 🔵 POST: Create a new demande
export async function POST(req: Request) {
  const data = await req.json();

  try {
    const created = await prisma.demandeChangementParada.create({
      data: {
        ...data,
        status: data.status || "en cours",
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création." },
      { status: 500 }
    );
  }
}

// 🔵 PATCH: Update status and send email if needed
export async function PATCH(req: Request) {
  const { id, status, nouvelleParada } = await req.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID et statut requis." },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.demandeChangementParada.update({
      where: { id },
      data: { status, nouvelleParada },
    });

    let emailMessage = "Aucun email envoyé : pas d'adresse email fournie.";

    if (status === "traité" && updated.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      try {
        await transporter.sendMail({
          from: `"Touil Brahim Service RH" <${process.env.SMTP_USER}>`,
          to: updated.email,
          subject: "Mise à jour de votre demande de changement de parada",
          text: `Bonjour ${updated.prenom} ${updated.nom},\n\nVotre demande de changement de parada a été traitée avec succès. Votre nouvelle parada est : ${updated.nouvelleParada}.\n\nCordialement,\nCoficab`,
        });

        emailMessage = "Email envoyé avec succès !";
        console.log("✅ Email envoyé à :", updated.email);
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email :", emailError);
        emailMessage = "Erreur lors de l'envoi de l'email.";
      }
    }

    return NextResponse.json({
      message: "Mise à jour réussie.",
      emailStatus: emailMessage,
      updated,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

// 🔵 DELETE: Delete a demande
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "ID requis pour la suppression." },
      { status: 400 }
    );
  }

  try {
    await prisma.demandeChangementParada.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Demande supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
