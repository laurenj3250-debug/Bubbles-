import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Hook to listen to partner's real-time status via Firebase
 */
export function usePartnerStatus(partnerId) {
  const [signals, setSignals] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!partnerId) return;

    const statusRef = ref(database, `users/${partnerId}/status`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const realtimeStatus = snapshot.val();

      if (realtimeStatus) {
        setSignals(prevSignals => ({
          ...prevSignals,
          location: realtimeStatus.location || prevSignals?.location,
          activity: realtimeStatus.activity || prevSignals?.activity,
          music: realtimeStatus.music || prevSignals?.music,
          device: realtimeStatus.device || prevSignals?.device,
        }));

        const mostRecentTimestamp = Math.max(
          realtimeStatus.location?.timestamp || 0,
          realtimeStatus.activity?.timestamp || 0,
          realtimeStatus.music?.timestamp || 0,
          realtimeStatus.device?.timestamp || 0
        );

        if (mostRecentTimestamp) {
          setLastSeen(mostRecentTimestamp);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          setIsOnline(mostRecentTimestamp > fiveMinutesAgo);
        }
      }
    });

    return () => off(statusRef);
  }, [partnerId]);

  return { signals, setSignals, lastSeen, isOnline };
}

/**
 * Hook to listen for "Love Bomb" (Miss You) notifications via Firebase
 */
export function useLoveBombListener(userId, partnerId) {
  const [showLoveBomb, setShowLoveBomb] = useState(false);
  const lastBombTime = useRef(0);

  useEffect(() => {
    if (!partnerId || !userId) return;

    const inboxRef = ref(database, `users/${userId}/inbox/miss_you`);

    const unsubscribe = onValue(inboxRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp > lastBombTime.current) {
        const isRecent = Date.now() - data.timestamp < 60000;
        if (isRecent) {
          setShowLoveBomb(true);
        }
        lastBombTime.current = data.timestamp;
      }
    });

    return () => off(inboxRef);
  }, [userId, partnerId]);

  return { showLoveBomb, setShowLoveBomb };
}

/**
 * Hook for Digital Touch functionality
 */
export function useDigitalTouch(userId) {
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [myTouchPos, setMyTouchPos] = useState(null);
  const touchThrottle = useRef(0);

  const updateMyTouch = (x, y) => {
    setMyTouchPos(x ? { x, y } : null);

    if (!userId) return;
    const now = Date.now();
    if (now - touchThrottle.current > 100 || !x) {
      const refPath = `users/${userId}/status/touch`;
      if (x) {
        set(ref(database, refPath), { x, y, timestamp: now });
      } else {
        set(ref(database, refPath), null);
      }
      touchThrottle.current = now;
    }
  };

  useEffect(() => {
    if (!isTouchMode && userId) {
      const refPath = `users/${userId}/status/touch`;
      set(ref(database, refPath), null);
    }
  }, [isTouchMode, userId]);

  return { isTouchMode, setIsTouchMode, myTouchPos, updateMyTouch };
}
