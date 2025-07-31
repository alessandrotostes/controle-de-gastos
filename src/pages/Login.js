import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const pageBg = useColorModeValue(
    "linear-gradient(to bottom right, #f7fafc, #edf2f7)",
    "linear-gradient(to bottom right, #2d3748, #1a202c)"
  );
  const formBg = useColorModeValue("white", "gray.700");
  const formBorderColor = useColorModeValue("gray.200", "gray.600");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      setErro("E-mail ou senha inválidos.");
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
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
          "Verifique a sua caixa de entrada para definir uma nova palavra-passe.Lembre-se de verificar a caixa de spam.",
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
        spacing={6} // Aumentei um pouco o espaçamento
        w="full"
        maxW="md"
        p={10} // Aumentei um pouco o padding
        bg={formBg}
        borderRadius="md" // Ligeiramente menos arredondado
        boxShadow="xl" // Uma sombra maior para um efeito mais "elevado"
        borderWidth="1px"
        borderColor={formBorderColor}
      >
        <Heading as="h1" size="xl" mb={8} textAlign="center">
          Entrar na sua Conta
        </Heading>

        <FormControl isRequired>
          <FormLabel>E-mail</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu-email@exemplo.com"
            isDisabled={isLoading}
            size="lg" // Inputs um pouco maiores
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Senha</FormLabel>
          <Input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            isDisabled={isLoading}
            size="lg"
          />
        </FormControl>

        {erro && <Text color="red.500">{erro}</Text>}

        <Flex w="full" justify="flex-end" mt={2}>
          <Link color="blue.500" onClick={handlePasswordReset} fontSize="sm">
            Esqueci-me da palavra-passe
          </Link>
        </Flex>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
          size="lg" // Botão maior
        >
          Entrar
        </Button>
      </VStack>
    </Flex>
  );
}

export default Login;
