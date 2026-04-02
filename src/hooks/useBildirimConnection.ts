"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getBildirimConnectionStatus,
  onYeniBildirim,
  startBildirimConnection,
  stopBildirimConnection,
  stopPollingBildirim,
} from "@/api/BaglantiBilgileri/BaglantiBilgileri";

interface UseBildirimConnectionOptions {
  denetciId: number;
  autoConnect?: boolean;
}

export const useBildirimConnection = ({
  denetciId,
}: UseBildirimConnectionOptions) => {
  const [bildirimState, setBildirimState] = useState<any>(null);
  const [status, setStatus] = useState<string>(getBildirimConnectionStatus());

  const registerCallback = useCallback(
    (callback: (data: any) => void) => {
      onYeniBildirim((data: any) => {
        setBildirimState(data);
        callback(data);
      }, denetciId);
    },
    [denetciId]
  );

  const startConnection = useCallback(async () => {
    await startBildirimConnection(denetciId);
    setStatus(getBildirimConnectionStatus());
  }, [denetciId]);

  const stopConnection = useCallback(() => {
    stopPollingBildirim();
    stopBildirimConnection();
    setStatus("disconnected");
  }, []);

  return useMemo(
    () => ({
      status,
      bildirimState,
      registerCallback,
      startConnection,
      stopConnection,
    }),
    [status, bildirimState, registerCallback, startConnection, stopConnection]
  );
};
