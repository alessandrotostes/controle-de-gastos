// src/pages/Cadastro.js - CÓDIGO FINAL E CORRETO
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      navigate("/login");
    } catch (error) {
      setErro(
        "Ocorreu um erro. Verifique se o e-mail é válido e a senha tem pelo menos 6 caracteres."
      );
      console.error("Erro no cadastro:", error);
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50">
      <VStack
        as="form"
        onSubmit={handleCadastro}
        spacing={4}
        w="full"
        maxW="md"
        p={8}
        bg="white"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="lg" mb={6}>
          Crie sua Conta
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
            placeholder="Pelo menos 6 caracteres"
          />
        </FormControl>

        {erro && <Text color="red.500">{erro}</Text>}

        <Button type="submit" colorScheme="blue" width="full">
          Cadastrar
        </Button>

        <Text>
          Já tem uma conta?{" "}
          <Link as={RouterLink} to="/login" color="blue.500">
            Faça Login
          </Link>
        </Text>
      </VStack>
    </Flex>
  );
}

export default Cadastro;
