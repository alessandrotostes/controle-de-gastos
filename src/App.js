// src/App.js - VERSÃO COMPLETA E CORRIGIDA
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme";

// Nossas páginas
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Configuracoes from "./pages/Configuracoes"; // A importação está aqui
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
    return <div>Carregando...</div>;
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
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* E o uso da importação está aqui, na nova rota */}
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute usuario={usuario}>
                <Configuracoes usuario={usuario} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
