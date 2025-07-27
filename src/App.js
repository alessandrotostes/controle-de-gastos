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
import NotFound from "./pages/NotFound";
import ActionPage from "./pages/ActionPage"; // 1. Importe a nova página
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

          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Navigate to="/login" />} />

          {/* 2. Adicione a nova rota pública para as ações de email */}
          <Route path="/action" element={<ActionPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
