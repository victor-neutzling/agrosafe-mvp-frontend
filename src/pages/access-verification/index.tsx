import { useState } from "react";
import {
  Box,
  Button,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  Typography,
  Snackbar,
} from "@mui/joy";
import FormGroup from "@mui/material/FormGroup";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageBase } from "../../components/page-base";
import { Navbar } from "../../components/navbar";
import { RegisterModal } from "./components/register-modal";

import {
  type AccessControlForm,
  AccessControlFormSchema,
} from "./access-verification.schema";
import { ACCESS_CONTROL_FORM_DEFAULT_VALUES } from "./access-verification.constants";
import { CameraFeedPanel } from "./components/camera-feed-panel";

export default function AccessVerification() {
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const form = useForm<AccessControlForm>({
    resolver: zodResolver(AccessControlFormSchema),
    defaultValues: ACCESS_CONTROL_FORM_DEFAULT_VALUES,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: AccessControlForm) => {
    if (!hasPhoto) {
      setShowSnackbar(true);
      return;
    }
    alert("acesso verificado (alerta temporário)");
    console.log(data);
  };

  return (
    <PageBase>
      <Navbar title="registro" />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          px: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "50%",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.surface",
              border: "1px solid",
              borderColor: "neutral.300",
              borderRadius: "12px",
              boxShadow: "sm",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "neutral.200",
                py: 1,
                px: 2,
                bgcolor: "primary.50",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <Typography fontWeight="lg" sx={{ color: "primary.700" }}>
                Informações do visitante
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: "grid", gap: 2 }}>
              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>CPF</FormLabel>
                <Controller
                  name="document"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="000.000.000-00"
                      variant="outlined"
                      sx={{
                        bgcolor: "background.surface",
                      }}
                    />
                  )}
                />
                {errors.document && (
                  <FormHelperText sx={{ color: "danger.500" }}>
                    {errors.document.message}
                  </FormHelperText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>
                  Motivo da visita
                </FormLabel>
                <Controller
                  name="visitationReason"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="insira o motivo da visita" />
                  )}
                />
                {errors.visitationReason && (
                  <FormHelperText sx={{ color: "danger.500" }}>
                    {errors.visitationReason.message}
                  </FormHelperText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>Observações</FormLabel>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => <Textarea {...field} minRows={2} />}
                />
                <FormHelperText sx={{ color: "neutral.500" }}>
                  (Opcional)
                </FormHelperText>
              </FormGroup>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              sx={{ width: "50%" }}
              onClick={handleSubmit(onSubmit)}
              disabled={!hasPhoto}
              color="primary"
              variant="solid"
            >
              Verificar Acesso
            </Button>

            <Button
              sx={{ width: "50%", color: "secondary" }}
              variant="soft"
              onClick={() => setOpenRegisterModal(true)}
            >
              Cadastro de visitante (temp)
            </Button>
          </Box>
        </Box>

        <CameraFeedPanel onCapture={() => setHasPhoto(true)} />
      </Box>

      <RegisterModal
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
      />

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        color="warning"
        variant="soft"
      >
        Tire uma foto antes de verificar o acesso.
      </Snackbar>
    </PageBase>
  );
}
