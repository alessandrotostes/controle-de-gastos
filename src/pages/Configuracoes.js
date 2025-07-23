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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager"; // 1. Importe o novo gestor

function Configuracoes({ usuario }) {
  return (
    <Box>
      <Box bg="gray.100" p={4}>
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
        <Divider my={10} /> {/* Divisor para separar as secções */}
        <BudgetManager usuario={usuario} />{" "}
        {/* 2. Adicione o componente aqui */}
      </Container>
    </Box>
  );
}

export default Configuracoes;
