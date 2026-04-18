import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Link from "@mui/joy/Link";
import Box from "@mui/joy/Box";
import { Link as RouterLink, useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // configurar auth0 aqui
    console.log("Autenticando...");
    navigate("/access-verification");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.level1",
      }}
    >
      <Sheet
        variant="outlined"
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: 320,
          mx: "auto",
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "sm",
          boxShadow: "md",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography level="h4" component="h1">
            Acesso ao Sistema Agrosafe
          </Typography>
          <Typography level="body-sm">
            Insira suas credenciais para continuar.
          </Typography>
        </Box>

        <FormControl required>
          <FormLabel>E-mail</FormLabel>
          <Input name="username" type="text" placeholder="exemplo@granja.com" />
        </FormControl>

        <FormControl required>
          <FormLabel>Senha</FormLabel>
          <Input name="password" type="password" placeholder="••••••••" />
        </FormControl>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link level="title-sm" href="#">
            Esqueceu a senha?
          </Link>
        </Box>

        <Button type="submit" fullWidth sx={{ mt: 1 }}>
          Entrar
        </Button>

        <Typography
          endDecorator={
            <Link component={RouterLink} to="/cadastro">
              Realizar cadastro
            </Link>
          }
          fontSize="sm"
          sx={{ alignSelf: "center", mt: 2 }}
        >
          Não tem uma conta?
        </Typography>
      </Sheet>
    </Box>
  );
}
