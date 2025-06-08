import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import nodemailer from "nodemailer";

// POST: Send email for a demande
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID requis pour l'envoi d'email" },
        { status: 400 }
      );
    }

    const demande = await prisma.demandeAttestation.findUnique({
      where: { id },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    if (!demande.email) {
      return NextResponse.json({ error: "Pas d'email pour cette demande." });
    }

    // Prepare email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Coficab Admin" <${process.env.SMTP_USER}>`,
      to: demande.email,
      subject: "Notification de votre demande",
      text: `Bonjour ${demande.prenom},\n\nVotre demande a été mise à jour au statut : ${demande.status}.\n\nCordialement,\nCoficab`,
    });

    console.log("✅ Email envoyé à :", demande.email);

    return NextResponse.json({ message: "Email envoyé avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
