import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaArrowLeft, FaTrash, FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Teams.css";

function Teams() {
  const [games, setGames] = useState([]);
  const teamID = useParams();
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedShots, setSelectedShots] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const dataLoad = JSON.parse(localStorage.getItem("data"));
  const team = dataLoad.teams.find((t) => t.id == teamID.id);
  if (!team) {
    window.location.href = "/";
  }
  document.title = "StatKeeper | " + team.name;
  useEffect(() => {
    const raw = localStorage.getItem("data");
    const parsed = raw ? JSON.parse(raw) : { teams: [] };

    if (!raw) {
      localStorage.setItem("data", JSON.stringify(parsed));
    }

    setGames(parsed.teams.find((t) => t.id == teamID.id)?.games || []);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (selectedGameId == null) return;

    if (selectedGameId === "overall") {
      setSelectedShots(games.flatMap((g) => g.shots || []));
      return;
    }

    const g = games.find((x) => x.id === selectedGameId);
    setSelectedShots(g?.shots || []);
  }, [games, selectedGameId]);
  useEffect(() => {
    if (!hydrated) return;
    const latestData = JSON.parse(localStorage.getItem("data"));
    latestData.teams.find((t) => t.id == teamID.id).games = games;
    localStorage.setItem("data", JSON.stringify(latestData));
  }, [games]);
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

  async function editTeamName(id) {
    const game = games.find((t) => t.id === id);
    const { value: name } = await Swal.fire({
      title: "Edit opponent name",
      input: "text",
      inputValue: game?.name || "",
      inputPlaceholder: "Team name",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "swalPopup",
        title: "swalTitle",
        htmlContainer: "swalText",
        input: "swalInput",
        confirmButton: "swalConfirm",
        cancelButton: "swalCancel",
      },
      inputValidator: (v) => {
        if (!v || !v.trim()) return "Name can't be empty";
      },
    });

    if (!name) return;

    setGames((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)),
    );

    toast.success("Opponent Name Changed");
  }
  function deleteGame(gameId) {
    setGames((prev) => prev.filter((t) => t.id !== gameId));

    toast.success("Team Deleted");
  }
  function confirmDeleteGame(deleteFn) {
    Swal.fire({
      title: "Delete Game?",
      text: "You can't undo this",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "swalPopup",
        title: "swalTitle",
        htmlContainer: "swalText",
        confirmButton: "swalConfirm",
        cancelButton: "swalCancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFn();
      }
    });
  }

  function focusGame(gameId) {
    setSelectedGameId(gameId);

    if (gameId === "overall") {
      const allShots = games.flatMap((game) => game.shots || []);
      setSelectedShots(allShots);
      console.log(allShots);
      return;
    }

    const game = games.find((t) => t.id === gameId);
    const shots = game?.shots || [];
    setSelectedShots(shots);
    console.log(shots);
  }
  async function setNumber(e) {
    if (selectedGameId == null) {
      toast.error("Select a game to log shots");
      return null;
    }
    if (selectedGameId === "overall") {
      toast.error("Select a specific game to log shots");
      return null;
    }
    if (selectedGameId != null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      console.log(x, y);
      const { value: name } = await Swal.fire({
        title: "Player Number",
        input: "number",
        inputValue: team?.name || "",
        inputPlaceholder: "Player Number",
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        buttonsStyling: false,
        customClass: {
          popup: "swalPopup",
          title: "swalTitle",
          htmlContainer: "swalText",
          input: "swalInput",
          confirmButton: "swalConfirm",
          cancelButton: "swalCancel",
        },
        inputValidator: (v) => {
          if (!v || !v.trim()) return "Number can't be empty";
        },
      });

      if (!name) return;
      const newShot = {
        id: Date.now(),
        x: x,
        y: y,
        player: name,
      };
      setSelectedShots((prev) => {
        return [...prev, newShot];
      });
      const datastate = JSON.parse(localStorage.getItem("data"));
      datastate.teams
        .find((t) => t.id === Number(teamID.id))
        .games.find((g) => g.id === selectedGameId)
        .shots.push(newShot);
      localStorage.setItem("data", JSON.stringify(datastate));
      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGameId
            ? { ...g, shots: [...(g.shots || []), newShot] }
            : g,
        ),
      );
    }
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
        {games.length > 1 && (
          <div
            className="gameCard"
            style={{
              border:
                selectedGameId === "overall"
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              focusGame("overall");
            }}
            id={"overall"}
          >
            <p className="gameName">Overall</p>
            <p className="shotAmmount">All Shots Logged</p>
          </div>
        )}
        {games.map((game) => (
          <div
            className="gameCard"
            key={game.id}
            id={game.id}
            style={{
              border:
                selectedGameId === game.id
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              focusGame(game.id);
            }}
          >
            <FaTrash
              className="deleteIconGames"
              onClick={(e) => {
                e.stopPropagation();
                confirmDeleteGame(() => deleteGame(game.id));
              }}
            />
            <FaPencilAlt
              className="editIconGames"
              onClick={(e) => {
                e.stopPropagation();
                editTeamName(game.id);
              }}
            />
            <p className="gameName">{game.name}</p>
            <p className="gameDate">{game.date}</p>
            <p className="shotAmmount">{game.shots.length} Shots Logged</p>
          </div>
        ))}
      </div>
      <div className="basketballBoard" onClick={setNumber}>
        <img
          src="/main.svg"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "96%",
            padding: "2%",
          }}
        />
        {selectedShots.map((shot) => (
          <div
            key={shot.id}
            className="shot"
            style={{
              left: `${shot.x * 100}%`,
              top: `${shot.y * 100}%`,
            }}
          >
            {shot.player}
          </div>
        ))}
      </div>
    </>
  );
}
export default Teams;
