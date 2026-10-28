import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopCards from './TopCards';
import { renderWithProviders } from '@/test/test-utils';
import { useLoading } from '@/contexts/LoadingContext';

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock useLoading
const mockSetLoading = vi.fn();
vi.mock('@/contexts/LoadingContext', () => ({
    useLoading: () => ({
        setLoading: mockSetLoading,
    }),
}));

// Mock MenuItems
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
                        title: 'Kart 1',
                        href: '/href-1',
                        customIcon: 'public/icon1.svg',
                        aciklama: 'Açıklama 1',
                    },
                    {
                        id: '1-2',
                        title: 'Kart 2',
                        href: '/href-2',
                    }
                ]
            }
        ]),
    };
});

describe('TopCards Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render cards based on title prop', () => {
        renderWithProviders(<TopCards title="BAŞLIK" />);

        expect(screen.getByText('Kart 1')).toBeInTheDocument();
        expect(screen.getByText('Kart 2')).toBeInTheDocument();
    });

    it('should not render cards if title doesn\'t match', () => {
        renderWithProviders(<TopCards title="YANLIŞ BAŞLIK" />);

        expect(screen.queryByText('Kart 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Kart 2')).not.toBeInTheDocument();
    });

    it('should show tooltip when aciklama is present', async () => {
        renderWithProviders(<TopCards title="BAŞLIK" />);

        const card1 = screen.getByText('Kart 1');
        fireEvent.mouseOver(card1);

        await waitFor(() => {
            expect(screen.getByText('Açıklama 1')).toBeInTheDocument();
        });
    });

    it('should handle navigation and loading state on click', () => {
        renderWithProviders(<TopCards title="BAŞLIK" />);

        // Find the link wrapping the card
        const cardLink = screen.getByText('Kart 1').closest('a');
        if (!cardLink) throw new Error('Link not found');

        fireEvent.click(cardLink);

        expect(mockSetLoading).toHaveBeenCalledWith(true);
    });
});

