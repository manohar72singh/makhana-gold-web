import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { adminLoginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "/admin/dashboard";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Makhana Gold
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Admin Portal Sign In
        </Typography>

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Invalid email or password.
          </Typography>
        )}

        <Box component="form" action={adminLoginAction} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <TextField name="email" type="email" label="Email" required fullWidth autoComplete="email" />
          <TextField
            name="password"
            type="password"
            label="Password"
            required
            fullWidth
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
            Sign In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
