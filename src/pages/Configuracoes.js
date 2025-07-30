import React from "react";
import {
  Box,
  Container,
  Heading,
  Flex,
  Spacer,
  Button,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";
import FamilyManager from "../components/FamilyManager";

function Configuracoes({ usuario }) {
  const headerBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Box>
      <Box bg={headerBg} p={4}>
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
        <FamilyManager usuario={usuario} />
        <Divider my={10} />
        <CategoryManager usuario={usuario} />
        <Divider my={10} />
        <BudgetManager usuario={usuario} />
      </Container>
    </Box>
  );
}

export default Configuracoes;
