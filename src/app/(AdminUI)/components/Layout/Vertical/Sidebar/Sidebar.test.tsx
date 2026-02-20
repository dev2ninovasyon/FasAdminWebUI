import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Sidebar from './Sidebar'
import { renderWithProviders } from '@/test/test-utils'
import * as customizerActions from '@/store/customizer/CustomizerSlice'

// Mocks
// Mock Child Components
vi.mock('./SidebarItems', () => ({ default: () => <div data-testid="sidebar-items-mock">SidebarItems</div> }))
vi.mock('@/app/(AdminUI)/components/Layout/Shared/Logo/Logo', () => ({ default: () => <div data-testid="logo-mock">Logo</div> }))
vi.mock('@/app/(AdminUI)/components/Layout/Shared/Logo/CollapsLogo', () => ({ default: () => <div data-testid="collapse-logo-mock">CollapseLogo</div> }))
vi.mock('@/app/(AdminUI)/components/Layout/Shared/Logo/MobileLogo', () => ({ default: () => <div data-testid="mobile-logo-mock">MobileLogo</div> }))
vi.mock('@/app/components/CustomScroll/Scrollbar', () => ({ default: ({ children }: any) => <div data-testid="scrollbar-mock">{children}</div> }))
vi.mock('@/app/(AdminUI)/components/Dashboards/TourFloatingButton', () => ({ default: () => <div data-testid="tour-button-mock">TourButton</div> }))

// Mock useMediaQuery
import * as mui from '@mui/material';
vi.mock('@mui/material/useMediaQuery', () => ({
    default: vi.fn()
}))
import useMediaQuery from '@mui/material/useMediaQuery';

describe('Sidebar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders desktop sidebar correctly (expanded)', () => {
        // Mock lgUp = true
        vi.mocked(useMediaQuery).mockReturnValue(true)

        const preloadedState = {
            customizer: { isCollapse: false, isMobileSidebar: false, SidebarWidth: 270, MiniSidebarWidth: 87, activeMode: 'light' }
        }

        renderWithProviders(<Sidebar isSidebarHover={false} setIsSidebarHover={vi.fn()} />, { preloadedState })

        // Check Desktop elements
        expect(screen.getByTestId('logo-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('collapse-logo-mock')).not.toBeInTheDocument()
        expect(screen.getByTestId('sidebar-items-mock')).toBeInTheDocument()
        expect(screen.getByTestId('tour-button-mock')).toBeInTheDocument()

        // Check Mobile elements NOT present
        expect(screen.queryByTestId('mobile-logo-mock')).not.toBeInTheDocument()
    })

    it('renders desktop sidebar correctly (collapsed)', () => {
        // Mock lgUp = true
        vi.mocked(useMediaQuery).mockReturnValue(true)

        const preloadedState = {
            customizer: { isCollapse: true, isMobileSidebar: false, SidebarWidth: 270, MiniSidebarWidth: 87, activeMode: 'light' }
        }

        renderWithProviders(<Sidebar isSidebarHover={false} setIsSidebarHover={vi.fn()} />, { preloadedState })

        // Check Desktop elements
        expect(screen.queryByTestId('logo-mock')).not.toBeInTheDocument()
        expect(screen.getByTestId('collapse-logo-mock')).toBeInTheDocument()
    })

    it('renders mobile sidebar correctly', () => {
        // Mock lgUp = false
        vi.mocked(useMediaQuery).mockReturnValue(false)

        const preloadedState = {
            customizer: { isMobileSidebar: true, SidebarWidth: 270, MiniSidebarWidth: 87, activeMode: 'light' }
        }

        renderWithProviders(<Sidebar isSidebarHover={false} setIsSidebarHover={vi.fn()} />, { preloadedState })

        // Check Mobile elements
        expect(screen.getByTestId('mobile-logo-mock')).toBeInTheDocument()
        expect(screen.getByTestId('sidebar-items-mock')).toBeInTheDocument()

        // Check Desktop elements NOT present
        expect(screen.queryByTestId('logo-mock')).not.toBeInTheDocument()
    })

    it('handles hover events on desktop collapsed sidebar', () => {
        vi.mocked(useMediaQuery).mockReturnValue(true)
        const setIsSidebarHover = vi.fn()

        const preloadedState = {
            customizer: { isCollapse: true, isMobileSidebar: false }
        }

        renderWithProviders(<Sidebar isSidebarHover={false} setIsSidebarHover={setIsSidebarHover} />, { preloadedState })

        // Find the Drawer (it's a bit hard to find by simple role query because needed MuiDrawer-root, but we can look for the container)
        // Since we mocked children with test-ids, we can find a common parent using closest or just trigger events on document body if drawer covers it?
        // Drawer implementation usually puts a div at root.
        // Let's rely on event propagation or find the element wrapping SidebarItems.
        // SidebarItems is inside Scrollbar inside Box inside Drawer.

        const sidebarContent = screen.getByTestId('sidebar-items-mock').parentElement?.parentElement?.parentElement // Approximate
        // Better:
        // The Drawer has onMouseEnter and onMouseLeave props.
        // We can assign a test-id to the Drawer in the source code or use class selector.

        // Since I can't easily change source code right now without another step, let's try to query by class or use fireEvent on the logo/items which propagate up.
        const logo = screen.getByTestId('collapse-logo-mock')

        // Hover Enter
        fireEvent.mouseEnter(logo)
        expect(setIsSidebarHover).toHaveBeenCalledWith(true)

        // Hover Leave
        fireEvent.mouseLeave(logo)
        expect(setIsSidebarHover).toHaveBeenCalledWith(false)
    })

    it('toggles mobile sidebar on close', () => {
        vi.mocked(useMediaQuery).mockReturnValue(false)
        const toggleMobileSidebarSpy = vi.spyOn(customizerActions, 'toggleMobileSidebar')

        const preloadedState = {
            customizer: { isMobileSidebar: true }
        }

        renderWithProviders(<Sidebar isSidebarHover={false} setIsSidebarHover={vi.fn()} />, { preloadedState })

        // To simulate closing the drawer (clicking backdrop), we need to find the backdrop.
        // Material UI Drawer creates a backdrop with class MuiBackdrop-root usually.
        // Or we can find presentation role.

        // Since MUI Portal might put it outside, `screen` might not see it if we don't look at baseElement.
        // But renderWithProviders renders into container.

        // Let's try to find the backdrop.
        // Or just trust that the `onClose` prop is wired correctly?
        // Let's try finding the backdrop by searching for an element with presentation role and assert click.

        // This is tricky to test without complex DOM queries for MUI.
        // I'll skip the user interaction test for mobile close for now, or assume if I click escape it might trigger it.
        // Let's try escape key.
        fireEvent.keyDown(screen.getByTestId('mobile-logo-mock'), { key: 'Escape', code: 'Escape' })
        expect(toggleMobileSidebarSpy).toHaveBeenCalled()
    })
})

