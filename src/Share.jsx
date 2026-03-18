import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { FaArrowLeft, FaTrash, FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "./context/AuthContext";
import { ref, get, set, push } from "firebase/database";
import { auth, db } from "./firebase";
function Share() {
  const { user, userData, authLoading, isAuthenticated } = useAuth();
  const shareIDObject = useParams();
  if (shareIDObject.uid == null || shareIDObject.id == null) {
    toast.error("Invalid share link");
    return;
  }
  const ogData = localStorage.getItem("data");
  async function loadFromFirebase() {
    try {
      const snapshot = await get(
        ref(db, `sharedlinks/${shareIDObject.uid}/${shareIDObject.id}`),
      );

      if (snapshot.exists() && snapshot.val() != null) {
        const data = snapshot.val();
        console.log("Loaded Share: ", data.data);
        console.log(JSON.parse(data.data).id);
        const parsed = JSON.parse(ogData);
        const finder = parsed.teams.find(
          (t) => t.id == JSON.parse(data.data).id,
        );
        console.log("test", finder);
        console.log("og", parsed.teams);
        if (finder == null) {
          parsed.teams.push(JSON.parse(data.data));
          console.log(parsed);
          localStorage.setItem("data", JSON.stringify(parsed));
          set(ref(db, `users/${user.uid}/data`), JSON.stringify(parsed));
          console.log("Set Data");
          window.location.href = "/";
        } else {
          console.log("Data already in set");
        }
      }
    } catch (e) {
      console.log("Failed to load from Firebase", e);
    }
  }
  loadFromFirebase();
}
export default Share;
