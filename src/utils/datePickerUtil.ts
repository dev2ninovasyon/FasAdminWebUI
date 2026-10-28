import React from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import dayjs from "dayjs";

interface CustomDatePickerProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
    value: any;
    onChange: (date: any) => void;
}

export const CustomDatePicker = (props: CustomDatePickerProps) => {
    const { value, onChange, ...rest } = props;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? dayjs(e.target.value) : null;
        onChange(date);
    };

    return React.createElement(TextField, {
        type: "date",
        ...rest,
        value: value ? dayjs(value).format("YYYY-MM-DD") : "",
        onChange: handleChange,
        InputLabelProps: {
            shrink: true,
        },
    });
};
