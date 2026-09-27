import { useEffect, useState } from "react";
import { ref, onValue, onDisconnect, set, remove, serverTimestamp } from "firebase/database";
import { db } from "../lib/firebase";

// Generates a random session ID per browser tab
const SESSION_ID = Math.random().toString(36).slice(2);

export function usePresence(path) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!path) return;

    const presenceRef = ref(db, `presence/${path}/${SESSION_ID}`);
    const countRef = ref(db, `presence/${path}`);

    // Write presence on mount, auto-remove on disconnect
    set(presenceRef, { t: serverTimestamp() });
    onDisconnect(presenceRef).remove();

    // Listen to count
    const unsub = onValue(countRef, (snap) => {
      setCount(snap.exists() ? Object.keys(snap.val()).length : 0);
    });

    return () => {
      unsub();
      remove(presenceRef);
    };
  }, [path]);

  return count;
}
