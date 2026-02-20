import React, { useState } from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import { IconMail } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import ProfileItems from "./ProfileItems";
import { resetToNull } from "@/store/user/UserSlice";
import { apiFetch } from "@/api/apiBase";

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
  const handleLogOut = async () => {
    try {
      if (user.token) {
        await apiFetch("/Auth/logout", {
          method: "POST",
          token: user.token,
        });
      }
    } catch (error) {
      console.error("Ã‡Ä±kÄ±ÅŸ yapÄ±lÄ±rken hata oluÅŸtu:", error);
    } finally {
      dispatch(resetToNull(""));
    }
  };

  return (
    <Box>
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
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "360px",
            p: 4,
          },
        }}
      >
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
              Admin
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Fas Admin
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
              admin@gmail.com
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
            Ã‡Ä±kÄ±ÅŸ
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
