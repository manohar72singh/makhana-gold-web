"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { NotificationBell } from "./NotificationBell";

export function AdminTopbar({
  adminName,
  adminRole,
}: {
  adminName?: string | null;
  adminRole?: string | null;
}) {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 2,
        px: 4,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <NotificationBell />

      {adminName && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main" }}>
            {adminName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {adminName}
            </Typography>
            {adminRole && (
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                {adminRole.replace(/_/g, " ")}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
