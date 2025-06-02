"use client";

import { ColorModeContext } from "@contexts/color-mode";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { RefineThemedLayoutV2HeaderProps} from "@refinedev/mui";
import React, { useContext } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleGoHome = () => {
    router.push('/programas');
  };

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Logo and Title */}
          <Stack direction="row" alignItems="center" spacing={2}>
            
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'inherit' }}>
              FPSI
            </Typography>
          </Stack>

          {/* Navigation and User Section */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Tooltip title="Ir para Programas">
              <IconButton
                color="inherit"
                onClick={handleGoHome}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
              <IconButton
                color="inherit"
                onClick={() => {
                  setMode();
                }}
              >
                {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
              </IconButton>
            </Tooltip>

            {user && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                {user?.name && (
                  <Typography
                    sx={{
                      display: {
                        xs: "none",
                        sm: "inline-block",
                      },
                    }}
                    variant="subtitle2"
                  >
                    {user?.name}
                  </Typography>
                )}
                <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 32, height: 32 }} />
                
                <Tooltip title="Logout">
                  <IconButton
                    color="inherit"
                    onClick={handleLogout}
                    sx={{ ml: 1 }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
