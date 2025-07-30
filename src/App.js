import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { ChakraProvider, Center, Spinner } from "@chakra-ui/react";
import { theme } from "./theme";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ActionPage from "./pages/ActionPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfAuth from "./components/RedirectIfAuth";

function App() {
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      try {
        if (userAuth) {
          const userDocRef = doc(db, "usuarios", userAuth.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setPerfilUsuario({ ...userAuth, ...docSnap.data() });
          } else {
            const familiaDocRef = doc(collection(db, "familias"));
            await setDoc(familiaDocRef, {
              nome: `Família de ${userAuth.email}`,
              membros: [userAuth.uid],
              ownerId: userAuth.uid,
            });
            const novoPerfil = {
              email: userAuth.email,
              familiaId: familiaDocRef.id,
            };
            await setDoc(userDocRef, novoPerfil);
            setPerfilUsuario({ ...userAuth, ...novoPerfil });
          }
        } else {
          setPerfilUsuario(null);
        }
      } catch (error) {
        console.error("ERRO CRÍTICO no useEffect do App.js:", error);
        setPerfilUsuario(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // O 'if (loading)' aqui continua importante para o carregamento inicial da aplicação
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
              <ProtectedRoute usuario={perfilUsuario}>
                <Dashboard usuario={perfilUsuario} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute usuario={perfilUsuario}>
                <Configuracoes usuario={perfilUsuario} />
              </ProtectedRoute>
            }
          />

          {/* AQUI ESTÁ A MUDANÇA: Passamos a propriedade 'loading' para o RedirectIfAuth */}
          <Route
            path="/login"
            element={
              <RedirectIfAuth usuario={perfilUsuario} loading={loading}>
                <Login />
              </RedirectIfAuth>
            }
          />

          <Route path="/cadastro" element={<Navigate to="/login" />} />
          <Route path="/action" element={<ActionPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
