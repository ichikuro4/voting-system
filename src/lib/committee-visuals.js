const committeeVisualConfig = {
  "Lista N° 1 - Maria Luisa Oliva Vásquez": {
    logoLabel: "UE",
    logoImageSrc: "/lista-2-logo.png",
    candidateImageSrc: "/lista-1-foto.webp",
  },
  "Lista N° 2 - Sol De María Anticona Gutiérrez": {
    logoLabel: "BRX",
    logoImageSrc: "/lista-1-logo.png",
    candidateImageSrc: "/lista-2-foto.webp",
  },
  "Union Estudiantil": {
    logoLabel: "UE",
    logoImageSrc: "/lista-2-logo.png",
    candidateImageSrc: "/lista-1-foto.webp",
  },
  BRUNEX: {
    logoLabel: "BRX",
    logoImageSrc: "/lista-1-logo.png",
    candidateImageSrc: "/lista-2-foto.webp",
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
      logoImageSrc: "/lista-2-logo.png",
      candidateImageSrc: "/lista-1-foto.webp",
    };
  }

  if (
    name.includes("Lista N° 2") ||
    name.includes("Lista N 2") ||
    normalizedName.includes("brunex")
  ) {
    return {
      logoLabel: "BRX",
      logoImageSrc: "/lista-1-logo.png",
      candidateImageSrc: "/lista-2-foto.webp",
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
