"use client";
import styles from "@/app/page.module.scss";
import { TeamData } from "@/lib/types";

const ResultsTable: React.FC<{ results: { teams: string[]; resultsData: Record<string, Record<string, string>> } }> = ({ results }) => {
  const calculateTable = () => {
    const teams = results.teams;
    const resultsTable: Record<string, TeamData> = {}; // Explicitly define the type instead of using 'any'

    teams.forEach((team) => {
      resultsTable[team] = {
        played: 0,
        won: 0,
        drew: 0,
        lost: 0,
        for: 0,
        against: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    for (const team of teams) {
      const opponents = Object.keys(results.resultsData[team] || {});

      for (const opponent of opponents) {
        const score = results.resultsData[team][opponent];
        if (score) {
          const [homeScore, awayScore] = score.split("-").map(Number);

          resultsTable[team].played += 1;
          resultsTable[team].for += homeScore;
          resultsTable[team].against += awayScore;
          resultsTable[team].goalDifference += homeScore - awayScore;

          resultsTable[opponent].played += 1;
          resultsTable[opponent].for += awayScore;
          resultsTable[opponent].against += homeScore;
          resultsTable[opponent].goalDifference += awayScore - homeScore;

          if (homeScore > awayScore) {
            resultsTable[team].won += 1;
            resultsTable[team].points += 3;
            resultsTable[opponent].lost += 1;
          } else if (homeScore < awayScore) {
            resultsTable[opponent].won += 1;
            resultsTable[opponent].points += 3;
            resultsTable[team].lost += 1;
          } else {
            resultsTable[team].drew += 1;
            resultsTable[team].points += 1;
            resultsTable[opponent].drew += 1;
            resultsTable[opponent].points += 1;
          }
        }
      }
    }

    return Object.entries(resultsTable).sort(([, a], [, b]) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.for - a.for;
    });
  };

  const table = calculateTable();

  return (
    <table className={`${styles.resultsTable} ${styles.pointsTable}`}>
      <thead>
        <tr>
          <th>Team</th>
          <th>Played</th>
          <th>Won</th>
          <th>Drew</th>
          <th>Lost</th>
          <th>For</th>
          <th>Against</th>
          <th>GD</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {table.map(([team, data]) => (
          <tr key={team}>
            <td>
              <b>{team}</b>
            </td>
            <td>{data.played}</td>
            <td>{data.won}</td>
            <td>{data.drew}</td>
            <td>{data.lost}</td>
            <td>{data.for}</td>
            <td>{data.against}</td>
            <td>{data.goalDifference}</td>
            <td>{data.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable;
