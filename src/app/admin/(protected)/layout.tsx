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
          width: { sm: `calc(100% - 260px)` },
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "#FBF9F5",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
