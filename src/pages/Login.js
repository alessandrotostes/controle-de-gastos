// src/pages/Login.js - CÓDIGO FINAL E CORRETO
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {
  Box,
  Button,
  Flex,
  FormControl, // Corrigido
  FormLabel, // Corrigido
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/");
    } catch (error) {
      setErro("E-mail ou senha inválidos.");
      console.error("Erro no login:", error);
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50">
      <VStack
        as="form"
        onSubmit={handleLogin}
        spacing={4}
        w="full"
        maxW="md"
        p={8}
        bg="white"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="lg" mb={6}>
          Entrar na sua Conta
        </Heading>

        <FormControl isRequired>
          {" "}
          {/* Corrigido */}
          <FormLabel>E-mail</FormLabel> {/* Corrigido */}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu-email@exemplo.com"
          />
        </FormControl>

        <FormControl isRequired>
          {" "}
          {/* Corrigido */}
          <FormLabel>Senha</FormLabel> {/* Corrigido */}
          <Input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
          />
        </FormControl>

        {erro && <Text color="red.500">{erro}</Text>}

        <Button type="submit" colorScheme="blue" width="full">
          Entrar
        </Button>
      </VStack>
    </Flex>
  );
}

export default Login;
