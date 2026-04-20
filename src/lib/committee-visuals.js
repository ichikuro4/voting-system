const committeeVisualConfig = {
  "Lista N° 1 - Maria Luisa Oliva Vásquez": {
    logoLabel: "UE",
    candidateImageSrc: "/Candidata%201.webp",
  },
  "Lista N° 2 - Sol De María Anticona Gutiérrez": {
    logoLabel: "BRX",
    candidateImageSrc: "/Candidata%202.webp",
  },
  "Union Estudiantil": {
    logoLabel: "UE",
    candidateImageSrc: "/Candidata%201.webp",
  },
  BRUNEX: {
    logoLabel: "BRX",
    candidateImageSrc: "/Candidata%202.webp",
  },
};

function getFallbackVisualByName(name) {
  const normalizedName = name.toLowerCase();

  if (
    name.includes("Lista N° 1") ||
    name.includes("Lista N 1") ||
    normalizedName.includes("union estudiantil") ||
    normalizedName.includes("unión estudiantil")
  ) {
    return {
      logoLabel: "UE",
      candidateImageSrc: "/Candidata%201.webp",
    };
  }

  if (
    name.includes("Lista N° 2") ||
    name.includes("Lista N 2") ||
    normalizedName.includes("brunex")
  ) {
    return {
      logoLabel: "BRX",
      candidateImageSrc: "/Candidata%202.webp",
    };
  }

  return {};
}

export function getCommitteeVisualData(committeeName) {
  if (!committeeName) {
    return {};
  }

  return committeeVisualConfig[committeeName] || getFallbackVisualByName(committeeName);
}

export function getCandidateDisplayName(committeeName) {
  if (!committeeName) {
    return "";
  }

  const separatorIndex = committeeName.indexOf(" - ");

  if (separatorIndex === -1) {
    return committeeName;
  }

  return committeeName.slice(separatorIndex + 3).trim();
}

export function getListDisplayName(committeeName) {
  if (!committeeName) {
    return "";
  }

  if (
    committeeName.includes("Lista N° 1") ||
    committeeName.includes("Lista N 1") ||
    committeeName.toLowerCase().includes("union estudiantil") ||
    committeeName.toLowerCase().includes("unión estudiantil")
  ) {
    return "Union Estudiantil";
  }

  if (
    committeeName.includes("Lista N° 2") ||
    committeeName.includes("Lista N 2") ||
    committeeName.toLowerCase().includes("brunex")
  ) {
    return "BRUNEX";
  }

  const separatorIndex = committeeName.indexOf(" - ");

  if (separatorIndex === -1) {
    return committeeName;
  }

  return committeeName.slice(0, separatorIndex).trim();
}
