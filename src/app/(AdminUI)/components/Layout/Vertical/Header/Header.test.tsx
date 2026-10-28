import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from './Header'
import { renderWithProviders } from '@/test/test-utils'
import * as customizerActions from '@/store/customizer/CustomizerSlice'
import { enqueueSnackbar } from 'notistack'

// Mocks
// Mock Child Components
vi.mock('./SirketPopup', () => ({ default: () => <div data-testid="sirket-popup-mock">SirketPopup</div> }))
vi.mock('./MobileSirketPopup', () => ({ default: () => <div data-testid="mobile-sirket-popup-mock">MobileSirketPopup</div> }))
vi.mock('./Search', () => ({ default: () => <div data-testid="search-mock">Search</div> }))
vi.mock('./SearchBoxAutocomplete', () => ({ default: () => <div data-testid="search-box-mock">SearchBoxAutocomplete</div> }))
vi.mock('./Language', () => ({ default: () => <div data-testid="language-mock">Language</div> }))
vi.mock('./Archive', () => ({ default: () => <div data-testid="archive-mock">Archive</div> }))
vi.mock('./Notification', () => ({ default: () => <div data-testid="notification-mock">Notification</div> }))
vi.mock('./Profile/Profile', () => ({ default: () => <div data-testid="profile-mock">Profile</div> }))

// Mock notistack
vi.mock('notistack', () => ({
    enqueueSnackbar: vi.fn(),
}))

// Mock useMediaQuery
import * as mui from '@mui/material';
vi.mock('@mui/material/useMediaQuery', () => ({
    default: vi.fn()
}))
import useMediaQuery from '@mui/material/useMediaQuery';

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders desktop layout correctly', () => {
        // Mock lgUp = true
        vi.mocked(useMediaQuery).mockReturnValue(true)

        renderWithProviders(<Header isSidebarHover={false} />)

        // Check Desktop elements
        expect(screen.getByTestId('sirket-popup-mock')).toBeInTheDocument()
        expect(screen.getByTestId('search-box-mock')).toBeInTheDocument()

        // Check Mobile elements are NOT present
        expect(screen.queryByTestId('mobile-sirket-popup-mock')).not.toBeInTheDocument()
        expect(screen.queryByTestId('search-mock')).not.toBeInTheDocument()

        // Check Common elements
        expect(screen.getByTestId('language-mock')).toBeInTheDocument()
        expect(screen.getByTestId('archive-mock')).toBeInTheDocument()
        expect(screen.getByTestId('notification-mock')).toBeInTheDocument()
        expect(screen.getByTestId('profile-mock')).toBeInTheDocument()
    })

    it('renders mobile layout correctly', () => {
        // Mock lgUp = false
        vi.mocked(useMediaQuery).mockReturnValue(false)

        renderWithProviders(<Header isSidebarHover={false} />)

        // Check Mobile elements
        expect(screen.getByTestId('mobile-sirket-popup-mock')).toBeInTheDocument()
        expect(screen.getByTestId('search-mock')).toBeInTheDocument()

        // Check Desktop elements are NOT present
        expect(screen.queryByTestId('sirket-popup-mock')).not.toBeInTheDocument()
        expect(screen.queryByTestId('search-box-mock')).not.toBeInTheDocument()
    })

    it('toggles sidebar on menu click (Desktop)', () => {
        vi.mocked(useMediaQuery).mockReturnValue(true)
        const toggleSidebarSpy = vi.spyOn(customizerActions, 'toggleSidebar')

        const preloadedState = {
            userReducer: { denetlenenId: 123 } // Set ID to avoid warning
        }

        renderWithProviders(<Header isSidebarHover={false} />, { preloadedState })

        const menuButton = screen.getByLabelText('menu')
        fireEvent.click(menuButton)

        expect(toggleSidebarSpy).toHaveBeenCalled()
    })

    it('toggles mobile sidebar on menu click (Mobile)', () => {
        vi.mocked(useMediaQuery).mockReturnValue(false)
        const toggleMobileSidebarSpy = vi.spyOn(customizerActions, 'toggleMobileSidebar')

        const preloadedState = {
            userReducer: { denetlenenId: 123 }
        }

        renderWithProviders(<Header isSidebarHover={false} />, { preloadedState })

        const menuButton = screen.getByLabelText('menu')
        fireEvent.click(menuButton)

        expect(toggleMobileSidebarSpy).toHaveBeenCalled()
    })

    it('shows warning if company is not selected', () => {
        vi.mocked(useMediaQuery).mockReturnValue(true)

        const preloadedState = {
            userReducer: { denetlenenId: 0 } // No company selected
        }

        renderWithProviders(<Header isSidebarHover={false} />, { preloadedState })

        const menuButton = screen.getByLabelText('menu')
        fireEvent.click(menuButton)

        expect(enqueueSnackbar).toHaveBeenCalledWith("Şirket seçilmedi", { variant: "warning" })
    })
})

