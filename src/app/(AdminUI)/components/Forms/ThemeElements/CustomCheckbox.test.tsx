import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CustomCheckbox from './CustomCheckbox';

describe('CustomCheckbox Component', () => {
    it('should render correctly with default state', () => {
        render(<CustomCheckbox />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
    });

    it('should show checked state when checked prop is true', () => {
        render(<CustomCheckbox checked={true} onChange={() => { }} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('should trigger onChange when clicked', () => {
        const onChange = vi.fn();
        render(<CustomCheckbox checked={false} onChange={onChange} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(onChange).toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
        render(<CustomCheckbox disabled />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
    });

    it('should render with different colors', () => {
        const { rerender } = render(<CustomCheckbox color="primary" />);
        expect(screen.getByRole('checkbox')).toBeInTheDocument();

        rerender(<CustomCheckbox color="secondary" />);
        expect(screen.getByRole('checkbox')).toBeInTheDocument();

        rerender(<CustomCheckbox color="success" />);
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
});

