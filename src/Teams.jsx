import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa";
import "./Teams.css";

function Teams() {
  const [games, setGames] = useState([]);
  const teamID = useParams();
  const dataLoad = JSON.parse(localStorage.getItem("data"));
  const team = dataLoad.teams.find((t) => t.id == teamID.id);
  document.title = "StatKeeper | " + team.name;
  function addGame() {
    setGames((prev) => {
      const nextNumber = prev.length + 1;
      const newGame = {
        id: Date.now(),
        name: `Opponent ${nextNumber}`,
        shots: [],
        date: new Date().toLocaleDateString("en-GB"),
      };
      return [...prev, newGame];
    });
    toast.success("New Game Added");
  }
  return (
    <>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <div className="topBarBack">
        <FaArrowLeft
          className="backArrow"
          onClick={() => (window.location.href = "/")}
        ></FaArrowLeft>
        <img src="/sk.png" className="backLogo"></img>
        <p className="logoName">StatKeeper | {team.name}</p>
      </div>
      <div className="selectGame">
        <div className="gameCard" onClick={addGame}>
          <p className="gameName">New Game</p>
          <p className="newgameplus">+</p>
        </div>
        {games.map((game) => (
          <div className="gameCard">
            <p className="gameName">{game.name}</p>
            <p className="gameDate">{game.date}</p>
            <p className="shotAmmount">{game.shots.length} Shots Logged</p>
          </div>
        ))}
      </div>
    </>
  );
}
export default Teams;
