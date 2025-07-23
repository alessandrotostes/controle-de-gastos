// src/theme.js
import { extendTheme } from "@chakra-ui/react";

// 1. Defina a configuração do modo de cor
const config = {
  initialColorMode: "system", // 'light', 'dark', ou 'system' (usa a preferência do SO)
  useSystemColorMode: true, // Sincroniza com as mudanças do modo de cor do SO
};

// 2. Passe a configuração para o extendTheme
export const theme = extendTheme({
  config,
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac",
    },
  },
});
