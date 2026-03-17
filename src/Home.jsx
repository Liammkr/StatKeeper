import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Home.css";
import "./Swal.css";
import { useAuth } from "./context/AuthContext";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "./firebase";
import { LogOut } from "lucide-react";

function Home() {
  const { user, userData, authLoading, isAuthenticated } = useAuth();

  const [teams, setTeams] = useState([]);
  const [hydrated, setHydrated] = useState(false);
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
    const parsed = raw
      ? JSON.parse(raw)
      : {
          teams: [
            {
              id: 1772124503874,
              name: "My Team",
              games: [],
              logo: "/sk.png",
              myteam: true,
            },
          ],
        };
    if (!raw) {
      localStorage.setItem("data", JSON.stringify(parsed));
      if (authLoading == false && user != null) {
        set(ref(db, `users/${user.uid}/data`), JSON.stringify(parsed));
      }
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
    if (authLoading == false && user != null) {
      set(ref(db, `users/${user.uid}/data`), JSON.stringify(latestData));
    }
  }, [teams]);
  document.title = "StatKeeper | Home";
  function createNewTeam() {
    const nextNumber = teams.length + 1;
    const newTeam = {
      id: Date.now(),
      name: `Team ${nextNumber}`,
      games: [],
      logo: "/sk.png",
      myteam: false,
    };

    setTeams((prev) => [...prev, newTeam]);

    editName(newTeam.id, newTeam.name);
    toast.success("Team Created");
  }
  function deleteTeam(teamId) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));

    toast.success("Team Deleted");
  }
  async function handlelogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success("Logged In");

      const snapshot = await get(ref(db, `users/${result.user.uid}/data`));
      const userRef = ref(db, `users/${result.user.uid}`);
      set(userRef, {
        name: result.user.displayName || "",
        email: result.user.email || "",
        photoURL: result.user.photoURL || "",
        provider: "google",
        loggedin: Date.now(),
      });
      if (snapshot.exists()) {
        console.log(snapshot.val());

        localStorage.setItem("data", snapshot.val());
        const parsed = JSON.parse(snapshot.val());
        setTeams(parsed.teams || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Login failed");
    }
  }
  async function handleLogout() {
    try {
      await signOut(auth);
      toast.success("Logged Out");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Logout failed");
    }
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
  async function editName(id, fallbackName = "") {
    const team = teams.find((t) => t.id === id);
    console.log(team);
    const { value: name } = await Swal.fire({
      title: "Edit team name",
      input: "text",
      inputValue: fallbackName || team?.name || "",
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
        <div className="logoandtext">
          <img src="/sk.png" alt="Logo" className="mainLogo" />
          <p className="logoName">StatKeeper</p>
        </div>

        {isAuthenticated == false && authLoading == false ? (
          <button className="loginbutton" onClick={() => handlelogin()}>
            Log In
          </button>
        ) : isAuthenticated == true && authLoading == false ? (
          <div className="logoutfamily">
            <img src={user.photoURL} className="userimage"></img>
            <button className="logoutbutton" onClick={() => handleLogout()}>
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="teamtitles">My Team</div>
      <div className="teams">
        {teams.map((team) =>
          team.myteam ? (
            <div
              className="teamCard"
              key={team.id}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/team/" + team.id;
              }}
            >
              <FaPencilAlt
                className="editIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  editName(team.id);
                }}
              />
              <p className="teamName">{team.name}</p>
              <p className="teamDescription">
                {team.games?.length} Games Logged
              </p>
              <img src={team.logo} alt="Logo" className="teamLogo" />
            </div>
          ) : null,
        )}
      </div>
      <div className="teamtitles">Opponent Teams</div>
      <div className="teams">
        <div className="teamCard" id="newTeam" onClick={createNewTeam}>
          <p className="teamName">Create New Team</p>
          <p className="newteamplus">+</p>
        </div>
        {teams.map((team) =>
          team.myteam ? null : (
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
              <p className="teamDescription">
                {team.games?.length} Games Logged
              </p>
              <img src={team.logo} alt="Logo" className="teamLogo" />
            </div>
          ),
        )}
      </div>
    </>
  );
}

export default Home;
