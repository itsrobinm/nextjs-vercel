// Create a new client-side component for the score input fields
"use client";

import { TextField } from "@mui/material";
import styles from "@/app/page.module.scss";
import { useState } from "react";
import { isValidScore } from "@/lib/validators";
import { usePathname } from "next/navigation";

interface ScoreInputProps {
  score: string | null;
  homeTeam: string;
  awayTeam: string;
  onChange: (homeTeam: string, awayTeam: string, newScore: string) => void;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  score,
  homeTeam,
  awayTeam,
  onChange,
}) => {
  // Ensure `score` is a string before calling `split`
  const [homeScoreInit, awayScoreInit] =
    typeof score === "string" ? score.split("-") : ["", ""];

  const pathName = usePathname();
  //console.log("Pathname:", pathName);

  const [scoreState, setScoreState] = useState({
    homeScore: homeScoreInit,
    awayScore: awayScoreInit,
  });

  return (
    <div className={styles.scoreBox}>
      <TextField
        value={scoreState.homeScore}
        placeholder="0"
        type="number"
        slotProps={{
          input: {
            readOnly: pathName !== "/Kiosk",
          },
        }}
        onChange={(e) => {
          const newScore = e.target.value;

          if (!isValidScore(Number(newScore))) return;

          fetch("/api/results", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: `${newScore}-${
                scoreState.awayScore ? scoreState.awayScore : "0"
              }`,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
            }),
          }).then((res) => {
            if (res.ok) {
              setScoreState((prevState) => ({
                ...prevState,
                homeScore: newScore,
                awayScore: prevState.awayScore ? prevState.awayScore : "0",
              }));
              onChange(
                homeTeam,
                awayTeam,
                `${newScore}-${
                  scoreState.awayScore ? scoreState.awayScore : "0"
                }`
              );
            }
          });
        }}
      />
      <div className={styles.dash}>-</div>
      <TextField
        value={scoreState.awayScore}
        placeholder="0"
        onChange={(e) => {
          const newScore = e.target.value;

          if (!isValidScore(Number(newScore))) return;

          fetch("/api/results", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: `${
                scoreState.homeScore ? scoreState.homeScore : "0"
              }-${newScore}`,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
            }),
          }).then((res) => {
            if (res.ok) {
              setScoreState((prevState) => ({
                homeScore: prevState.homeScore ? prevState.homeScore : "0",
                awayScore: newScore,
              }));
              onChange(
                homeTeam,
                awayTeam,
                `${
                  scoreState.homeScore ? scoreState.homeScore : "0"
                }-${newScore}`
              );
            }
          });
        }}
        type="number"
        slotProps={{
          input: {
            readOnly: pathName !== "/Kiosk",
          },
        }}
      />
    </div>
  );
};

export default ScoreInput;
