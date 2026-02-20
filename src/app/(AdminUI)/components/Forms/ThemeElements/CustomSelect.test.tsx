import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import CustomSelect from './CustomSelect';
import { MenuItem } from '@mui/material';

describe('CustomSelect Component', () => {
    it('should render correctly with value', () => {
        render(
            <CustomSelect value={1} label="Select Box">
                <MenuItem value={1}>Option 1</MenuItem>
                <MenuItem value={2}>Option 2</MenuItem>
            </CustomSelect>
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should open menu and show options when clicked', async () => {
        render(
            <CustomSelect value="" label="Select Box">
                <MenuItem value={1}>Option 1</MenuItem>
                <MenuItem value={2}>Option 2</MenuItem>
            </CustomSelect>
        );

        const selectButton = screen.getByRole('combobox');
        fireEvent.mouseDown(selectButton);

        const listbox = await screen.findByRole('listbox');
        expect(within(listbox).getByText('Option 1')).toBeInTheDocument();
        expect(within(listbox).getByText('Option 2')).toBeInTheDocument();
    });

    it('should trigger onChange when an option is selected', async () => {
        const onChange = vi.fn();
        render(
            <CustomSelect value="" onChange={onChange} label="Select Box">
                <MenuItem value={1}>Option 1</MenuItem>
                <MenuItem value={2}>Option 2</MenuItem>
            </CustomSelect>
        );

        const selectButton = screen.getByRole('combobox');
        fireEvent.mouseDown(selectButton);

        const option2 = await screen.findByText('Option 2');
        fireEvent.click(option2);

        expect(onChange).toHaveBeenCalled();
    });
});

