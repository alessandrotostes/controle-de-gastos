import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ChakraProvider, Center, Spinner } from "@chakra-ui/react";
import { theme } from "./theme";

// Nossas páginas
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound"; // 1. Importe a nova página
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUsuario(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ChakraProvider theme={theme}>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute usuario={usuario}>
                <Dashboard usuario={usuario} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute usuario={usuario}>
                <Configuracoes usuario={usuario} />
              </ProtectedRoute>
            }
          />

          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Navigate to="/login" />} />

          {/* 2. Rota "Apanha-Tudo" - Deve ser a ÚLTIMA rota da lista */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
