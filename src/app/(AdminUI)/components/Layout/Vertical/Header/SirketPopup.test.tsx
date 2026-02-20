import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SirketPopup from './SirketPopup'
import { renderWithProviders } from '@/test/test-utils'
import * as apiBase from '@/api/apiBase'
import * as userSettingsApi from '@/api/Kullanici/KullaniciAyarlar'
import * as roleApi from '@/api/Sozlesme/DenetimKadrosuAtama'

// Mocks
// Router Mock
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Child components mock
vi.mock('@/app/(AdminUI)/components/Layout/Vertical/Header/CompanyBoxAutoComplete', () => ({
    default: ({ onSelectId, onSelectAdi, onSelectDenetimTuru, onSelectBobimi, onSelectTfrsmi, onSelectEnflasyonmu, onSelectKonsolidemi }: any) => (
        <div data-testid="company-box-mock">
            <button
                data-testid="select-company-btn"
                onClick={() => {
                    onSelectId(101)
                    onSelectAdi("New Company Ltd")
                    onSelectDenetimTuru("Bagimsiz")
                    onSelectBobimi(true)
                    onSelectTfrsmi(false)
                    onSelectEnflasyonmu(false)
                    onSelectKonsolidemi(false)
                }}
            >
                Select New Company
            </button>
        </div>
    )
}))

vi.mock('@/app/(AdminUI)/components/Layout/Vertical/Header/YearBoxAutoComplete', () => ({
    default: ({ onSelect, onSelectYear }: any) => (
        <div data-testid="year-box-mock">
            <button
                data-testid="select-year-btn"
                onClick={() => {
                    onSelect("2025")
                    onSelectYear(2025)
                }}
            >
                Select 2025
            </button>
        </div>
    )
}))

// Mock APIs
vi.mock('@/api/Kullanici/KullaniciAyarlar', () => ({
    updateSonSecilenAyarlari: vi.fn(),
}))

vi.mock('@/api/Sozlesme/DenetimKadrosuAtama', () => ({
    getRol: vi.fn(),
}))

vi.mock('@/api/apiBase', () => ({
    apiFetch: vi.fn(),
    url: 'http://mock-api.com/'
}))

// Mock Global Objects
const reloadMock = vi.fn()
Object.defineProperty(window, 'location', {
    value: { reload: reloadMock },
    writable: true
})

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock fetch for refresh token
global.fetch = vi.fn()

describe('SirketPopup Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorageMock.getItem.mockReturnValue('mock-refresh-token')
        reloadMock.mockClear()
    })

    it('renders and displays current company and year', () => {
        const preloadedState = {
            userReducer: {
                id: 1,
                denetlenenFirmaAdi: 'Test Company',
                yil: 2024,
                token: 'valid-token'
            }
        }

        renderWithProviders(<SirketPopup />, { preloadedState })

        // Check if chip displays correct info
        expect(screen.getByText(/Test Company - 2024/i)).toBeInTheDocument()
    })

    it('opens dialog on click', async () => {
        const preloadedState = { userReducer: { id: 1, denetlenenFirmaAdi: 'Test Company', yil: 2024 } }
        renderWithProviders(<SirketPopup />, { preloadedState })

        // Locate the button that opens the dialog (Chip inside IconButton)
        // The IconButton has aria-label="show 4 new mails" in the source code (likely copy-paste error in source, but we use it to find)
        const chipButton = screen.getByRole('button', { name: /show 4 new mails/i })
        fireEvent.click(chipButton)

        expect(screen.getByText('Åirket ve Yıl Değiştir')).toBeInTheDocument()
        expect(screen.getByTestId('company-box-mock')).toBeInTheDocument()
        expect(screen.getByTestId('year-box-mock')).toBeInTheDocument()
    })

    it('updates selections and submits changes', async () => {
        // Setup Mocks
        vi.mocked(userSettingsApi.updateSonSecilenAyarlari).mockResolvedValue(true as any)
        vi.mocked(roleApi.getRol).mockResolvedValue({ rol: ['Admin'] } as any)

        const mockRefreshResponse = {
            ok: true,
            json: async () => ({ token: 'new-token', refreshToken: 'new-refresh-token' })
        }
        vi.mocked(global.fetch).mockResolvedValue(mockRefreshResponse as any)

        const preloadedState = {
            userReducer: {
                id: 1,
                denetlenenFirmaAdi: 'Old Company',
                yil: 2023,
                token: 'old-token'
            }
        }

        renderWithProviders(<SirketPopup />, { preloadedState })

        // Open Dialog
        const chipButton = screen.getByRole('button', { name: /show 4 new mails/i })
        fireEvent.click(chipButton)

        // Select New Company
        const selectCompanyBtn = screen.getByTestId('select-company-btn')
        fireEvent.click(selectCompanyBtn)

        // Select New Year
        const selectYearBtn = screen.getByTestId('select-year-btn')
        fireEvent.click(selectYearBtn)

        // Submit
        const submitBtn = screen.getByRole('button', { name: /Åirket Seç/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            // 1. Verify Persistence Call
            expect(userSettingsApi.updateSonSecilenAyarlari).toHaveBeenCalledWith(1, 101, 2025)

            // 2. Verify Refresh Token Call
            // url is mocked as http://mock-api.com/
            // code does url.endsWith('/') ? ...
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/Auth/refresh'), expect.anything())

            // 3. Verify Role Update
            expect(roleApi.getRol).toHaveBeenCalledWith(1, 101, 2025)

            // 4. Verify LocalStorage Updates
            expect(localStorageMock.setItem).toHaveBeenCalledWith('fas_denetlenenId', '101')
            expect(localStorageMock.setItem).toHaveBeenCalledWith('fas_yil', '2025')
            expect(localStorageMock.setItem).toHaveBeenCalledWith('fas_token', 'new-token')

            // 5. Verify Reload
            expect(reloadMock).toHaveBeenCalled()
        })
    })

    it('handles persistence errors gracefully', async () => {
        vi.mocked(userSettingsApi.updateSonSecilenAyarlari).mockRejectedValue(new Error('Persistence failed'))

        const preloadedState = { userReducer: { id: 1, denetlenenFirmaAdi: 'Old', yil: 2023, token: 'token' } }
        renderWithProviders(<SirketPopup />, { preloadedState })

        // Open and interact
        fireEvent.click(screen.getByRole('button', { name: /show 4 new mails/i }))
        fireEvent.click(screen.getByTestId('select-company-btn'))
        fireEvent.click(screen.getByTestId('select-year-btn'))
        fireEvent.click(screen.getByRole('button', { name: /Åirket Seç/i }))

        await waitFor(() => {
            expect(userSettingsApi.updateSonSecilenAyarlari).toHaveBeenCalled()
            // Even if persistence fails, we expect reload to be called to reflect Redux/LocalStorage changes (as per current code logic)
            expect(reloadMock).toHaveBeenCalled()
        })
    })
})

