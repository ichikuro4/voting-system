import { createSupabaseServerClient } from "@/lib/supabase";
import { getAllCommittees, getActiveCommitteeById } from "@/services/committees";
import { getElectionSettings } from "@/services/election";

const fallbackColors = ["#0f766e", "#0284c7", "#f59e0b", "#dc2626", "#7c3aed", "#16a34a"];

function roundPercentage(value) {
  return Number(value.toFixed(1));
}

export async function registerVote({ committeeId = null, voteBlank = false }) {
  const normalizedVoteBlank = Boolean(voteBlank);
  const normalizedCommitteeId = committeeId || null;

  if (!normalizedVoteBlank && !normalizedCommitteeId) {
    throw new Error("Debes seleccionar un comité o marcar voto en blanco.");
  }

  if (normalizedVoteBlank && normalizedCommitteeId) {
    throw new Error("El voto en blanco no debe incluir un comité.");
  }

  const settings = await getElectionSettings();

  if (!settings.is_open) {
    throw new Error("La votación se encuentra cerrada.");
  }

  if (!normalizedVoteBlank) {
    const committee = await getActiveCommitteeById(normalizedCommitteeId);

    if (!committee) {
      throw new Error("El comité seleccionado no está disponible.");
    }
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("votes")
    .insert({
      committee_id: normalizedVoteBlank ? null : normalizedCommitteeId,
      vote_blank: normalizedVoteBlank,
    })
    .select("id, committee_id, vote_blank, created_at")
    .single();

  if (error) {
    throw new Error("No se pudo guardar el voto en la base de datos.");
  }

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
    supabase.from("votes").select("committee_id, vote_blank"),
  ]);

  if (votes.error) {
    throw new Error("No se pudieron obtener los votos.");
  }

  const votesList = votes.data ?? [];
  const totalVotes = votesList.length;
  const blankVotes = votesList.filter((vote) => vote.vote_blank).length;
  const votesByCommittee = new Map();

  votesList.forEach((vote) => {
    if (!vote.vote_blank && vote.committee_id) {
      votesByCommittee.set(
        vote.committee_id,
        (votesByCommittee.get(vote.committee_id) || 0) + 1
      );
    }
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

  return {
    totalVotes,
    blankVotes,
    blankPercentage,
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
