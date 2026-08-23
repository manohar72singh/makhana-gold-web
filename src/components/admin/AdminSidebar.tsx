"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

// Icons
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import GroupIcon from "@mui/icons-material/GroupOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import AnalyticsIcon from "@mui/icons-material/BarChartOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOfferOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturnOutlined";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCartOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgentOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import ViewCarouselIcon from "@mui/icons-material/ViewCarouselOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import StarHalfIcon from "@mui/icons-material/StarHalfOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInboxOutlined";
import { adminLogoutAction } from "@/app/admin/actions";

const DRAWER_WIDTH = 260;

const NAV_GROUPS = [
  {
    title: "Store Management",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon },
      { href: "/admin/products", label: "Products", icon: Inventory2Icon },
      { href: "/admin/inventory", label: "Inventory", icon: Inventory2Icon },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
      { href: "/admin/fulfillment", label: "Fulfillment", icon: LocalShippingIcon },
      { href: "/admin/customers", label: "Customers", icon: GroupIcon },
      { href: "/admin/shipping-config", label: "Shipping Config", icon: TuneIcon },
      { href: "/admin/returns", label: "Returns", icon: AssignmentReturnIcon },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: RemoveShoppingCartIcon },
    ],
  },
  {
    title: "Storefront CMS & Content",
    items: [
      { href: "/admin/blogs", label: "Blog & Google SEO", icon: CampaignIcon },
      { href: "/admin/cms/banners", label: "Hero Banners", icon: ViewCarouselIcon },
      { href: "/admin/cms/pillars", label: "Trust & Pillars", icon: VerifiedUserIcon },
      { href: "/admin/cms/marketplaces", label: "Marketplaces", icon: StorefrontIcon },
      { href: "/admin/cms/faqs", label: "FAQ Manager", icon: QuizIcon },
      { href: "/admin/cms/reviews", label: "Reviews Moderation", icon: StarHalfIcon },
      { href: "/admin/inquiries", label: "Inquiries & Leads", icon: SupportAgentIcon },
    ],
  },
  {
    title: "Growth & Settings",
    items: [
      { href: "/admin/broadcast", label: "Email Broadcast", icon: ForwardToInboxIcon },
      { href: "/admin/campaigns", label: "Campaigns", icon: CampaignIcon },
      { href: "/admin/coupons", label: "Coupons", icon: LocalOfferIcon },
      { href: "/admin/settings", label: "Master Settings", icon: SettingsIcon },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Makhana Gold
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: "10px" }}>
          Admin Control Center
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1, flex: 1, overflowY: "auto", py: 1 }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <Box key={group.title} sx={{ mb: 1 }}>
            <ListSubheader
              sx={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                lineHeight: "28px",
                color: "text.secondary",
                bgcolor: "transparent",
                px: 1.5,
              }}
            >
              {group.title}
            </ListSubheader>

            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
              return (
                <ListItemButton
                  key={href}
                  component={Link}
                  href={href}
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    mb: 0.3,
                    py: 0.8,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                      "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>
                        {label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}

            {gIdx < NAV_GROUPS.length - 1 && <Divider sx={{ my: 1, mx: 1 }} />}
          </Box>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 1 }} component="form" action={adminLogoutAction}>
        <ListItemButton
          component="button"
          type="submit"
          sx={{ borderRadius: 2, width: "100%", color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                Sign Out
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
