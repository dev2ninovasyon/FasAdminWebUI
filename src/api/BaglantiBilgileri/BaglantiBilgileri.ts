import { apiFetch } from "@/api/apiBase";

export const getBildirimler = async (denetciId: number) => {
    try {
        const response = await apiFetch(`/Bildirim/GetBildirimler/${denetciId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            return [];
        }
    } catch (error) {
        console.log("Bildirimler getirilemedi:", error);
        return [];
    }
};

export const updateBildirimlerOkundumu = async (bildirimIds: number[]) => {
    try {
        const response = await apiFetch(`/Bildirim/UpdateOkundumu`, {
            method: "PUT",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bildirimIds),
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Bildirim okundumu güncellenemedi:", error);
        return false;
    }
};

export const startBildirimConnection = async (denetciId: number) => {
    try {
        // SignalR connection initialization
        console.log("Starting bildirim connection for denetciId:", denetciId);
        return Promise.resolve();
    } catch (error) {
        console.log("Bildirim connection başlatılamadı:", error);
        return Promise.reject(error);
    }
};

export const onYeniBildirim = (callback: (data: any) => void, denetciId?: number) => {
    // Register callback for new notifications
    console.log("Registering new bildirim callback for denetciId:", denetciId);
};

export const stopBildirimConnection = () => {
    // Stub implementation
    console.log("Stopping bildirim connection");
};

export const startPollingBildirim = (denetciId: number, callback?: (data: any) => void, interval: number = 30000) => {
    // Stub implementation
    console.log("Starting bildirim polling");
    return null;
};

export const stopPollingBildirim = (pollId?: any) => {
    // Stub implementation
    console.log("Stopping bildirim polling");
};

export const getBildirimConnectionStatus = () => {
    // Stub implementation
    return "disconnected";
};
