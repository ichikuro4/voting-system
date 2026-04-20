import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import { MESA_OPTIONS } from "@/lib/mesa-config";
import { getAllCommittees, getActiveCommitteeById } from "@/services/committees";
import { getElectionSettings } from "@/services/election";
import { assertVoterCanVote, markVoterAsVoted } from "@/services/voter-access";

const fallbackColors = ["#0f766e", "#0284c7", "#f59e0b", "#dc2626", "#7c3aed", "#16a34a"];

function roundPercentage(value) {
  return Number(value.toFixed(1));
}

function buildMesaBreakdownMap(committees) {
  const activeCommittees = committees.filter((committee) => committee.active);
  const map = new Map();

  MESA_OPTIONS.forEach((mesa) => {
    map.set(mesa.mesaNumero, {
      mesaNumero: mesa.mesaNumero,
      mesaAula: mesa.mesaAula,
      totalVotes: 0,
      blankVotes: 0,
      votesByCommittee: new Map(activeCommittees.map((committee) => [committee.id, 0])),
    });
  });

  return map;
}

export async function registerVote({ dni, committeeId = null, voteBlank = false }) {
  const normalizedVoteBlank = Boolean(voteBlank);
  const normalizedCommitteeId = committeeId || null;
  const normalizedDni = await assertVoterCanVote(dni);

  if (!normalizedVoteBlank && !normalizedCommitteeId) {
    throw new Error("Debes seleccionar una lista o marcar voto en blanco.");
  }

  if (normalizedVoteBlank && normalizedCommitteeId) {
    throw new Error("El voto en blanco no debe incluir una lista.");
  }

  const settings = await getElectionSettings();

  if (!settings.is_open) {
    throw new Error("La votación se encuentra cerrada.");
  }

  if (!normalizedVoteBlank) {
    const committee = await getActiveCommitteeById(normalizedCommitteeId);

    if (!committee) {
      throw new Error("La lista seleccionada no está disponible.");
    }
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("votes")
    .insert({
      student_dni: normalizedDni,
      committee_id: normalizedVoteBlank ? null : normalizedCommitteeId,
      vote_blank: normalizedVoteBlank,
    })
    .select("id, student_dni, committee_id, vote_blank, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este documento ya votó.");
    }

    throw new Error("No se pudo guardar el voto en la base de datos.");
  }

  await markVoterAsVoted(normalizedDni);

  return data;
}

export async function getTotalVotes() {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error("No se pudo calcular el total de votos.");
  }

  return count ?? 0;
}

export async function getVotingResults() {
  const supabase = createSupabaseServerClient();
  const [committees, votes] = await Promise.all([
    getAllCommittees(),
    supabase.from("votes").select("committee_id, vote_blank, student_dni"),
  ]);

  if (votes.error) {
    throw new Error("No se pudieron obtener los votos.");
  }

  const votesList = votes.data ?? [];
  const totalVotes = votesList.length;
  const blankVotes = votesList.filter((vote) => vote.vote_blank).length;
  const votesByCommittee = new Map();
  const mesaBreakdownMap = buildMesaBreakdownMap(committees);
  let votesWithoutMesa = 0;

  const uniqueDnis = Array.from(
    new Set(votesList.map((vote) => vote.student_dni).filter(Boolean))
  );
  const mesaByDni = new Map();

  if (uniqueDnis.length) {
    const { data: voterAccessRows, error: voterAccessError } = await supabase
      .from("voter_access")
      .select("dni, mesa_numero, mesa_aula")
      .in("dni", uniqueDnis);

    if (voterAccessError) {
      throw new Error("No se pudo obtener la información de mesas.");
    }

    (voterAccessRows ?? []).forEach((entry) => {
      mesaByDni.set(entry.dni, {
        mesa_numero: entry.mesa_numero,
        mesa_aula: entry.mesa_aula,
      });
    });
  }

  votesList.forEach((vote) => {
    if (!vote.vote_blank && vote.committee_id) {
      votesByCommittee.set(
        vote.committee_id,
        (votesByCommittee.get(vote.committee_id) || 0) + 1
      );
    }

    const mesaEntry = mesaByDni.get(vote.student_dni);
    const mesaNumero = Number(mesaEntry?.mesa_numero);
    const mesaBreakdown = mesaBreakdownMap.get(mesaNumero);

    if (mesaBreakdown) {
      mesaBreakdown.totalVotes += 1;

      if (vote.vote_blank || !vote.committee_id) {
        mesaBreakdown.blankVotes += 1;
      } else {
        mesaBreakdown.votesByCommittee.set(
          vote.committee_id,
          (mesaBreakdown.votesByCommittee.get(vote.committee_id) || 0) + 1
        );
      }

      return;
    }

    votesWithoutMesa += 1;
  });

  const resultsByCommittee = committees
    .map((committee, index) => {
      const committeeVotes = votesByCommittee.get(committee.id) || 0;
      const percentage = totalVotes === 0 ? 0 : roundPercentage((committeeVotes / totalVotes) * 100);

      return {
        id: committee.id,
        name: committee.name,
        short_description: committee.short_description,
        active: committee.active,
        color: committee.color || fallbackColors[index % fallbackColors.length],
        votes: committeeVotes,
        percentage,
      };
    })
    .sort((left, right) => {
      if (right.votes !== left.votes) {
        return right.votes - left.votes;
      }

      return left.name.localeCompare(right.name);
    });

  const topVoteCount = resultsByCommittee[0]?.votes || 0;
  const leaders =
    topVoteCount > 0
      ? resultsByCommittee.filter((committee) => committee.votes === topVoteCount)
      : [];

  const blankPercentage = totalVotes === 0 ? 0 : roundPercentage((blankVotes / totalVotes) * 100);
  const activeCommitteeCatalog = committees
    .filter((committee) => committee.active)
    .map((committee, index) => ({
      id: committee.id,
      name: committee.name,
      color: committee.color || fallbackColors[index % fallbackColors.length],
    }));
  const mesaBreakdown = MESA_OPTIONS.map((mesa) => {
    const breakdown = mesaBreakdownMap.get(mesa.mesaNumero);
    const mesaTotalVotes = breakdown?.totalVotes || 0;
    const mesaBlankVotes = breakdown?.blankVotes || 0;

    const chartData = [
      ...activeCommitteeCatalog.map((committee) => {
        const committeeVotes = breakdown?.votesByCommittee.get(committee.id) || 0;
        const committeePercentage =
          mesaTotalVotes === 0 ? 0 : roundPercentage((committeeVotes / mesaTotalVotes) * 100);

        return {
          name: committee.name,
          votes: committeeVotes,
          percentage: committeePercentage,
          color: committee.color,
        };
      }),
      {
        name: "Voto en blanco",
        votes: mesaBlankVotes,
        percentage: mesaTotalVotes === 0 ? 0 : roundPercentage((mesaBlankVotes / mesaTotalVotes) * 100),
        color: "#94a3b8",
      },
    ];

    return {
      mesaNumero: mesa.mesaNumero,
      mesaAula: mesa.mesaAula,
      votes: mesaTotalVotes,
      blankVotes: mesaBlankVotes,
      chartData,
    };
  });
  const votesByMesa = mesaBreakdown.map((mesa) => ({
    mesaNumero: mesa.mesaNumero,
    mesaAula: mesa.mesaAula,
    votes: mesa.votes,
  }));

  return {
    totalVotes,
    blankVotes,
    blankPercentage,
    votesByMesa,
    mesaBreakdown,
    votesWithoutMesa,
    resultsByCommittee,
    leaders,
    chartData: [
      ...resultsByCommittee.map((committee) => ({
        name: committee.name,
        votes: committee.votes,
        percentage: committee.percentage,
        color: committee.color,
      })),
      {
        name: "Voto en blanco",
        votes: blankVotes,
        percentage: blankPercentage,
        color: "#94a3b8",
      },
    ],
  };
}

export async function resetAllVotes() {
  const supabase = createSupabaseAdminClient();
  const [{ count: votesCount, error: votesCountError }, { count: voterCount, error: voterCountError }] =
    await Promise.all([
      supabase.from("votes").select("*", { count: "exact", head: true }),
      supabase.from("voter_access").select("*", { count: "exact", head: true }),
    ]);

  if (votesCountError) {
    throw new Error("No se pudo contar los votos antes de reiniciar.");
  }

  if (voterCountError) {
    throw new Error("No se pudo contar los documentos antes de reiniciar.");
  }

  const { error: deleteVotesError } = await supabase
    .from("votes")
    .delete()
    .not("id", "is", null);

  if (deleteVotesError) {
    throw new Error("No se pudo reiniciar la votación.");
  }

  const { error: deleteVoterAccessError } = await supabase
    .from("voter_access")
    .delete()
    .not("dni", "is", null);

  if (deleteVoterAccessError) {
    throw new Error("No se pudo limpiar el registro de documentos.");
  }

  return {
    deletedVotes: votesCount ?? 0,
    deletedDniRecords: voterCount ?? 0,
  };
}

export async function getVotesForExport() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("votes")
    .select("id, student_dni, committee_id, vote_blank, created_at, committees(name)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("No se pudieron obtener los votos para exportar.");
  }

  const votes = data ?? [];
  const uniqueDnis = Array.from(new Set(votes.map((vote) => vote.student_dni).filter(Boolean)));
  const mesaByDni = new Map();

  if (uniqueDnis.length) {
    const { data: voterAccessData, error: voterAccessError } = await supabase
      .from("voter_access")
      .select("dni, mesa_numero, mesa_aula")
      .in("dni", uniqueDnis);

    if (voterAccessError) {
      throw new Error("No se pudieron obtener las mesas para exportación.");
    }

    (voterAccessData ?? []).forEach((entry) => {
      mesaByDni.set(entry.dni, entry);
    });
  }

  return votes.map((vote) => {
    const committee = Array.isArray(vote.committees) ? vote.committees[0] : vote.committees;
    const mesaInfo = mesaByDni.get(vote.student_dni);

    return {
      id: vote.id,
      student_dni: vote.student_dni,
      created_at: vote.created_at,
      vote_blank: vote.vote_blank,
      committee_id: vote.committee_id,
      committee_name: committee?.name || "",
      mesa_numero: mesaInfo?.mesa_numero ?? null,
      mesa_aula: mesaInfo?.mesa_aula ?? "",
    };
  });
}
