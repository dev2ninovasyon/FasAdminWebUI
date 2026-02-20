import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NumericInput from './NumericInput';

describe('NumericInput Component', () => {
    it('should format initial value correctly for Turkish locale', () => {
        const onChange = vi.fn();
        render(<NumericInput value={1234567.89} onChange={onChange} label="Numeric Input" />);

        const input = screen.getByLabelText('Numeric Input') as HTMLInputElement;
        // Turkish format: dots for thousands, comma for decimals
        expect(input.value).toBe('1.234.567,89');
    });

    it('should handle numeric input changes', () => {
        const onChange = vi.fn();
        render(<NumericInput value={0} onChange={onChange} label="Numeric Input" />);

        const input = screen.getByLabelText('Numeric Input') as HTMLInputElement;

        // Simulate typing "123,45"
        fireEvent.change(input, { target: { value: '123,45' } });

        expect(input.value).toBe('123,45');
        expect(onChange).toHaveBeenCalledWith(123.45);
    });

    it('should allow empty string', () => {
        const onChange = vi.fn();
        render(<NumericInput value={100} onChange={onChange} label="Numeric Input" />);

        const input = screen.getByLabelText('Numeric Input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '' } });

        expect(input.value).toBe('');
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should format value on blur (N2 format)', () => {
        const onChange = vi.fn();
        render(<NumericInput value={100} onChange={onChange} label="Numeric Input" />);

        const input = screen.getByLabelText('Numeric Input') as HTMLInputElement;

        // Raw input without decimal part
        fireEvent.change(input, { target: { value: '1234' } });
        fireEvent.blur(input);

        // Should format to "1.234,00"
        expect(input.value).toBe('1.234,00');
        expect(onChange).toHaveBeenCalledWith(1234);
    });

    it('should handle thousand separators and decimal points correctly during input', () => {
        const onChange = vi.fn();
        render(<NumericInput value={0} onChange={onChange} label="Numeric Input" />);

        const input = screen.getByLabelText('Numeric Input') as HTMLInputElement;

        // Input with dots and commas like user might type or paste
        fireEvent.change(input, { target: { value: '1.000.000,50' } });

        expect(input.value).toBe('1.000.000,50');
        expect(onChange).toHaveBeenCalledWith(1000000.50);
    });

    it('should prevent invalid characters', () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(<NumericInput value={100} onChange={onChange} label="Numeric Input" />);

        const input = getByLabelText('Numeric Input') as HTMLInputElement;
        const initialValue = input.value;

        // Try typing letters
        fireEvent.change(input, { target: { value: 'abc' } });

        // Value should not have changed if the regex filter worked
        expect(input.value).toBe(initialValue);
    });
});

