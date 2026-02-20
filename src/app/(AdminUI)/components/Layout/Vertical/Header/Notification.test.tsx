import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Notifications from './Notification';
import { renderWithProviders } from '@/test/test-utils';
import * as BaglantiApi from '@/api/BaglantiBilgileri/BaglantiBilgileri';
import * as MusteriApi from '@/api/Musteri/MusteriIslemleri';
import * as AyarlarApi from '@/api/Kullanici/KullaniciAyarlar';
import * as SozlesmeApi from '@/api/Sozlesme/DenetimKadrosuAtama';

// Proper class-based mock for Notification constructor
class MockNotification {
    static permission = 'granted';
    static requestPermission = vi.fn().mockResolvedValue('granted');
    close = vi.fn();
    constructor(public title: string, public options?: any) { }
}

// Robust Global Mocks
vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: '',
    }),
    createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
        },
    }),
    currentTime: 0,
    destination: {},
})));

vi.stubGlobal('Notification', MockNotification);

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock APIs
vi.mock('@/api/BaglantiBilgileri/BaglantiBilgileri', () => ({
    getBildirimler: vi.fn(),
    updateBildirimlerOkundumu: vi.fn(),
    startBildirimConnection: vi.fn().mockResolvedValue(null),
    onYeniBildirim: vi.fn(),
    stopBildirimConnection: vi.fn(),
    startPollingBildirim: vi.fn(),
    stopPollingBildirim: vi.fn(),
    getBildirimConnectionStatus: vi.fn(),
}));

vi.mock('@/api/Musteri/MusteriIslemleri', () => ({
    getDenetlenenById: vi.fn(),
}));

vi.mock('@/api/Kullanici/KullaniciAyarlar', () => ({
    updateSonSecilenAyarlari: vi.fn(),
}));

vi.mock('@/api/Sozlesme/DenetimKadrosuAtama', () => ({
    getRol: vi.fn(),
}));

const mockBildirimler = [
    {
        id: 1,
        konu: 'Konu 1',
        aciklama: 'AÃ§Ä±klama 1',
        okundumu: false,
        tarih: new Date().toISOString(),
        denetlenenId: 1,
        yil: 2024,
        tip: 'Amortisman'
    }
];

const preloadedState = {
    userReducer: {
        denetciId: 123,
        token: 'fake-token',
        denetlenenId: 1,
        yil: 2024,
        id: 456
    }
};

describe('Notification Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(BaglantiApi.getBildirimler).mockResolvedValue([...mockBildirimler]);
    });

    it('should render the notification bell', async () => {
        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });
        expect(await screen.findByLabelText('show new notifications')).toBeInTheDocument();
    });

    it('should open popover and show notifications list on click', async () => {
        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });

        const bell = await screen.findByLabelText('show new notifications');
        fireEvent.click(bell);

        expect(await screen.findByText('Bildirimler')).toBeInTheDocument();
        expect(await screen.findByText('Konu 1')).toBeInTheDocument();
    });

    it('should mark notifications as read when popover opens', async () => {
        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });

        const bell = await screen.findByLabelText('show new notifications');
        fireEvent.click(bell);

        await waitFor(() => {
            expect(BaglantiApi.updateBildirimlerOkundumu).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('should handle navigation for same company notification', async () => {
        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });

        const bell = await screen.findByLabelText('show new notifications');
        fireEvent.click(bell);

        const notificationItem = await screen.findByText('Konu 1');
        fireEvent.click(notificationItem);

        expect(mockPush).toHaveBeenCalledWith('/Hesaplamalar/Amortisman');
    });

    it('should open confirmation dialog for different company/year notification', async () => {
        const diffBildirimler = [{ ...mockBildirimler[0], denetlenenId: 99, yil: 2025 }];
        vi.mocked(BaglantiApi.getBildirimler).mockResolvedValue(diffBildirimler);

        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });

        fireEvent.click(await screen.findByLabelText('show new notifications'));
        fireEvent.click(await screen.findByText('Konu 1'));

        expect(await screen.findByText(/Åirket ve YÄ±l DeÄŸiÅŸikliÄŸi/)).toBeInTheDocument();
    });

    it('should update state and navigate upon confirming company switch', async () => {
        const diffBildirimler = [{ ...mockBildirimler[0], denetlenenId: 99, yil: 2025 }];
        vi.mocked(BaglantiApi.getBildirimler).mockResolvedValue(diffBildirimler);
        vi.mocked(MusteriApi.getDenetlenenById).mockResolvedValue({
            firmaAdi: 'Yeni Firma',
            denetimTuru: 'Bobi',
            bobi: true,
            tfrs: false,
            enflasyonMu: false,
            konsolide: false
        });
        vi.mocked(AyarlarApi.updateSonSecilenAyarlari).mockResolvedValue(null);
        vi.mocked(SozlesmeApi.getRol).mockResolvedValue({ rol: 'Admin' });

        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });

        fireEvent.click(await screen.findByLabelText('show new notifications'));
        fireEvent.click(await screen.findByText('Konu 1'));

        const confirmBtn = await screen.findByText(/Onayla ve DeÄŸiÅŸtir/i);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/Hesaplamalar/Amortisman');
        }, { timeout: 5000 });
    });

    it('should handle real-time notification via SignalR listener', async () => {
        let signalRCallback: any;
        vi.mocked(BaglantiApi.onYeniBildirim).mockImplementation((cb: any) => {
            signalRCallback = cb;
        });

        renderWithProviders(<Notifications isSidebarHover={false} />, { preloadedState });
        await waitFor(() => expect(signalRCallback).toBeDefined());

        const newBildirim = {
            id: 3,
            konu: 'SignalR Konu',
            aciklama: 'SignalR AÃ§Ä±klama',
            denetlenenId: 1,
            yil: 2024,
            tarih: new Date().toISOString()
        };

        signalRCallback(newBildirim);

        const modalElements = await screen.findAllByText('SignalR Konu');
        expect(modalElements.length).toBeGreaterThanOrEqual(1);

        fireEvent.click(screen.getByLabelText('show new notifications'));
        const popoverElements = await screen.findAllByText('SignalR Konu');
        expect(popoverElements.length).toBeGreaterThanOrEqual(1);
    });
});

