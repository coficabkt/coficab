// Base interface shared by both types
export interface BaseDemande {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  status: string;
  createdAt: string;
  departement?: string; // department is a single string
}

// Attestation-specific interface
export interface DemandeAttestation extends BaseDemande {
  objet: string;
  attestations?: string[];
}

// Changement de parada-specific interface
export interface DemandeChangementParada extends BaseDemande {
  ancienneParada: string;
  nouvelleParada: string;
}
