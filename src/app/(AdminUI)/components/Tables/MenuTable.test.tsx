import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FilteredMenu from './MenuTable';
import { renderWithProviders } from '@/test/test-utils';

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock useLoading
vi.mock('@/contexts/LoadingContext', () => ({
    useLoading: () => ({
        setLoading: vi.fn(),
    }),
}));

// Mock API
vi.mock('@/api/CalismaKagitlari/CalismaKagitlari', () => ({
    getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu: vi.fn(() =>
        Promise.resolve({ hazirlayanId: 1, onaylayanId: null, kontrolEdenId: null })
    ),
}));

// Mock MenuItems to provide a controlled list for testing
vi.mock('@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        createMenuItems: vi.fn(() => [
            {
                id: '1',
                title: 'BAŞLIK',
                children: [
                    {
                        id: '1-1',
                        title: 'Alt Menü 1',
                        href: '/test-href',
                        formKodu: 'TEST_FORM',
                    },
                    {
                        id: '1-2',
                        title: 'Genişletilebilir Menü',
                        children: [
                            {
                                id: '1-2-1',
                                title: 'Derin Menü',
                                href: '/deep-href',
                            }
                        ]
                    }
                ]
            }
        ]),
    };
});

describe('MenuTable (FilteredMenu) Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render main menu items based on title prop', () => {
        renderWithProviders(<FilteredMenu title="BAŞLIK" />);

        expect(screen.getByText('Alt Menü 1')).toBeInTheDocument();
        expect(screen.getByText('Genişletilebilir Menü')).toBeInTheDocument();
    });

    it('should show "No items found" if title doesn\'t match', () => {
        renderWithProviders(<FilteredMenu title="YANLIŞ BAŞLIK" />);
        expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should toggle sub-menu visibility on click', async () => {
        renderWithProviders(<FilteredMenu title="BAŞLIK" />);

        // Initially "Derin Menü" should not be visible (it's inside a collapsed row)
        expect(screen.queryByText('Derin Menü')).not.toBeInTheDocument();

        const expandableItem = screen.getByText('Genişletilebilir Menü');
        fireEvent.click(expandableItem);

        await waitFor(() => {
            expect(screen.getByText('Derin Menü')).toBeInTheDocument();
        });
    });

    it('should display status icons for leaf items with formKodu', async () => {
        const { getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu } = await import('@/api/CalismaKagitlari/CalismaKagitlari');

        renderWithProviders(<FilteredMenu title="BAŞLIK" />);

        // Verify API was called for the item with formKodu
        expect(getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu).toHaveBeenCalled();

        // In our mock, hazirlayanId is returned, so a success icon should appear
        // CheckCircleIcon with color="success" is rendered when status is true
        // We can look for the icon by testing properties or just existence in the right cell
        await waitFor(() => {
            const icons = screen.getAllByTestId('CheckCircleIcon');
            // 3 status icons per leaf item (Hazırlandı, Onaylandı, Kalite Kontrol)
            expect(icons.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('should hide status icons when showStatusIcons is false', () => {
        renderWithProviders(<FilteredMenu title="BAŞLIK" showStatusIcons={false} />);

        expect(screen.queryByText('Hazırlandı')).not.toBeInTheDocument();
        expect(screen.queryByText('Onaylandı')).not.toBeInTheDocument();
        expect(screen.queryByText('Kalite Kontrol')).not.toBeInTheDocument();
    });
});

