"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useAdminNotifications, type AdminNotification } from "./AdminNotificationsProvider";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { unreadCount, recent, markRead, markAllRead } = useAdminNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const open = Boolean(anchorEl);

  function handleItemClick(n: AdminNotification) {
    if (!n.isRead) markRead(n.id);
    setAnchorEl(null);
    if (n.link) router.push(n.link);
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Notifications">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 440 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllRead} sx={{ textTransform: "none", fontSize: 12 }}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {recent.length === 0 && (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        )}

        {recent.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => handleItemClick(n)}
            sx={{
              whiteSpace: "normal",
              alignItems: "flex-start",
              gap: 1,
              py: 1.25,
              bgcolor: n.isRead ? "transparent" : "action.hover",
            }}
          >
            <Box
              sx={{
                mt: 0.7,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: n.isRead ? "transparent" : "error.main",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 700 }}>
                {n.title}
              </Typography>
              {n.message && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {n.message}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {timeAgo(n.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
