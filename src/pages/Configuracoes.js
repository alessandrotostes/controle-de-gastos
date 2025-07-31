import React, { useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Spacer,
  Button,
  useColorModeValue,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";
import FamilyManager from "../components/FamilyManager";
import SavingsManager from "../components/SavingsManager";

// Um pequeno componente para os nossos botões do menu
const NavButton = ({ children, isActive, ...props }) => {
  return (
    <Button
      variant={isActive ? "solid" : "ghost"}
      colorScheme={isActive ? "blue" : "gray"}
      justifyContent="flex-start"
      w="full"
      {...props}
    >
      {children}
    </Button>
  );
};

function Configuracoes({ usuario }) {
  const [activeTab, setActiveTab] = useState("familia");
  const headerBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const renderContent = () => {
    switch (activeTab) {
      case "familia":
        return <FamilyManager usuario={usuario} />;
      case "categorias":
        return <CategoryManager usuario={usuario} />;
      case "orcamentos":
        return <BudgetManager usuario={usuario} />;
      case "poupancas":
        return <SavingsManager usuario={usuario} />;
      default:
        return <FamilyManager usuario={usuario} />;
    }
  };

  return (
    <Box>
      <Box bg={headerBg} p={4} boxShadow="sm">
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

      {/* --- INÍCIO DO NOVO LAYOUT --- */}
      <Flex
        maxW="container.lg"
        mx="auto"
        mt={8}
        p={4}
        direction={{ base: "column", md: "row" }} // Coluna no mobile, Linha no desktop
        align="flex-start"
      >
        {/* Menu Lateral / Barra Superior */}
        <VStack
          as="nav"
          w={{ base: "full", md: "200px" }}
          minW={{ md: "200px" }}
          mr={{ md: 8 }}
          mb={{ base: 6, md: 0 }}
          spacing={2}
          align="stretch"
        >
          <NavButton
            isActive={activeTab === "familia"}
            onClick={() => setActiveTab("familia")}
          >
            Família
          </NavButton>
          <NavButton
            isActive={activeTab === "categorias"}
            onClick={() => setActiveTab("categorias")}
          >
            Categorias
          </NavButton>
          <NavButton
            isActive={activeTab === "orcamentos"}
            onClick={() => setActiveTab("orcamentos")}
          >
            Orçamentos
          </NavButton>
          <NavButton
            isActive={activeTab === "poupancas"}
            onClick={() => setActiveTab("poupancas")}
          >
            Poupanças
          </NavButton>
        </VStack>

        {/* Área de Conteúdo Principal */}
        <Box
          flex="1"
          w="full"
          borderWidth={{ base: 0, md: "1px" }}
          borderRadius={{ base: 0, md: "lg" }}
          borderColor={borderColor}
          p={{ base: 0, md: 6 }}
        >
          {renderContent()}
        </Box>
      </Flex>
      {/* --- FIM DO NOVO LAYOUT --- */}
    </Box>
  );
}

export default Configuracoes;
