const committeeVisualConfig = {
  "Lista N° 1 - Maria Luisa Oliva Vásquez": {
    logoLabel: "LD",
    imageSrc: "/Candidata%201.webp",
  },
  "Lista N° 2 - Sol De María Anticona Gutiérrez": {
    logoLabel: "ELUN",
    imageSrc: "/Candidata%202.webp",
  },
};

function getFallbackVisualByName(name) {
  if (name.includes("Lista N° 1") || name.includes("Lista N 1")) {
    return {
      logoLabel: "LD",
      imageSrc: "/Candidata%201.webp",
    };
  }

  if (name.includes("Lista N° 2") || name.includes("Lista N 2")) {
    return {
      logoLabel: "ELUN",
      imageSrc: "/Candidata%202.webp",
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

  const separatorIndex = committeeName.indexOf(" - ");

  if (separatorIndex === -1) {
    return committeeName;
  }

  return committeeName.slice(0, separatorIndex).trim();
}
