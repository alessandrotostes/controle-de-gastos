import React from "react";
import { Navigate } from "react-router-dom";
import { Center, Spinner, ChakraProvider } from "@chakra-ui/react";
import { theme } from "../theme";

function RedirectIfAuth({ usuario, loading, children }) {
  // 1. Se a aplicação ainda está a verificar o utilizador, mostra um ecrã de carregamento.
  // Isto bloqueia o "piscar" da página de login.
  if (loading) {
    return (
      <ChakraProvider theme={theme}>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </ChakraProvider>
    );
  }

  // 2. Se a verificação terminou E existe um utilizador, redireciona para o painel.
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  // 3. Se a verificação terminou E não há utilizador, mostra a página (Login).
  return children;
}

export default RedirectIfAuth;
