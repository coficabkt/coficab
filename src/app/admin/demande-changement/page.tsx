import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const {
      nom = "",
      prenom = "",
      matricule = "",
      dateFrom = "",
      dateTo = "",
      page = "1",
      perPage = "10",
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(perPage as string);
    const take = parseInt(perPage as string);

    const where: Prisma.DemandeChangementParadaWhereInput = {
      nom: { contains: nom as string, mode: "insensitive" },
      prenom: { contains: prenom as string, mode: "insensitive" },
      matricule: { contains: matricule as string, mode: "insensitive" },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [total, enCours, traite, paginated] = await Promise.all([
      prisma.demandeChangementParada.count({ where }),
      prisma.demandeChangementParada.count({ where: { ...where, status: "en cours" } }),
      prisma.demandeChangementParada.count({ where: { ...where, status: "traité" } }),
      prisma.demandeChangementParada.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.status(200).json({ total, enCours, traite, paginated });
  }

  if (req.method === "PATCH") {
    const { id, status, nouvelleParada } = req.body;

    if (!id) return res.status(400).json({ message: "Missing ID" });

    const dataToUpdate: Prisma.DemandeChangementParadaUpdateInput = {};
    if (status) dataToUpdate.status = status;
    if (nouvelleParada !== undefined) dataToUpdate.nouvelleParada = nouvelleParada;

    const updated = await prisma.demandeChangementParada.updateMany({
      where: { id },
      data: dataToUpdate,
    });

    return updated.count > 0
      ? res.status(200).json({ message: "Updated successfully" })
      : res.status(404).json({ message: "Not found" });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Missing ID" });

    const deleted = await prisma.demandeChangementParada.deleteMany({ where: { id } });

    return deleted.count > 0
      ? res.status(200).json({ message: "Deleted successfully" })
      : res.status(404).json({ message: "Not found" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
