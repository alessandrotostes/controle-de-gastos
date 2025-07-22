// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Text,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";

import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import IncomeForm from "../components/IncomeForm";
import IncomeList from "../components/IncomeList";
import SummaryDashboard from "../components/SummaryDashboard";

function Dashboard({ usuario }) {
  const [categoryColorMap, setCategoryColorMap] = useState({});

  useEffect(() => {
    if (usuario) {
      const q = query(
        collection(db, "categorias"),
        where("userId", "==", usuario.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const colorMap = {};
        querySnapshot.forEach((doc) => {
          colorMap[doc.data().nome] = doc.data().cor;
        });
        setCategoryColorMap(colorMap);
      });
      return () => unsubscribe();
    }
  }, [usuario]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Box>
      <Box bg="gray.100" p={4}>
        <Flex as="header" align="center">
          <Heading as="h1" size={{ base: "md", md: "lg" }}>
            Painel Financeiro
          </Heading>
          <Spacer />
          <IconButton
            as={RouterLink}
            to="/configuracoes"
            aria-label="Configurações"
            icon={<SettingsIcon />}
            variant="ghost"
            mr={2}
          />
          <Text mr={4} display={{ base: "none", md: "inline" }}>
            {usuario.email}
          </Text>
          <Button onClick={handleLogout} colorScheme="red" size="sm">
            Sair
          </Button>
        </Flex>
      </Box>

      <Container maxW="container.lg" mt={8}>
        <Tabs isFitted variant="enclosed-colored">
          <TabList mb="1em">
            <Tab>Resumo Mensal</Tab>
            <Tab>Gastos</Tab>
            <Tab>Ganhos</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SummaryDashboard
                usuario={usuario}
                categoryColorMap={categoryColorMap}
              />
            </TabPanel>
            <TabPanel>
              <ExpenseForm usuario={usuario} />
              <Divider my={8} />
              <ExpenseList usuario={usuario} />
            </TabPanel>
            <TabPanel>
              <IncomeForm usuario={usuario} />
              <Divider my={8} />
              <IncomeList usuario={usuario} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}

export default Dashboard;
