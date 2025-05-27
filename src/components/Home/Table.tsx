import React from "react";
import styles from "@/app/page.module.scss";
import ScoreInput from "@/components/ScoreInput/ScoreInput";
import DeleteIcon from "../Delete/DeleteIcon";
import { usePathname } from "next/navigation";

interface TableProps {
  results: {
    teams: string[];
    resultsData: Record<string, Record<string, string>>;
  };
  handleScoreChange: (
    homeTeam: string,
    awayTeam: string,
    newScore: string
  ) => void;
  handleDeleteTeam: (team: string) => void;
}

const Table: React.FC<TableProps> = ({ results, handleScoreChange, handleDeleteTeam }) => {

  console.log("Table results:", results);

  const pathName = usePathname();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Home/Away</th>
            {results.teams.map((team, index) => (
              <th key={index} className={styles.headerCell}>
                {team} (away)
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.teams.map((team, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              <td className={styles.teamCell}>
                {team} (home) {pathName === "/Kiosk" && (
                  <DeleteIcon
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteTeam(team)}
                  />
                )}
              </td>
              {results.teams.map((opponent, colIndex) => (
                <td
                  key={colIndex}
                  className={`${styles.resultCell} ${
                    team === opponent && styles.selfMatch
                  }`}
                >
                  {team !== opponent && (
                    <ScoreInput
                      score={results.resultsData[team]?.[opponent] || "-"}
                      homeTeam={team}
                      awayTeam={opponent}
                      onChange={handleScoreChange}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;