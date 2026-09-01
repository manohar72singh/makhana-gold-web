import Box from "@mui/material/Box";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Every admin page reads live operational data (orders, inventory, carts,
// etc.) straight from the DB with no build-time fallback — none of it
// should ever be statically prerendered. Setting this here cascades to
// every page under (protected) instead of repeating it per page.
export const dynamic = "force-dynamic";

export default function AdminProtectedLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - 260px)` },
          p: { xs: 2, sm: 3, md: 4 },
          // The sidebar collapses into a temporary drawer below `md` and is
          // replaced by a fixed top app bar (see AdminSidebar) — reserve
          // space for it so page content doesn't render underneath.
          pt: { xs: 9, sm: 9, md: 4 },
          bgcolor: "#FBF9F5",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
