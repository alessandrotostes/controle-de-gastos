import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  IconButton,
  Text,
  useToken,
  VStack,
  Divider,
  HStack,
  Button,
  Progress,
  useColorModeValue,
  StatHelpText,
  StatArrow,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Tooltip,
  useDisclosure,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import ContributeToGoalModal from "./ContributeToGoalModal";

registerLocale("pt-BR", ptBR);
ChartJS.register(ArcElement, ChartTooltip, Legend);

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

function SummaryDashboard({ usuario, categoryColorMap }) {
  const [summaryData, setSummaryData] = useState({
    totalGanhos: 0,
    totalGastos: 0,
    totalPago: 0,
    totalPendente: 0,
    gastosPorCategoria: {},
    gastosPendentes: [],
    orcamentoTotal: 0,
    orcamentosPorCategoria: {},
    totalDividido: 0,
    totalCartao: 0,
    totalAVista: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeGoal, setActiveGoal] = useState(null);
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const {
    isOpen: isContributeOpen,
    onOpen: onContributeOpen,
    onClose: onContributeClose,
  } = useDisclosure();

  const fetchMonthlyData = useCallback(async () => {
    if (!usuario || !usuario.familiaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const startTimestamp = Timestamp.fromDate(startOfMonth);
    const endTimestamp = Timestamp.fromDate(endOfMonth);

    try {
      const budgetDocId = `${
        usuario.familiaId
      }_${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const budgetDocRef = doc(db, "orcamentos", budgetDocId);
      const budgetSnap = await getDoc(budgetDocRef);
      const budgetData = budgetSnap.exists()
        ? budgetSnap.data()
        : { valorTotal: 0, orcamentosPorCategoria: {} };
      const ganhosQuery = query(
        collection(db, "ganhos"),
        where("familiaId", "==", usuario.familiaId),
        where("data", ">=", startTimestamp),
        where("data", "<=", endTimestamp)
      );
      const ganhosSnap = await getDocs(ganhosQuery);
      const totalGanhos = ganhosSnap.docs.reduce(
        (acc, doc) => acc + doc.data().valor,
        0
      );
      const gastosQuery = query(
        collection(db, "gastos"),
        where("familiaId", "==", usuario.familiaId),
        where("data", ">=", startTimestamp),
        where("data", "<=", endTimestamp)
      );
      const gastosSnap = await getDocs(gastosQuery);
      let totalGastos = 0,
        totalPago = 0,
        totalDividido = 0,
        totalCartao = 0,
        totalAVista = 0;
      const gastosPorCategoria = {},
        gastosPendentes = [];
      gastosSnap.forEach((doc) => {
        const gasto = doc.data();
        totalGastos += gasto.valor;
        if (gasto.pago) {
          totalPago += gasto.valor;
        } else {
          gastosPendentes.push({ ...gasto, id: doc.id });
        }
        if (gasto.dividido) {
          totalDividido += gasto.valor;
        }
        if (gasto.metodoPagamento === "Cartão de Crédito") {
          totalCartao += gasto.valor;
        } else {
          totalAVista += gasto.valor;
        }
        gastosPorCategoria[gasto.categoria] =
          (gastosPorCategoria[gasto.categoria] || 0) + gasto.valor;
      });
      setSummaryData({
        totalGanhos,
        totalGastos,
        totalPago,
        totalDividido,
        totalCartao,
        totalAVista,
        totalPendente: totalGastos - totalPago,
        gastosPorCategoria,
        gastosPendentes: gastosPendentes.sort(
          (a, b) => a.data.seconds - b.data.seconds
        ),
        orcamentoTotal: budgetData.valorTotal,
        orcamentosPorCategoria: budgetData.orcamentosPorCategoria || {},
      });
    } catch (error) {
      console.error("Erro ao buscar dados do resumo:", error);
    } finally {
      setLoading(false);
    }
  }, [usuario, currentDate]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  useEffect(() => {
    if (!usuario || !usuario.familiaId) return;
    const goalsQuery = query(
      collection(db, "metas"),
      where("familiaId", "==", usuario.familiaId),
      where("status", "==", "Ativa"),
      limit(1)
    );
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const goalData = snapshot.docs[0].data();
        setActiveGoal({ id: snapshot.docs[0].id, ...goalData });
      } else {
        setActiveGoal(null);
      }
    });
    return () => unsubscribeGoals();
  }, [usuario]);

  const handleMarkAsPaid = async (gastoId) => {
    const gastoDocRef = doc(db, "gastos", gastoId);
    try {
      await updateDoc(gastoDocRef, { pago: true });
      fetchMonthlyData();
    } catch (error) {
      console.error("Erro ao marcar como pago: ", error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const categoryLabels = Object.keys(summaryData.gastosPorCategoria);
  const backgroundColorsKeys = categoryLabels.map(
    (cat) => categoryColorMap[cat] || "gray.300"
  );
  const borderColorsKeys = categoryLabels.map((cat) => {
    const color = categoryColorMap[cat] || "gray.500";
    const baseColor = color.split(".")[0];
    return `${baseColor}.500`;
  });
  const resolvedBackgroundColors = useToken("colors", backgroundColorsKeys);
  const resolvedBorderColors = useToken("colors", borderColorsKeys);
  const budgetCategoryLabels = Object.keys(summaryData.orcamentosPorCategoria);
  const budgetBackgroundColorsKeys = budgetCategoryLabels.map(
    (cat) => categoryColorMap[cat] || "gray.500"
  );
  const resolvedBudgetBackgroundColors = useToken(
    "colors",
    budgetBackgroundColorsKeys
  );
  const resolvedBudgetColorMap = {};
  budgetCategoryLabels.forEach((label, index) => {
    resolvedBudgetColorMap[label] = resolvedBudgetBackgroundColors[index];
  });
  const chartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Gastos por Categoria",
        data: Object.values(summaryData.gastosPorCategoria),
        backgroundColor: resolvedBackgroundColors,
        borderColor: resolvedBorderColors,
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box>
        <Flex justify="center" align="center" mb={6}>
          <SkeletonCircle size="10" />
          <Skeleton height="40px" width="250px" mx={6} />
          <SkeletonCircle size="10" />
        </Flex>
        <SimpleGrid
          columns={{ base: 2, md: 4 }}
          spacing={{ base: 3, md: 6 }}
          mb={8}
        >
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
          </Box>
        </SimpleGrid>
        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          <Box flex="1" align="center">
            <Skeleton height="24px" width="220px" mb={4} />
            <SkeletonCircle size="250px" />
          </Box>
          <Divider orientation={{ base: "horizontal", lg: "vertical" }} />
          <Box flex="1">
            <Skeleton height="24px" width="220px" mb={4} />
            <SkeletonText noOfLines={5} spacing="4" />
          </Box>
        </Flex>
      </Box>
    );
  }

  const hasCategoryBudgets = Object.values(
    summaryData.orcamentosPorCategoria
  ).some((budget) => budget > 0);
  const saldoFinal = summaryData.totalGanhos - summaryData.totalGastos;

  return (
    <Box>
      <Flex justify="center" align="center" mb={8}>
        <IconButton
          icon={<ArrowLeftIcon />}
          onClick={goToPreviousMonth}
          aria-label="Mês anterior"
        />
        <Box mx={4}>
          <DatePicker
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="pt-BR"
            customInput={
              <Button as={Heading} size="lg" variant="ghost">
                {currentDate.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Button>
            }
          />
        </Box>
        <IconButton
          icon={<ArrowRightIcon />}
          onClick={goToNextMonth}
          aria-label="Próximo mês"
        />
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
        <TabList flexWrap="wrap" justifyContent="center">
          <Tab>Visão Geral</Tab>
          <Tab>Análise de Gastos</Tab>
          <Tab>Orçamento</Tab>
          <Tab>Pendentes</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0} pt={6}>
            <VStack spacing={6}>
              {activeGoal && (
                <Box
                  w="full"
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="md"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading as="h3" size="md">
                      {activeGoal.nome}
                    </Heading>
                    <Tag colorScheme="green">Meta Ativa</Tag>
                  </Flex>
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {" "}
                    R$ {activeGoal.valorAtual.toFixed(2)}{" "}
                    {activeGoal.valorAlvo > 0 && (
                      <Text
                        as="span"
                        fontSize="md"
                        color="gray.500"
                        fontWeight="normal"
                      >
                        {" "}
                        / R$ {activeGoal.valorAlvo.toFixed(2)}
                      </Text>
                    )}
                  </Text>
                  {activeGoal.valorAlvo > 0 && (
                    <Progress
                      value={
                        (activeGoal.valorAtual / activeGoal.valorAlvo) * 100
                      }
                      size="lg"
                      colorScheme="green"
                      borderRadius="md"
                      my={3}
                    />
                  )}
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    onClick={onContributeOpen}
                    isDisabled={saldoFinal <= 0}
                    mt={3}
                  >
                    Adicionar Saldo à Poupança
                  </Button>
                </Box>
              )}
              <Stat
                w="full"
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                textAlign="center"
                boxShadow="md"
              >
                <StatLabel fontSize="xl">Saldo Final Previsto</StatLabel>
                <StatNumber
                  fontSize={{ base: "3xl", md: "4xl" }}
                  color={saldoFinal >= 0 ? "green.500" : "red.500"}
                >
                  R$ {saldoFinal.toFixed(2)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={saldoFinal >= 0 ? "increase" : "decrease"} />
                  Após todos os gastos do mês
                </StatHelpText>
              </Stat>
            </VStack>
          </TabPanel>

          <TabPanel px={0} pt={6}>
            <VStack spacing={8}>
              <Box w="full">
                <Heading as="h4" size="md" mb={4} textAlign="center">
                  Distribuição de Gastos
                </Heading>
                <Box maxW="400px" mx="auto">
                  {Object.keys(summaryData.gastosPorCategoria).length > 0 ? (
                    <Doughnut data={chartData} />
                  ) : (
                    <Text textAlign="center">
                      Nenhum gasto registado para este mês.
                    </Text>
                  )}
                </Box>
              </Box>
              <Box w="full">
                <Heading as="h4" size="md" mb={4} textAlign="center">
                  Detalhes dos Gastos
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, md: 3 }}
                  spacing={{ base: 3, md: 6 }}
                >
                  <Stat p={4} borderWidth="1px" borderRadius="lg">
                    <StatLabel>Total Dividido</StatLabel>
                    <StatNumber color="green.600">
                      R$ {summaryData.totalDividido.toFixed(2)}
                    </StatNumber>
                    <StatHelpText>
                      R$ {(summaryData.totalDividido / 2).toFixed(2)} para cada
                    </StatHelpText>
                  </Stat>
                  <Stat p={4} borderWidth="1px" borderRadius="lg">
                    <StatLabel>Gastos no Cartão</StatLabel>
                    <StatNumber color="blue.500">
                      R$ {summaryData.totalCartao.toFixed(2)}
                    </StatNumber>
                  </Stat>
                  <Stat p={4} borderWidth="1px" borderRadius="lg">
                    <StatLabel>Gastos à Vista</StatLabel>
                    <StatNumber color="gray.600">
                      R$ {summaryData.totalAVista.toFixed(2)}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>
            </VStack>
          </TabPanel>

          <TabPanel px={0} pt={6}>
            {summaryData.orcamentoTotal > 0 || hasCategoryBudgets ? (
              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Heading as="h4" size="md" mb={4}>
                  Progresso do Orçamento
                </Heading>
                <VStack spacing={4} align="stretch">
                  {summaryData.orcamentoTotal > 0 && (
                    <Box>
                      {" "}
                      <Flex justify="space-between" mb={1}>
                        <Text fontWeight="bold">Orçamento Total</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {(
                            (summaryData.totalGastos /
                              summaryData.orcamentoTotal) *
                            100
                          ).toFixed(0)}
                          %
                        </Text>
                      </Flex>{" "}
                      <Progress
                        value={
                          (summaryData.totalGastos /
                            summaryData.orcamentoTotal) *
                          100
                        }
                        size="lg"
                        colorScheme={
                          summaryData.totalGastos > summaryData.orcamentoTotal
                            ? "red"
                            : "green"
                        }
                        borderRadius="md"
                      />{" "}
                    </Box>
                  )}
                  {Object.entries(summaryData.orcamentosPorCategoria)
                    .filter(([_, budget]) => budget > 0)
                    .map(([categoria, orcamento]) => {
                      const gastoCategoria =
                        summaryData.gastosPorCategoria[categoria] || 0;
                      const percentagem = (gastoCategoria / orcamento) * 100;
                      const specificColor = resolvedBudgetColorMap[categoria];
                      return (
                        <Box key={categoria}>
                          {" "}
                          <Flex justify="space-between" mb={1}>
                            <Text>{categoria}</Text>
                            <Text fontSize="sm">
                              R$ {gastoCategoria.toFixed(2)} de R${" "}
                              {orcamento.toFixed(2)}
                            </Text>
                          </Flex>{" "}
                          <Progress
                            value={percentagem}
                            size="sm"
                            borderRadius="md"
                            sx={{
                              "& > div": {
                                backgroundColor:
                                  percentagem > 100 ? "red.500" : specificColor,
                              },
                            }}
                          />{" "}
                        </Box>
                      );
                    })}
                </VStack>
              </Box>
            ) : (
              <Text textAlign="center">
                Nenhum orçamento definido para este mês. Vá a Configurações para
                adicionar.
              </Text>
            )}
          </TabPanel>

          <TabPanel px={0} pt={6}>
            <Box maxH={{ base: "auto", lg: "400px" }} overflowY="auto">
              <Heading as="h4" size="md" mb={4}>
                Gastos Pendentes do Mês
              </Heading>
              {summaryData.gastosPendentes.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {summaryData.gastosPendentes.map((gasto) => (
                    <HStack
                      key={gasto.id}
                      justify="space-between"
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                    >
                      <Box>
                        <Text fontWeight="medium">{gasto.descricao}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(gasto.data)}
                        </Text>
                      </Box>
                      <HStack>
                        <Text fontWeight="bold">
                          R$ {gasto.valor.toFixed(2)}
                        </Text>
                        <Tooltip label="Marcar como pago">
                          <IconButton
                            icon={<CheckCircleIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            aria-label="Marcar como pago"
                            onClick={() => handleMarkAsPaid(gasto.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text textAlign="center">
                  Nenhum gasto pendente para este mês. Ótimo trabalho!
                </Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <ContributeToGoalModal
        isOpen={isContributeOpen}
        onClose={onContributeClose}
        goal={activeGoal}
        monthlyBalance={saldoFinal}
      />
    </Box>
  );
}

export default SummaryDashboard;
