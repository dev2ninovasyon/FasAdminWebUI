import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CustomTextField from './CustomTextField'
import { renderWithProviders } from '@/test/test-utils'

describe('CustomTextField', () => {
    it('renders correctly with label', () => {
        const { container } = renderWithProviders(<CustomTextField id="test-input" label="Test Label" />)

        // Debug output to see what is rendered
        // screen.debug()

        // Try finding by label text which is more accessible
        const input = screen.getByLabelText('Test Label')
        expect(input).toBeInTheDocument()
    })

    it('renders with error state', () => {
        const { container } = renderWithProviders(<CustomTextField id="error-input" error />)
        // Check if error class is applied (MUI specific)
        expect(container.querySelector('.Mui-error')).toBeInTheDocument()
    })
})

