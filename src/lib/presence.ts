import { ref, onValue, set, onDisconnect, serverTimestamp } from "firebase/database";
import { db } from "./firebase";

export const updatePresence = (userId: string | number, isOnline: boolean) => {
  if (!userId) return () => {};

  const userStatusRef = ref(db, `users/${userId}/is_online`);

  if (!isOnline) {
    // If user explicitly turned off online status
    set(userStatusRef, false);
    return () => {};
  }

  // Monitor connection state
  const connectedRef = ref(db, ".info/connected");
  
  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // We are connected (or reconnected)!
      onDisconnect(userStatusRef).set(false);
      set(userStatusRef, true);
    }
  });

  return unsubscribe;
};
