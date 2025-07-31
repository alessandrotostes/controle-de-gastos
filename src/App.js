import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  ChakraProvider,
  Center,
  VStack,
  Heading,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { theme } from "./theme";
import { motion } from "framer-motion";
import { FaPiggyBank } from "react-icons/fa";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ActionPage from "./pages/ActionPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfAuth from "./components/RedirectIfAuth";

// A constante MotionBox já não é necessária

function LoadingScreen() {
  const bg = useColorModeValue("gray.50", "gray.800");
  return (
    <Center h="100vh" bg={bg}>
      <VStack spacing={4}>
        {/* Usamos 'motion.div' diretamente para a animação */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon as={FaPiggyBank} boxSize={16} color="blue.500" />
        </motion.div>
        <Heading size="md" color="gray.500">
          Carregando seu painel...
        </Heading>
      </VStack>
    </Center>
  );
}

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
            const conviteQuery = query(
              collection(db, "convites"),
              where("emailConvidado", "==", userAuth.email),
              where("status", "==", "pendente")
            );
            const conviteSnap = await getDocs(conviteQuery);

            if (!conviteSnap.empty) {
              const convite = conviteSnap.docs[0].data();
              const conviteId = conviteSnap.docs[0].id;
              const novoPerfil = {
                email: userAuth.email,
                familiaId: convite.familiaId,
              };
              await setDoc(userDocRef, novoPerfil);
              const familiaRef = doc(db, "familias", convite.familiaId);
              await updateDoc(familiaRef, {
                membros: arrayUnion(userAuth.uid),
              });
              const conviteRef = doc(db, "convites", conviteId);
              await updateDoc(conviteRef, { status: "aceite" });
              setPerfilUsuario({ ...userAuth, ...novoPerfil });
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
          }
        } else {
          setPerfilUsuario(null);
        }
      } catch (error) {
        console.error("ERRO CRÍTICO no useEffect do App.js:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider theme={theme}>
      {loading ? (
        <LoadingScreen />
      ) : (
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
      )}
    </ChakraProvider>
  );
}

export default App;
