import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Tooltip } from "@mui/material";

interface CardProps {
  title?: string;
  content?: string;
  date?: string;
  standartMi?: boolean;
}

const CalismaKagidiTekTarihCard: React.FC<CardProps> = ({
  title,
  content,
  date,
  standartMi,
}) => {
  const formattedDate = date
    ? date.split("T")[0].split("-").reverse().join(".")
    : "";
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
      }}
    >
      <CardContent sx={{ bgcolor: "primary.light" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
          >
            {title}
          </Typography>
          {date && (
            <Typography variant="h6" component="div">
              {`${formattedDate}`}
            </Typography>
          )}
        </Box>
        <Typography
          marginTop={2}
          variant="body1"
          color="text.secondary"
          sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
        >
          {content}
        </Typography>
      </CardContent>
      <Tooltip title={standartMi ? "Düzenle" : "Düzenlendi"}>
        <CheckCircleOutlineIcon
          color={standartMi ? "disabled" : "success"}
          sx={{
            position: "absolute",
            bottom: 10,
            right: 12,
          }}
        ></CheckCircleOutlineIcon>
      </Tooltip>
    </Card>
  );
};

export default CalismaKagidiTekTarihCard;

