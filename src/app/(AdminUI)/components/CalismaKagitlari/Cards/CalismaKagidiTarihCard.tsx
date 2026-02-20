import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Tooltip } from "@mui/material";

interface CardProps {
  title?: string;
  startDate?: string;
  endDate?: string;
  standartMi?: boolean;
}

const CalismaKagidiTarihCard: React.FC<CardProps> = ({
  title,
  startDate,
  endDate,
  standartMi,
}) => {
  const formattedStartDate = startDate
    ? startDate.split("T")[0].split("-").reverse().join(".")
    : "";
  const formattedEndDate = endDate
    ? endDate.split("T")[0].split("-").reverse().join(".")
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
          {startDate && endDate && (
            <Typography variant="h6" component="div">
              {`${formattedStartDate}`} &nbsp; &nbsp;/ &nbsp; &nbsp;
              {`${formattedEndDate}`}
            </Typography>
          )}
        </Box>
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

export default CalismaKagidiTarihCard;

