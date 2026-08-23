import Box from "@mui/material/Box";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
