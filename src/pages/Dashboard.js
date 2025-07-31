import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import ExpenseList from "../components/ExpenseList";
import IncomeList from "../components/IncomeList";
import SummaryDashboard from "../components/SummaryDashboard";
import AddExpenseModal from "../components/AddExpenseModal";
import AddIncomeModal from "../components/AddIncomeModal";
import UpdateModal, { APP_VERSION } from "../components/UpdateModal";
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
  useDisclosure,
  useColorMode,
  HStack,
  Input,
  Select,
  InputGroup,
  InputRightElement,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  SettingsIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  AddIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
registerLocale("pt-BR", ptBR);

function Dashboard({ usuario }) {
  const [categoryColorMap, setCategoryColorMap] = useState({});
  const [gastosDate, setGastosDate] = useState(new Date());
  const [ganhosDate, setGanhosDate] = useState(new Date());
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState(""); // 1. Novo estado para o filtro de status

  const {
    isOpen: isExpenseOpen,
    onOpen: onExpenseOpen,
    onClose: onExpenseClose,
  } = useDisclosure();
  const {
    isOpen: isIncomeOpen,
    onOpen: onIncomeOpen,
    onClose: onIncomeClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();

  useEffect(() => {
    const lastVersionSeen = localStorage.getItem("lastVersionSeen");
    if (lastVersionSeen !== APP_VERSION) {
      onUpdateOpen();
    }
  }, [onUpdateOpen]);

  useEffect(() => {
    if (usuario && usuario.familiaId) {
      const q = query(
        collection(db, "categorias"),
        where("familiaId", "==", usuario.familiaId)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const colorMap = {};
        const sortedCategories = querySnapshot.docs.sort((a, b) =>
          a.data().nome.localeCompare(b.data().nome)
        );
        sortedCategories.forEach((doc) => {
          colorMap[doc.data().nome] = doc.data().cor;
        });
        setCategoryColorMap(colorMap);
      });
      return () => unsubscribe();
    }
  }, [usuario]);

  const handleFabClick = () => {
    if (activeTabIndex === 1) {
      onExpenseOpen();
    } else if (activeTabIndex === 2) {
      onIncomeOpen();
    }
  };
  const handleLogout = async () => {
    await signOut(auth);
  };
  const goToPreviousGastosMonth = () => {
    setGastosDate(
      new Date(gastosDate.getFullYear(), gastosDate.getMonth() - 1, 1)
    );
  };
  const goToNextGastosMonth = () => {
    setGastosDate(
      new Date(gastosDate.getFullYear(), gastosDate.getMonth() + 1, 1)
    );
  };
  const goToPreviousGanhosMonth = () => {
    setGanhosDate(
      new Date(ganhosDate.getFullYear(), ganhosDate.getMonth() - 1, 1)
    );
  };
  const goToNextGanhosMonth = () => {
    setGanhosDate(
      new Date(ganhosDate.getFullYear(), ganhosDate.getMonth() + 1, 1)
    );
  };

  return (
    <Box pb="6rem">
      <Box bg={colorMode === "light" ? "gray.100" : "gray.700"} p={4}>
        <Flex as="header" align="center">
          <Heading as="h1" size={{ base: "md", md: "lg" }}>
            Painel Financeiro
          </Heading>
          <Spacer />
          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Alternar modo de cor"
            mr={2}
          />
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
        <Tabs
          isFitted
          variant="enclosed-colored"
          onChange={(index) => setActiveTabIndex(index)}
        >
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
              <Flex justify="center" align="center" mb={6}>
                <IconButton
                  icon={<ArrowLeftIcon />}
                  onClick={goToPreviousGastosMonth}
                  aria-label="Mês anterior"
                />
                <Box mx={4}>
                  <DatePicker
                    selected={gastosDate}
                    onChange={(date) => setGastosDate(date)}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    locale="pt-BR"
                    customInput={
                      <Button as={Heading} size="lg" variant="ghost">
                        {gastosDate.toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Button>
                    }
                  />
                </Box>
                <IconButton
                  icon={<ArrowRightIcon />}
                  onClick={goToNextGastosMonth}
                  aria-label="Próximo mês"
                />
              </Flex>
              {/* 2. Layout dos filtros atualizado para um Grid */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Select
                  placeholder="Filtrar por categoria"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  {Object.keys(categoryColorMap).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
                <Select
                  placeholder="Filtrar por status"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                </Select>
                <InputGroup>
                  <Input
                    placeholder="Procurar por descrição"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                  {filtroTexto && (
                    <InputRightElement>
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        isRound
                        onClick={() => setFiltroTexto("")}
                        aria-label="Limpar pesquisa"
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </SimpleGrid>
              <ExpenseList
                usuario={usuario}
                currentDate={gastosDate}
                filtroCategoria={filtroCategoria}
                filtroTexto={filtroTexto}
                filtroStatus={filtroStatus} // 3. Passa o novo filtro para a lista
                categoryColorMap={categoryColorMap}
              />
            </TabPanel>
            <TabPanel>
              <Flex justify="center" align="center" mb={6}>
                <IconButton
                  icon={<ArrowLeftIcon />}
                  onClick={goToPreviousGanhosMonth}
                  aria-label="Mês anterior"
                />
                <Box mx={4}>
                  <DatePicker
                    selected={ganhosDate}
                    onChange={(date) => setGanhosDate(date)}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    locale="pt-BR"
                    customInput={
                      <Button as={Heading} size="lg" variant="ghost">
                        {ganhosDate.toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Button>
                    }
                  />
                </Box>
                <IconButton
                  icon={<ArrowRightIcon />}
                  onClick={goToNextGanhosMonth}
                  aria-label="Próximo mês"
                />
              </Flex>
              <IncomeList usuario={usuario} currentDate={ganhosDate} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {(activeTabIndex === 1 || activeTabIndex === 2) && (
        <IconButton
          icon={<AddIcon />}
          isRound={true}
          size="lg"
          colorScheme="blue"
          position="fixed"
          bottom="2rem"
          right="2rem"
          boxShadow="lg"
          zIndex="docked"
          aria-label="Adicionar item"
          onClick={handleFabClick}
        />
      )}
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={onExpenseClose}
        usuario={usuario}
      />
      <AddIncomeModal
        isOpen={isIncomeOpen}
        onClose={onIncomeClose}
        usuario={usuario}
      />
      <UpdateModal isOpen={isUpdateOpen} onClose={onUpdateClose} />
    </Box>
  );
}

export default Dashboard;
