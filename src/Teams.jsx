import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaArrowLeft, FaTrash, FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Teams.css";
import { useAuth } from "./context/AuthContext";
import { ref, get, set } from "firebase/database";
import { auth, db } from "./firebase";
function Teams() {
  const { user, userData, authLoading, isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [homeplayers, sethomeplayers] = useState([]);
  const [awayplayers, setawayplayers] = useState([]);
  const [selectedawayplayers, setselectedawayplayers] = useState([]);
  const [selectedshotsview, setselectedshotsview] = useState("both");
  const teamID = useParams();
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedShots, setSelectedShots] = useState([]);
  const [selectedplayer, setselectedplayer] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [paintHovered, setPaintHovered] = useState(false);
  const boardRef = useRef(null);
  const [boardHeight, setBoardHeight] = useState(0);
  const dataLoad = JSON.parse(localStorage.getItem("data"));
  const team = dataLoad.teams.find((t) => t.id == teamID.id);
  if (!team) {
    window.location.href = "/";
  }
  document.title = "StatKeeper | " + team.name;
  useEffect(() => {
    if (authLoading || !user) return;

    async function loadFromFirebase() {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/data`));

        if (snapshot.exists() && snapshot.val() != null) {
          const data = snapshot.val();
          console.log("loaded");
          localStorage.setItem("data", data);
        }
      } catch (e) {
        console.log("Failed to load from Firebase", e);
      }
    }

    loadFromFirebase();
  }, [authLoading, user]);
  useEffect(() => {
    const raw = localStorage.getItem("data");
    const parsed = raw ? JSON.parse(raw) : { teams: [] };

    if (!raw) {
      localStorage.setItem("data", JSON.stringify(parsed));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(parsed));
      }
    }

    setGames(parsed.teams.find((t) => t.id == teamID.id)?.games || []);
    sethomeplayers(parsed.teams.find((t) => t.id == teamID.id)?.roster || []);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (selectedGameId == null) return;

    if (selectedGameId === "Overall") {
      setSelectedShots(games.flatMap((g) => g.shots || []));
      setselectedawayplayers([]);
      setselectedshotsview("both");
      return;
    }

    const g = games.find((x) => x.id === selectedGameId);
    setselectedawayplayers(g?.roster || []);
    setSelectedShots(g?.shots || []);
    setselectedshotsview("both");
  }, [games, selectedGameId]);
  useEffect(() => {
    if (!hydrated) return;
    const latestData = JSON.parse(localStorage.getItem("data"));
    latestData.teams.find((t) => t.id == teamID.id).games = games;
    localStorage.setItem("data", JSON.stringify(latestData));
    if (authLoading == false && user != null) {
      set(ref(db, `users/${user.uid}/data`), JSON.stringify(latestData));
    }
  }, [games]);

  useEffect(() => {
    if (!boardRef.current) return;

    const el = boardRef.current;

    const update = () => {
      setBoardHeight(el.getBoundingClientRect().height);
    };

    update();

    const ro = new ResizeObserver(() => {
      update();
    });

    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  function addGame() {
    setGames((prev) => {
      const nextNumber = prev.length + 1;
      const newGame = {
        id: Date.now(),
        name: `Opponent ${nextNumber}`,
        shots: [],
        roster: [],
        date: new Date().toLocaleDateString("en-GB"),
      };
      return [...prev, newGame];
    });
    toast.success("New Game Added");
  }
  async function addPlayer(side) {
    if (
      selectedGameId == null ||
      (selectedGameId === "Overall" && side != "home")
    ) {
      toast.error("Select a game to add players");
      return;
    }
    const { value: name } = await Swal.fire({
      title: "Create New Player",
      input: "number",
      inputValue: "",
      inputPlaceholder: "Player number",
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
    if (side === "home") {
      const load = JSON.parse(localStorage.getItem("data"));
      const team = load.teams.find((t) => t.id == teamID.id);
      if (!team.roster) team.roster = [];
      team.roster.push({ id: Date.now(), name: name.trim(), points: 0 });
      localStorage.setItem("data", JSON.stringify(load));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(load));
      }
      sethomeplayers((prev) => [
        ...prev,
        { id: Date.now(), name: name.trim(), points: 0 },
      ]);
    } else {
      setawayplayers((prev) => {
        return [...prev, { id: Date.now(), name: name.trim(), points: 0 }];
      });
      const datastateaway = JSON.parse(localStorage.getItem("data"));
      datastateaway.teams
        .find((t) => t.id === Number(teamID.id))
        .games.find((g) => g.id === selectedGameId)
        .roster.push({ id: Date.now(), name: name.trim(), points: 0 });
      localStorage.setItem("data", JSON.stringify(datastateaway));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(datastateaway));
      }
      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGameId
            ? {
                ...g,
                roster: [
                  ...(g.roster || []),
                  { id: Date.now(), name: name.trim(), points: 0 },
                ],
              }
            : g,
        ),
      );
    }
    toast.success("New Player Added");
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
  function deletePlayer(playerID) {
    setselectedplayer(null);
    if (selectedGameId == null || selectedGameId === "Overall") return;

    setGames((prev) =>
      prev.map((g) =>
        g.id === selectedGameId
          ? { ...g, roster: (g.roster || []).filter((p) => p.id !== playerID) }
          : g,
      ),
    );

    const latest = JSON.parse(localStorage.getItem("data"));
    const t = latest.teams.find(
      (x) => x.id == teamID.id || x.id === Number(teamID.id),
    );
    const game = t?.games?.find((g) => g.id === selectedGameId);
    if (game) {
      game.roster = (game.roster || []).filter((p) => p.id !== playerID);
      localStorage.setItem("data", JSON.stringify(latest));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(latest));
      }
    }

    toast.success("Player Deleted");
  }
  function deletehomePlayer(playerID) {
    setselectedplayer(null);
    sethomeplayers((prev) => prev.filter((p) => p.id !== playerID));

    const latest = JSON.parse(localStorage.getItem("data"));
    const t = latest.teams.find(
      (x) => x.id == teamID.id || x.id === Number(teamID.id),
    );

    if (t) {
      t.roster = (t.roster || []).filter((p) => p.id !== playerID);
      console.log(latest);
      localStorage.setItem("data", JSON.stringify(latest));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(latest));
      }
    }
  }
  function confirmDeleteGame(deleteFn) {
    Swal.fire({
      title: "Delete?",
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
    setselectedplayer(null);
    setSelectedGameId(gameId);

    if (gameId === "Overall") {
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
    if (selectedGameId === "Overall") {
      toast.error("Select a specific game to log shots");
      return null;
    }
    if (selectedplayer == null) {
      toast.error("Select a player to log shots");
      return null;
    }
    if (selectedGameId != null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      console.log(x, y);
      const result = await Swal.fire({
        title: "Log Shot",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Make",
        denyButtonText: "Miss",
        cancelButtonText: "Cancel",
        buttonsStyling: false,
        customClass: {
          popup: "swalPopup",
          title: "swalTitle",
          htmlContainer: "swalText",
          denyButton: "swalCancel",
          confirmButton: "swalConfirm",
          cancelButton: "swalCancel",
        },
      });

      if (!result.isConfirmed && !result.isDenied) return;
      if (result.isDismissed) return;
      const shotResult = result.isConfirmed ? "make" : "miss";
      const newShot = {
        id: Date.now(),
        x: x,
        y: y,
        side: selectedawayplayers.find((t) => t.id == selectedplayer)?.name
          ? "away"
          : "home",
        points: paintHovered ? 2 : 3,
        result: shotResult,
        player:
          selectedawayplayers.find((t) => t.id == selectedplayer)?.name ||
          homeplayers.find((t) => t.id == selectedplayer)?.name,
        playerID: selectedplayer,
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
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(datastate));
      }
      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGameId
            ? { ...g, shots: [...(g.shots || []), newShot] }
            : g,
        ),
      );
    }
  }
  function filtershots(side) {
    if (selectedGameId == null) {
      toast.error("Select a game first");
      return;
    }
    setselectedshotsview(side);
    if (selectedGameId == "Overall") {
      if (side == "both") {
        const allShots = games.flatMap((game) => game.shots || []);
        setSelectedShots(allShots);
      } else {
        const allShots = games.flatMap((game) => game.shots || []);
        const t = allShots.filter((t) => t.side == side);
        setSelectedShots(t);
      }
    } else {
      if (side == "both") {
        const g = games.find((x) => x.id === selectedGameId);
        setSelectedShots(g?.shots || []);
      } else {
        const g = games.find((x) => x.id === selectedGameId);
        const t = g.shots.filter((t) => t.side == side);
        setSelectedShots(t);
      }
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
      <div className="gametitles">Games vs Opponents</div>
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
                selectedGameId === "Overall"
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              focusGame("Overall");
            }}
            id={"Overall"}
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
      {/* <div className="gametitles">Active Players</div>
      <div className="activeplayerbox">
        <div className="helperbox">
          <div className="homeawaytitle">{team.name}</div>
          <div className="playerBox"></div>
        </div>
        <div className="helperbox">
          <div className="homeawaytitle">
            {selectedGameId != null && selectedGameId != "Overall"
              ? games.find((t) => t.id === selectedGameId).name
              : "Away"}
          </div>
          <div className="playerBox"></div>
        </div>
      </div> */}
      <div className="premainboxcontent">
        <div>Display Shots:</div>
        <div className="buttonselects">
          <div
            onClick={() => filtershots("home")}
            className="selectbox"
            style={{
              border:
                selectedshotsview === "home"
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Home
          </div>
          <div
            onClick={() => filtershots("both")}
            className="selectbox"
            style={{
              border:
                selectedshotsview === "both"
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Both
          </div>
          <div
            onClick={() => filtershots("away")}
            className="selectbox"
            style={{
              border:
                selectedshotsview === "away"
                  ? "1px solid white"
                  : "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Away
          </div>
        </div>
      </div>
      <div className="maincontentbox">
        <div
          className="rostercontainer"
          style={{ height: boardHeight || undefined }}
        >
          <div>{team.name} Roster</div>
          <div className="rosterbox">
            <div className="rosterplayerBox" onClick={() => addPlayer("home")}>
              <div>New Player</div>
            </div>
            {homeplayers.map((p) => (
              <div
                className="rosterplayerBox"
                key={p.id}
                onClick={() => setselectedplayer(p.id)}
                style={{
                  border:
                    selectedplayer === p.id
                      ? "1px solid white"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div>
                  <FaTrash
                    className="deleteIconGames"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteGame(() => deletehomePlayer(p.id));
                    }}
                  />
                  #{p.name}
                  {" | "}
                  {selectedShots.reduce(
                    (sum, shot) =>
                      sum +
                      (shot.result == "make" && shot.playerID == p.id
                        ? shot.points
                        : 0),
                    0,
                  )}{" "}
                  pts
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="basketballBoard" onClick={setNumber} ref={boardRef}>
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
                background:
                  shot.result === "miss"
                    ? "grey"
                    : shot.side === "home"
                      ? "#5b2eff"
                      : "#d94fd5",
              }}
            >
              {shot.player}
            </div>
          ))}
        </div>
        <div
          className="rostercontainer"
          style={{ height: boardHeight || undefined }}
        >
          <div>
            {selectedGameId != null && selectedGameId != "Overall"
              ? games.find((t) => t.id === selectedGameId)?.name
              : "Away"}{" "}
            Roster
          </div>
          <div className="rosterbox">
            <div className="rosterplayerBox" onClick={() => addPlayer("away")}>
              <div>New Player</div>
            </div>
            {selectedawayplayers.map((p) => (
              <div
                className="rosterplayerBox"
                key={p.id}
                onClick={() => setselectedplayer(p.id)}
                style={{
                  border:
                    selectedplayer === p.id
                      ? "1px solid white"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <FaTrash
                  className="deleteIconGames"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteGame(() => deletePlayer(p.id));
                  }}
                />
                <div>
                  #{p.name} {" | "}
                  {selectedShots.reduce(
                    (sum, shot) =>
                      sum +
                      (shot.result == "make" && shot.playerID == p.id
                        ? shot.points
                        : 0),
                    0,
                  )}{" "}
                  pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default Teams;
