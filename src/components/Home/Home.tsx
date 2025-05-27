"use client";
import styles from "@/app/page.module.scss";
import ResultsTable from "@/components/ResultsTable/ResultsTable";
import Table from "./Table";
import { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { usePathname } from "next/navigation";

const Home: React.FC = () => {
  const [results, setResults] = useState<{
    teams: string[];
    resultsData: Record<string, Record<string, string>>;
  }>({ teams: [], resultsData: {} });
  const [newTeam, setNewTeam] = useState("");

  const pathName = usePathname();

  useEffect(() => {
    console.log("Results state updated:", results);
  }, [results]);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => {
        console.log("Results:", data);
        const teams = Object.keys(data.results);
        const resultsData = data.results;

        // Create a new object to ensure state update triggers re-render
        setResults({ teams: [...teams], resultsData: { ...resultsData } });
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/results")
        .then((res) => res.json())
        .then((data) => {
          console.log("Results refreshed:", data);
          const teams = Object.keys(data.results);
          const resultsData = data.results;

          // Create a new object to ensure state update triggers re-render
          setResults(
            JSON.parse(
              JSON.stringify({
                teams: [...teams],
                resultsData: { ...resultsData },
              })
            )
          );
        });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScoreChange = (
    homeTeam: string,
    awayTeam: string,
    newScore: string
  ) => {
    setResults((prevResults) => {
      const updatedResultsData = { ...prevResults.resultsData };

      if (!updatedResultsData[homeTeam]) {
        updatedResultsData[homeTeam] = {};
      }
      updatedResultsData[homeTeam][awayTeam] = newScore;

      return { ...prevResults, resultsData: updatedResultsData };
    });
  };

  const handleAddTeam = (newTeam: string) => {
    setResults((prevResults) => {
      if (prevResults.teams.includes(newTeam)) return prevResults; // Avoid duplicates

      if (
        !newTeam ||
        newTeam.length < 1 ||
        newTeam.length > 20 ||
        !/^[A-Za-z0-9]+$/.test(newTeam) ||
        Object.keys(results.teams).length > 7
      )
        return prevResults;

      const updatedTeams = [...prevResults.teams, newTeam];
      const updatedResultsData = { ...prevResults.resultsData };

      fetch("/api/results", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team: newTeam }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Add team response:", data);
        })
        .catch((error) => {
          console.error("Error adding team:", error);
        });

      return { teams: updatedTeams, resultsData: updatedResultsData };
    });
  };

  const handleDeleteTeam = (team: string) => {
    if (results.teams.length <= 2) return;

    fetch("/api/results", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ team }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete team response:", data);
        setResults((prevResults) => {
          const updatedTeams = prevResults.teams.filter((t) => t !== team);
          const updatedResultsData = { ...prevResults.resultsData };
          delete updatedResultsData[team];
          for (const opponent of Object.keys(updatedResultsData)) {
            delete updatedResultsData[opponent][team];
          }
          return { teams: updatedTeams, resultsData: updatedResultsData };
        });
      })
      .catch((error) => {
        console.error("Error deleting team:", error);
      });
  };

  return (
    <div className={styles.page}>
      <main>
        <div className={styles.container}>
          <Table
            key={JSON.stringify(results)}
            results={results}
            handleScoreChange={handleScoreChange}
            handleDeleteTeam={handleDeleteTeam}
          />
          {pathName === "/Kiosk" && (
            <div className={styles.addTeamContainer}>
              <TextField
                type="text"
                size="small"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Enter new team name"
                className={styles.addTeamInput}
              />
              <Button
                onClick={() => {
                  if (newTeam.trim()) {
                    handleAddTeam(newTeam.trim());
                    setNewTeam("");
                  }
                }}
                variant="contained"
                className={styles.addTeamButton}
              >
                Add Team
              </Button>
            </div>
          )}
          <div className={styles.resultsTableContainer}>
            <ResultsTable results={results} />
          </div>{" "}
        </div>
      </main>
    </div>
  );
};

export default Home;
