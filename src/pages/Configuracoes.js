// src/pages/Configuracoes.js
import React from "react";
import {
  Box,
  Container,
  Heading,
  Flex,
  Spacer,
  Button,
  Divider,
  useColorMode, // 1. Importe o useColorMode
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";

function Configuracoes({ usuario }) {
  // 2. Obtenha o modo de cor atual
  const { colorMode } = useColorMode();

  return (
    <Box>
      {/* 3. Aplique a cor de fundo condicional */}
      <Box bg={colorMode === "light" ? "gray.100" : "gray.700"} p={4}>
        <Flex as="header" align="center">
          <Heading as="h1" size="lg">
            Configurações
          </Heading>
          <Spacer />
          <Button as={RouterLink} to="/">
            Voltar ao Painel
          </Button>
        </Flex>
      </Box>
      <Container maxW="container.md" mt={8}>
        <CategoryManager usuario={usuario} />

        <Divider my={10} />

        <BudgetManager usuario={usuario} />
      </Container>
    </Box>
  );
}

export default Configuracoes;
