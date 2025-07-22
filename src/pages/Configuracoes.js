// src/pages/Configuracoes.js
import React from "react";
import {
  Box,
  Container,
  Heading,
  Flex,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CategoryManager from "../components/CategoryManager"; // Importe o gestor

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
      </Container>
    </Box>
  );
}

export default Configuracoes;
