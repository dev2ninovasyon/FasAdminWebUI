import * as React from "react";
import { Grid, Paper, Typography, Collapse, Box, Stack, IconButton } from "@mui/material";
import { IconAlertCircle, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  warn: string[];
  noMargin?: boolean;
}

const WarnBox = ({ warn, noMargin = false }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <Paper
            elevation={2}
            sx={{
              p: 1,
              mb: noMargin ? 0 : 2,
              borderRadius: 1,
              backgroundColor: "warning.light",
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <Box
              onClick={() => setOpen(!open)}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconAlertCircle size={20} color="#ff9800" />
                <Typography variant="subtitle1" fontWeight={600} color="warning.dark">
                  Uyarılar ({warn.length})
                </Typography>
              </Stack>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
                {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              </IconButton>
            </Box>

            <Collapse in={open}>
              <Box mt={1}>
                {warn.map((warnMessage, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ color: "warning.dark", mb: 0.5 }}
                  >
                    - {warnMessage}
                  </Typography>
                ))}
              </Box>
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default WarnBox;

