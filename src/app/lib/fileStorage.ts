import fs from "fs";
import path from "path";
import { Database } from "../../types"; // ⬅️ Only keep what's used

const DATA_PATH = path.join(process.cwd(), "data.json");

export function readData(): Database {
  if (!fs.existsSync(DATA_PATH)) {
    return {
      DemandeAttestation: [],
      DemandeChangementParada: [],
    };
  }

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return {
      DemandeAttestation: parsed.DemandeAttestation || [],
      DemandeChangementParada: parsed.DemandeChangementParada || [],
    };
  } catch (error) {
    console.error("Erreur de parsing JSON:", error);
    return {
      DemandeAttestation: [],
      DemandeChangementParada: [],
    };
  }
}

export function writeData(data: Database): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
