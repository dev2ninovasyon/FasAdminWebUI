import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface CardProps {
  title: string;
}

const RaporGorusCard: React.FC<CardProps> = ({ title }) => {
  return (
    <Card
      sx={{
        bgcolor: "primary.light",
        transition: "box-shadow 0.3s ease", // Geçiş efekti için
        "&:hover": {
          boxShadow:
            "0 1px 1px 1px rgba(80, 80, 80, 0.1),0 2px 2px 2px rgba(80, 80, 80, 0.1),0 4px 4px 4px rgba(80, 80, 80, 0.1),0 8px 8px 4px rgba(80, 80, 80, 0.1),0 16px 16px 4px rgba(80, 80, 80, 0.1)",
          cursor: "pointer",
        },
        position: "relative",
        px: 0,
      }}
    >
      <CardContent sx={{ bgcolor: "primary.light" }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RaporGorusCard;
