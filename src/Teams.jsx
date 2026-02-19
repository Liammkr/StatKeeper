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
  const [paintHovered, setPaintHovered] = useState(false);
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
      const result = await Swal.fire({
        title: "Log Shot for Player Number",
        input: "number",
        inputPlaceholder: "Player Number",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Make",
        denyButtonText: "Miss",
        cancelButtonText: "Cancel",
        returnInputValueOnDeny: true,
        buttonsStyling: false,
        customClass: {
          popup: "swalPopup",
          title: "swalTitle",
          htmlContainer: "swalText",
          input: "swalInput",
          denyButton: "swalCancel",
          confirmButton: "swalConfirm",
          cancelButton: "swalCancel",
        },
        inputValidator: (v) => {
          if (!v || !v.trim()) return "Number can't be empty";
        },
      });

      if (!result.value) return;
      if (result.isDismissed) return;
      const shotResult = result.isConfirmed ? "make" : "miss";
      const newShot = {
        id: Date.now(),
        x: x,
        y: y,
        points: paintHovered ? 2 : 3,
        result: shotResult,
        player: result.value,
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
      <div className="maincontentbox">
        <div className="basketballBoard" onClick={setNumber}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 600 550"
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "96%",
              padding: "2%",
            }}
          >
            <rect x="0" y="0" width="600" height="550" fill="transparent" />
            <g
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="0" y="0" width="600" height="550" rx="20" ry="20" />
              <circle cx="300" cy="545" r="155" />
              <line x1="212" y1="0" x2="212" y2="242" />
              <line x1="388" y1="0" x2="388" y2="242" />
              <line x1="212" y1="240" x2="388" y2="240" />

              <defs>
                <clipPath id="halfClip">
                  <rect x="0" y="242" width="600" height="308" />
                </clipPath>
              </defs>

              <circle cx="300" cy="242" r="88" clipPath="url(#halfClip)" />

              <line x1="50" y1="0" x2="50" y2="85" />
              <line x1="550" y1="0" x2="550" y2="85" />

              <clipPath id="halfClip2">
                <rect x="0" y="85" width="600" height="308" />
              </clipPath>

              <circle
                id="myShape"
                cx="300"
                cy="80"
                r="250"
                clipPath="url(#halfClip2)"
                fill="transparent"
                pointerEvents="all"
                onMouseEnter={() => setPaintHovered(true)}
                onMouseLeave={() => setPaintHovered(false)}
              />
              <rect
                id="myShape2"
                x="50"
                y="0"
                width="500"
                height="100"
                fill="transparent"
                stroke="none"
                pointerEvents="all"
                onMouseEnter={() => setPaintHovered(true)}
                onMouseLeave={() => setPaintHovered(false)}
              />
            </g>
          </svg>
          {selectedShots.map((shot) => (
            <div
              key={shot.id}
              className="shot"
              style={{
                left: `${shot.x * 100}%`,
                top: `${shot.y * 100}%`,
                transform: `translate(-50%, -50%)`,
                background: shot.result == "make" ? "#5b2eff" : "grey",
              }}
            >
              {shot.player}
            </div>
          ))}
        </div>
        <div className="statSheet">
          <p className="stattitle">Overall Statistics</p>
          <p className="statStat">
            FG:{" "}
            {selectedShots.reduce(
              (sum, shot) =>
                sum + (shot.result == "make" && shot.points == 2 ? 1 : 0),
              0,
            )}{" "}
            /{" "}
            {selectedShots.reduce(
              (sum, shot) => sum + (shot.points == 2 ? 1 : 0),
              0,
            )}{" "}
            (50%)
          </p>
          <p className="statStat">
            3pt:{" "}
            {selectedShots.reduce(
              (sum, shot) =>
                sum + (shot.result == "make" && shot.points == 3 ? 1 : 0),
              0,
            )}{" "}
            /{" "}
            {selectedShots.reduce(
              (sum, shot) => sum + (shot.points == 3 ? 1 : 0),
              0,
            )}{" "}
            ((
            {selectedShots.reduce(
              (sum, shot) =>
                sum + (shot.result == "make" && shot.points == 3 ? 1 : 0),
              0,
            )}
            )/%)
          </p>
          <p className="stattitle">Total Score</p>
          <p className="statStat">
            {selectedShots.reduce(
              (sum, shot) => sum + (shot.result == "make" ? shot.points : 0),
              0,
            )}{" "}
            pts
          </p>
          <p className="stattitle">Top Scorers</p>
          <p className="statStat">1. #x : xx pts</p>
          <p className="statStat">2. #x : xx pts</p>
          <p className="statStat">3. #x : xx pts</p>
        </div>
      </div>
    </>
  );
}
export default Teams;
