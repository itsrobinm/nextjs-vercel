import { results } from "@/globals/globals";
import { Table, TeamData } from "@/lib/types";
import { isValidScore } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({results, table: calculateTable()}, { status: 200 });
}

export async function PUT(req: Request) {
  const { team }: { team: string } = await req.json();

  if (!team || team.length < 1 || team.length > 20 || !/^[A-Za-z0-9]+$/.test(team) || Object.keys(results).length > 7) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (results[team]) {
    return NextResponse.json({ error: "Team already exists" }, { status: 400 });
  }

  results[team] = {};

  revalidatePath("/");
  return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function PATCH(req: Request) {
  const {
    score,
    homeTeam,
    awayTeam,
  }: { homeTeam: string; score: string; awayTeam: string } = await req.json();

  if (
    !score ||
    !homeTeam ||
    !awayTeam ||
    isValidScore(Number(score.split("-")[0])) === false ||
    isValidScore(Number(score.split("-")[1])) === false
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  results[homeTeam][awayTeam] = score;

  revalidatePath("/");
  return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: Request) {
  const { team }: { team: string } = await req.json();
  if (!team || !results[team] || Object.keys(results).length <= 2) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  delete results[team];
  // Remove all matches against this team
  for (const opponent of Object.keys(results)) {
    if (results[opponent][team]) {
      delete results[opponent][team];
    }
  }
  revalidatePath("/");
  return NextResponse.json({ message: "Success" }, { status: 200 });
}

function calculateTable(): Table{
  const teams = Object.keys(results);
  const resultsTable : Record<string, TeamData>  = {};

  teams.forEach((team) => {
    resultsTable[team] = initialiseTeamData();
  });

  for (const team of teams) {
    const opponents = Object.keys(results[team]);

    if (opponents.length > 0) {
      for (const opponent of opponents) {
        if (results[team][opponent]) {
          const score = results[team][opponent];
          const homeScore = Number(score.split("-")[0]);
          const awayScore = Number(score.split("-")[1]);

          resultsTable[team].played += 1;
          resultsTable[team].for += homeScore;
          resultsTable[team].against += awayScore;
          resultsTable[team].goalDifference += homeScore - awayScore;

          resultsTable[opponent].played += 1;
          resultsTable[opponent].for += awayScore;
          resultsTable[opponent].against += homeScore;
          resultsTable[opponent].goalDifference += awayScore - homeScore;

          if(homeScore > awayScore) {
            resultsTable[team].won += 1;
            resultsTable[team].points += 3; // Win gives 3 points 
            resultsTable[opponent].lost += 1; // Opponent loses
          } else if (homeScore < awayScore) {
            resultsTable[opponent].won += 1;
            resultsTable[opponent].points += 3; // Opponent wins
            resultsTable[team].lost += 1; // Team loses
          } else {
            resultsTable[team].points += 1; // Draw gives 1 point
            resultsTable[opponent].points += 1; // Opponent also gets 1 point
            resultsTable[team].drew += 1;
            resultsTable[opponent].drew += 1;
          }
        }
      }
    }
  }

  // Sort teams by points, goal difference, and goals for
  const sortedTeams = Object.entries(resultsTable).sort(([, a], [, b]) => {
    if (b.points !== a.points) {
      return b.points - a.points; // Sort by points
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference; // Sort by goal difference
    }
    return b.for - a.for; // Sort by goals for
  }
  );

  // Convert sorted array back to object
  const sortedResultsTable: Table = {};
  sortedTeams.forEach(([team, data]) => {
    sortedResultsTable[team] = data;
  }
  );
  return sortedResultsTable;


}

function initialiseTeamData(): TeamData {
  const teamData: TeamData = {
    won: 0,
    lost: 0,
    points: 0,
    goalDifference: 0,
    for: 0,
    against: 0,
    played: 0,
    drew: 0
  };

  return { ...teamData };
}
