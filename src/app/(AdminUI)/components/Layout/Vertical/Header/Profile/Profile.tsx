import React, { useState } from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Box,
  MenuItem,
  Popover,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { IconMail } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import ProfileItems from "./ProfileItems";
import { resetToNull } from "@/store/user/UserSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };
  const handleLogOut = () => {
    dispatch(resetToNull(""));
  };

  return (
    <Box>
      <Tooltip title="Profil">
        <span style={{ display: "inline-flex" }}>
          <IconButton
            size="large"
            aria-label="show 11 new notifications"
            color="inherit"
            aria-controls="msgs-menu"
            aria-haspopup="true"
            sx={{
              ...(typeof anchorEl2 === "object" && {
                color: "primary.main",
              }),
            }}
            onClick={handleClick2}
          >
            <Avatar
              src={
                customizer.avatarSrc
                  ? customizer.avatarSrc
                  : "/images/profile/user-1.jpg"
              }
              alt={"ProfileImg"}
              sx={{
                width: 35,
                height: 35,
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Popover
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted={false}
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              width: "360px",
              p: 4,
            },
          },
        }}
      >
        <div style={{ outline: "none" }}>
          <Stack direction="row" pb={3} spacing={2} alignItems="center">
            <Avatar
              src={
                customizer.avatarSrc
                  ? customizer.avatarSrc
                  : "/images/profile/user-1.jpg"
              }
              alt={"ProfileImg"}
              sx={{ width: 95, height: 95 }}
            />
            <Box
              sx={{
                maxWidth: "calc(100% - 110px)",
              }}
            >
              <Typography
                variant="subtitle2"
                color="textPrimary"
                fontWeight={600}
              >
                {user.kullaniciAdi}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {user.yetki
                  ? user.yetki.replace(/([A-Z][a-zıiüüşöç]+)/g, " $1").trim()
                  : user.unvan}
              </Typography>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                display="flex"
                alignItems="center"
                gap={1}
                fontSize={"12px"}
                sx={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <IconMail width={15} height={15} />
                {user.mail}
              </Typography>
            </Box>
          </Stack>
          <Divider />
          <ProfileItems />
          <Box mt={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleLogOut()}
              fullWidth
            >
              Çıkış
            </Button>
          </Box>
        </div>
      </Popover>
    </Box>
  );
};

export default Profile;

