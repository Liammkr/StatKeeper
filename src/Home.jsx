import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Home.css";
import "./Swal.css";

function Home() {
  const [teams, setTeams] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("data");
    const parsed = raw ? JSON.parse(raw) : { teams: [] };

    if (!raw) {
      localStorage.setItem("data", JSON.stringify(parsed));
    }

    setTeams(parsed.teams || []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const latestData = JSON.parse(localStorage.getItem("data")) || {
      teams: [],
    };
    latestData.teams = teams;
    localStorage.setItem("data", JSON.stringify(latestData));
  }, [teams]);
  document.title = "StatKeeper | Home";
  function createNewTeam() {
    setTeams((prev) => {
      const nextNumber = prev.length + 1;
      const newTeam = {
        id: Date.now(),
        name: `Team ${nextNumber}`,
        games: [],
        logo: "/sk.png",
      };
      return [...prev, newTeam];
    });
    toast.success("Team Created");
  }
  function deleteTeam(teamId) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));

    toast.success("Team Deleted");
  }
  function confirmDeleteTeam(deleteFn) {
    Swal.fire({
      title: "Delete Team?",
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
  async function editName(id) {
    const team = teams.find((t) => t.id === id);
    const { value: name } = await Swal.fire({
      title: "Edit team name",
      input: "text",
      inputValue: team?.name || "",
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

    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)),
    );

    toast.success("Team Name Changed");
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <div className="topBar">
        <img src="/sk.png" alt="Logo" className="mainLogo" />
        <p className="logoName">StatKeeper</p>
      </div>
      <div className="teams">
        <div className="teamCard" id="newTeam" onClick={createNewTeam}>
          <p className="teamName">Create New Team</p>
          <p className="newteamplus">+</p>
        </div>
        {teams.map((team) => (
          <div
            className="teamCard"
            key={team.id}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = "/team/" + team.id;
            }}
          >
            <FaTrash
              className="deleteIcon"
              onClick={(e) => {
                e.stopPropagation();
                confirmDeleteTeam(() => deleteTeam(team.id));
              }}
            />
            <FaPencilAlt
              className="editIcon"
              onClick={(e) => {
                e.stopPropagation();
                editName(team.id);
              }}
            />
            <p className="teamName">{team.name}</p>
            <p className="teamDescription">{team.games.length} Games Logged</p>
            <img src={team.logo} alt="Logo" className="teamLogo" />
          </div>
        ))}
      </div>
    </>
  );
}

export default Home;
