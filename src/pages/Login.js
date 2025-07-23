import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
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

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const pageBg = useColorModeValue("gray.50", "gray.800");
  const formBg = useColorModeValue("white", "gray.700");

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

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description:
          "Por favor, insira o seu email no campo acima para redefinir a palavra-passe.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email de redefinição enviado!",
        description:
          "Verifique a sua caixa de entrada para definir uma nova palavra-passe.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          "Não foi possível enviar o email. Verifique se o email está correto.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg={pageBg}>
      <VStack
        as="form"
        onSubmit={handleLogin}
        spacing={4}
        w="full"
        maxW="md"
        p={8}
        bg={formBg}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="lg" mb={6}>
          Entrar na sua Conta
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
            placeholder="Sua senha"
          />
        </FormControl>

        {erro && <Text color="red.500">{erro}</Text>}

        <Flex w="full" justify="flex-end">
          <Link color="blue.500" onClick={handlePasswordReset} fontSize="sm">
            Esqueci-me da palavra-passe
          </Link>
        </Flex>

        <Button type="submit" colorScheme="blue" width="full">
          Entrar
        </Button>
      </VStack>
    </Flex>
  );
}

export default Login;
