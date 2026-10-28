import React, { useState, useEffect } from "react";
import CustomTextField from "./CustomTextField";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// Register Turkish language
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface NumericInputProps {
    value: number;
    onChange: (value: number) => void;
    [key: string]: any;
}

const NumericInput: React.FC<NumericInputProps> = ({ value, onChange, ...props }) => {
    const [displayValue, setDisplayValue] = useState<string>("");

    useEffect(() => {
        if (value !== undefined && value !== null) {
            const formatted = numbro(value).format({
                mantissa: 2,
                thousandSeparated: true,
            });
            // Only update if the numeric value actually changed to avoid cursor jumping
            if (parseDisplayValue(displayValue) !== value) {
                setDisplayValue(formatted);
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const parseDisplayValue = (val: string): number => {
        if (!val) return 0;
        // Remove thousand separators (.) and replace decimal separator (,) with (.)
        const cleanValue = val.replace(/\./g, "").replace(",", ".");
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value;

        // Allow typing numbers, thousand separators, and decimal separators
        // Also allow empty string
        if (rawVal === "" || /^[0-9.,]*$/.test(rawVal)) {
            setDisplayValue(rawVal);
            const parsed = parseDisplayValue(rawVal);
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        // Re-format the value on blur to ensure N2 format
        const parsed = parseDisplayValue(displayValue);
        const formatted = numbro(parsed).format({
            mantissa: 2,
            thousandSeparated: true,
        });
        setDisplayValue(formatted);
        onChange(parsed);
    };

    return (
        <CustomTextField
            {...props}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
};

export default NumericInput;

