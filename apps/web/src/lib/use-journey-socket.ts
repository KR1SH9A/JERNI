'use client';

/**
 * useJourneySocket — React hook for real-time journey updates via Socket.io.
 *
 * Connects to the NestJS /journeys namespace, authenticates with the user's
 * Supabase JWT, joins the journey room, and fires callbacks when domain events
 * arrive.
 *
 * Socket events now directly invalidate TanStack Query cache entries, causing
 * ALL subscribed components to re-render with fresh data — not just StatsPanel.
 *
 * Reconnect strategy:
 *   On reconnect, stats + completions queries are invalidated so the client
 *   re-fetches from REST (source of truth) before resuming live updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { createBrowserClient } from '@supabase/ssr';

export interface JourneySocketCallbacks {
  /** Called whenever stats.updated is received. */
  onStatsUpdated: () => void;
  onMemberJoined?: (payload: { journeyId: string; userId: string; joinedAt: string }) => void;
  onMemberLeft?: (payload: { journeyId: string; userId: string }) => void;
  onTaskCompleted?: (payload: {
    journeyId: string;
    userId: string;
    taskDefinitionId: string;
    taskKind: 'MILESTONE' | 'RECURRING';
    forDate: string | null;
  }) => void;
  onTaskUncompleted?: (payload: {
    journeyId: string;
    userId: string;
    taskDefinitionId: string;
    forDate: string | null;
  }) => void;
}

export interface UseJourneySocketResult {
  /** True when the socket is connected and the join handshake completed. */
  isConnected: boolean;
}

export function useJourneySocket(
  journeyId: string,
  callbacks: JourneySocketCallbacks,
): UseJourneySocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Stable reference to callbacks so the effect doesn't re-run on every render
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const connect = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      // Not authenticated — skip socket (stats panel works without it via polling)
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    const socket = io(`${apiUrl}/journeys`, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', { journeyId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      // Re-sync from REST source of truth after reconnect
      callbacksRef.current.onStatsUpdated();
      socket.emit('join', { journeyId });
    });

    // ── Domain event listeners ──────────────────────────────────────────────

    socket.on('stats.updated', () => {
      callbacksRef.current.onStatsUpdated();
    });

    socket.on('member.joined', (payload) => {
      callbacksRef.current.onMemberJoined?.(payload);
    });

    socket.on('member.left', (payload) => {
      callbacksRef.current.onMemberLeft?.(payload);
    });

    socket.on('task.completed', (payload) => {
      callbacksRef.current.onTaskCompleted?.(payload);
    });

    socket.on('task.uncompleted', (payload) => {
      callbacksRef.current.onTaskUncompleted?.(payload);
    });
  }, [journeyId]);

  useEffect(() => {
    connect();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [connect]);

  return { isConnected };
}
