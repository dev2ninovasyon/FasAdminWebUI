import React from "react";
import { styled } from "@mui/material/styles";
import TextareaAutosize from "@mui/material/TextareaAutosize";

const CustomTextAreaAutoSize = styled(({ fullWidth, ...props }: any) => (
  <TextareaAutosize minRows={1} maxRows={5} {...props} />
))(({ theme, fullWidth }: any) => ({
  padding: "12px 14px",
  //font: "inherit",
  fontFamily: "inherit",
  fontSize: theme.typography.fontSize,
  letterSpacing: "inherit",
  boxSizing: "content-box",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? theme.palette.grey[200]
      : theme.palette.grey[300]
  }`,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.common.white,
  width: fullWidth ? "100%" : "auto",
  maxHeight: "80px",
  overflowY: "auto",
  resize: "vertical",
  "&:disabled": {
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.mode === "dark" ? "#7f8185" : "#b9b9b9",
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.mode === "dark" ? "#5d6065" : "#bdbdbd",
  },
  "&:hover": {
    borderColor: theme.palette.grey[300],
  },
  "&:focus": {
    outline: "none",
    borderColor:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
    boxShadow: `0 0 0 1px ${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.primary.dark
    }`,
    "&:hover": {
      outline: "none",
      borderColor: theme.palette.grey[300],
      boxShadow: `0 0 0 1px ${theme.palette.grey[300]}`,
    },
  },
}));

export default CustomTextAreaAutoSize;

