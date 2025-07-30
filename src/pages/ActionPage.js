// src/pages/ActionPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  getAuth,
} from "firebase/auth";
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
  VStack,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

function ActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();

  const [status, setStatus] = useState("verifying");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [validations, setValidations] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      setError("Código de ação inválido ou em falta.");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setStatus("valid");
      })
      .catch(() => {
        setStatus("invalid");
        setError(
          "O link de redefinição de senha é inválido ou já expirou. Por favor, tente novamente."
        );
      });
  }, [oobCode, auth]);

  useEffect(() => {
    setValidations({
      minLength: newPassword.length >= 6,
      hasLower: /[a-z]/.test(newPassword),
      hasUpper: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    });
  }, [newPassword]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As palavras-passe não são iguais.");
      return;
    }
    if (!Object.values(validations).every(Boolean)) {
      setError("A sua palavra-passe não cumpre todos os requisitos.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      toast({
        title: "Palavra-passe alterada!",
        description: "Você será redirecionado para a página de login.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Erro ao redefinir palavra-passe:", error);
      setError("Não foi possível redefinir a palavra-passe. Tente novamente.");
    }
  };

  const pageBg = useColorModeValue("gray.50", "gray.800");
  const formBg = useColorModeValue("white", "gray.700");

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return <Spinner size="xl" />;
      case "valid":
        return (
          <VStack
            as="form"
            onSubmit={handleResetPassword}
            spacing={4}
            w="full"
            maxW="md"
            p={8}
            bg={formBg}
            borderRadius="lg"
            boxShadow="lg"
          >
            <Heading as="h1" size="lg" mb={4}>
              Defina a sua Nova Palavra-passe
            </Heading>

            <FormControl isRequired>
              <FormLabel>Nova Palavra-passe</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>

            {/* --- INÍCIO DA CORREÇÃO --- */}
            {/* O <List> envolve todos os <ListItem> */}
            <List spacing={1} fontSize="sm" w="full" pl={1} color="gray.500">
              <ListItem
                display="flex"
                alignItems="center"
                color={validations.minLength ? "green.500" : "inherit"}
              >
                <ListIcon as={validations.minLength ? CheckIcon : CloseIcon} />
                Pelo menos 6 caracteres
              </ListItem>
              <ListItem
                display="flex"
                alignItems="center"
                color={validations.hasLower ? "green.500" : "inherit"}
              >
                <ListIcon as={validations.hasLower ? CheckIcon : CloseIcon} />
                Uma letra minúscula (a-z)
              </ListItem>
              <ListItem
                display="flex"
                alignItems="center"
                color={validations.hasUpper ? "green.500" : "inherit"}
              >
                <ListIcon as={validations.hasUpper ? CheckIcon : CloseIcon} />
                Uma letra maiúscula (A-Z)
              </ListItem>
              <ListItem
                display="flex"
                alignItems="center"
                color={validations.hasNumber ? "green.500" : "inherit"}
              >
                <ListIcon as={validations.hasNumber ? CheckIcon : CloseIcon} />
                Um número (0-9)
              </ListItem>
              <ListItem
                display="flex"
                alignItems="center"
                color={validations.hasSpecial ? "green.500" : "inherit"}
              >
                <ListIcon as={validations.hasSpecial ? CheckIcon : CloseIcon} />
                Um caracter especial (!@#...)
              </ListItem>
            </List>
            {/* --- FIM DA CORREÇÃO --- */}

            <FormControl
              isRequired
              isInvalid={
                newPassword !== confirmPassword && confirmPassword.length > 0
              }
            >
              <FormLabel>Confirmar Nova Palavra-passe</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>

            {error && (
              <Text color="red.500" pt={2}>
                {error}
              </Text>
            )}
            <Button type="submit" colorScheme="blue" width="full" mt={4}>
              Salvar Nova Palavra-passe
            </Button>
          </VStack>
        );
      case "success":
        return (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Palavra-passe alterada com sucesso! Redirecionando...
          </Alert>
        );
      case "invalid":
      default:
        return (
          <Box textAlign="center">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
            <Button mt={6} onClick={() => navigate("/login")}>
              Voltar para o Login
            </Button>
          </Box>
        );
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg={pageBg}>
      {renderContent()}
    </Flex>
  );
}

export default ActionPage;
