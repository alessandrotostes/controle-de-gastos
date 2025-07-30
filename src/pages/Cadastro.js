// src/pages/Cadastro.js
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";

function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const pageBg = useColorModeValue("gray.50", "gray.800");
  const formBg = useColorModeValue("white", "gray.700");

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      // 1. Cria o utilizador no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;

      // 2. Cria uma nova "família" para este utilizador na coleção 'familias'
      const familiaDocRef = doc(collection(db, "familias")); // Cria uma referência com ID automático
      await setDoc(familiaDocRef, {
        nome: `Família de ${email}`, // Um nome padrão
        membros: [user.uid], // Adiciona o ID do utilizador como primeiro membro
        ownerId: user.uid, // Guarda quem é o "dono" da família
      });

      // 3. Guarda o perfil do utilizador na coleção 'usuarios', incluindo a que família ele pertence
      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        familiaId: familiaDocRef.id, // Guarda o ID da família que acabámos de criar
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer o login.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      setErro(
        "Ocorreu um erro. Verifique se o e-mail é válido e a senha tem pelo menos 6 caracteres."
      );
      console.error("Erro no cadastro:", error);
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg={pageBg}>
      <VStack
        as="form"
        onSubmit={handleCadastro}
        spacing={4}
        w="full"
        maxW="md"
        p={8}
        bg={formBg}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="lg" mb={6}>
          Crie sua Conta
        </Heading>
        <FormControl isRequired>
          <FormLabel>E-mail</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu-email@exemplo.com"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Senha</FormLabel>
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
        <Text pt={4}>
          {" "}
          Já tem uma conta?{" "}
          <Link as={RouterLink} to="/login" color="blue.500">
            Faça Login
          </Link>{" "}
        </Text>
      </VStack>
    </Flex>
  );
}

export default Cadastro;
