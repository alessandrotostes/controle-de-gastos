// src/pages/NotFound.js
import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function NotFound() {
  const pageBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={pageBg}
      textAlign="center"
      px={4}
    >
      <Box>
        <Heading
          display="inline-block"
          as="h2"
          size="4xl"
          bgGradient="linear(to-r, blue.400, blue.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="2xl" mt={3} mb={2}>
          Página Não Encontrada
        </Text>
        <Text color={"gray.500"} mb={6}>
          O endereço que você procurava não existe.
        </Text>

        <Button
          as={RouterLink}
          to="/"
          colorScheme="blue"
          bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
          color="white"
          variant="solid"
        >
          Voltar ao Painel Principal
        </Button>
      </Box>
    </Flex>
  );
}

export default NotFound;
