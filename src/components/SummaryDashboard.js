import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
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

registerLocale("pt-BR", ptBR);
ChartJS.register(ArcElement, ChartTooltip, Legend);

const formatDate = (timestamp) => {
  /* ... */
};

function SummaryDashboard({ usuario, categoryColorMap }) {
  const [summaryData, setSummaryData] = useState({
    /* ... */
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    /* ... */
  }, [usuario, currentDate]);

  const handleMarkAsPaid = async (gastoId) => {
    /* ... */
  };
  const goToPreviousMonth = () => {
    /* ... */
  };
  const goToNextMonth = () => {
    /* ... */
  };

  // --- INÍCIO DA LÓGICA DE CORES ATUALIZADA ---

  // 1. Resolve as cores para o GRÁFICO (como antes)
  const chartCategoryLabels = Object.keys(summaryData.gastosPorCategoria);
  const chartBackgroundColorsKeys = chartCategoryLabels.map(
    (cat) => categoryColorMap[cat] || "gray.300"
  );
  const chartBorderColorsKeys = chartCategoryLabels.map((cat) => {
    const color = categoryColorMap[cat] || "gray.500";
    const baseColor = color.split(".")[0];
    return `${baseColor}.500`;
  });
  const resolvedChartBackgroundColors = useToken(
    "colors",
    chartBackgroundColorsKeys
  );
  const resolvedChartBorderColors = useToken("colors", chartBorderColorsKeys);

  // 2. Resolve as cores para as BARRAS DE PROGRESSO
  const budgetCategoryLabels = Object.keys(summaryData.orcamentosPorCategoria);
  const budgetBackgroundColorsKeys = budgetCategoryLabels.map(
    (cat) => categoryColorMap[cat] || "gray.500"
  );
  const resolvedBudgetBackgroundColors = useToken(
    "colors",
    budgetBackgroundColorsKeys
  );

  // 3. Cria um mapa de nomes de categoria para cores resolvidas (HEX, RGB, etc.)
  const resolvedBudgetColorMap = {};
  budgetCategoryLabels.forEach((label, index) => {
    resolvedBudgetColorMap[label] = resolvedBudgetBackgroundColors[index];
  });

  // --- FIM DA LÓGICA DE CORES ATUALIZADA ---

  const chartData = {
    labels: chartCategoryLabels,
    datasets: [
      {
        label: "Gastos por Categoria",
        data: Object.values(summaryData.gastosPorCategoria),
        backgroundColor: resolvedChartBackgroundColors,
        borderColor: resolvedChartBorderColors,
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <Box>{/* ... skeleton ... */}</Box>;
  }

  const hasCategoryBudgets = Object.values(
    summaryData.orcamentosPorCategoria
  ).some((budget) => budget > 0);
  const saldoFinal = summaryData.totalGanhos - summaryData.totalGastos;

  return (
    <Box>
      {/* ... (Seletor de Mês e Stats sem alterações) ... */}

      {(summaryData.orcamentoTotal > 0 || hasCategoryBudgets) && (
        <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h4" size="md" mb={4}>
            Progresso do Orçamento
          </Heading>
          <VStack spacing={4} align="stretch">
            {summaryData.orcamentoTotal > 0 && (
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="bold">Orçamento Total</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {(
                      (summaryData.totalGastos / summaryData.orcamentoTotal) *
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                </Flex>
                <Progress
                  value={
                    (summaryData.totalGastos / summaryData.orcamentoTotal) * 100
                  }
                  size="lg"
                  colorScheme={
                    summaryData.totalGastos > summaryData.orcamentoTotal
                      ? "red"
                      : "green"
                  }
                  borderRadius="md"
                />
              </Box>
            )}
            {Object.entries(summaryData.orcamentosPorCategoria)
              .filter(([_, budget]) => budget > 0)
              .map(([categoria, orcamento]) => {
                const gastoCategoria =
                  summaryData.gastosPorCategoria[categoria] || 0;
                const percentagem = (gastoCategoria / orcamento) * 100;
                // 4. Usa a cor resolvida específica
                const specificColor = resolvedBudgetColorMap[categoria];
                return (
                  <Box key={categoria}>
                    <Flex justify="space-between" mb={1}>
                      <Text>{categoria}</Text>
                      <Text fontSize="sm">
                        R$ {gastoCategoria.toFixed(2)} de R${" "}
                        {orcamento.toFixed(2)}
                      </Text>
                    </Flex>
                    {/* 5. Remove 'colorScheme' e usa a propriedade 'sx' para um estilo exato */}
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
                    />
                  </Box>
                );
              })}
          </VStack>
        </Box>
      )}

      {/* ... (Resto do componente: Gráfico e Lista de Pendentes sem alterações) ... */}
    </Box>
  );
}

// Para garantir que nada falha, cole o código 100% completo aqui
// --- INÍCIO DO CÓDIGO COMPLETO ---

function FullSummaryDashboard({ usuario, categoryColorMap }) {
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
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (!usuario) return;
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
    const fetchBudgetData = async () => {
      const budgetDocId = `${usuario.uid}_${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const budgetDocRef = doc(db, "orcamentos", budgetDocId);
      const docSnap = await getDoc(budgetDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { valorTotal: 0, orcamentosPorCategoria: {} };
    };
    const ganhosQuery = query(
      collection(db, "ganhos"),
      where("userId", "==", usuario.uid),
      where("data", ">=", startTimestamp),
      where("data", "<=", endTimestamp)
    );
    const unsubscribeGanhos = onSnapshot(ganhosQuery, (ganhosSnap) => {
      const totalGanhos = ganhosSnap.docs.reduce(
        (acc, doc) => acc + doc.data().valor,
        0
      );
      setSummaryData((prevData) => ({ ...prevData, totalGanhos }));
    });
    const gastosQuery = query(
      collection(db, "gastos"),
      where("userId", "==", usuario.uid),
      where("data", ">=", startTimestamp),
      where("data", "<=", endTimestamp)
    );
    const unsubscribeGastos = onSnapshot(gastosQuery, async (gastosSnap) => {
      const budgetData = await fetchBudgetData();
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
      setSummaryData((prevData) => ({
        ...prevData,
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
      }));
      setLoading(false);
    });
    return () => {
      unsubscribeGanhos();
      unsubscribeGastos();
    };
  }, [usuario, currentDate]);

  const handleMarkAsPaid = async (gastoId) => {
    await updateDoc(doc(db, "gastos", gastoId), { pago: true });
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

  const chartCategoryLabels = Object.keys(summaryData.gastosPorCategoria);
  const chartBackgroundColorsKeys = chartCategoryLabels.map(
    (cat) => categoryColorMap[cat] || "gray.300"
  );
  const chartBorderColorsKeys = chartCategoryLabels.map((cat) => {
    const color = categoryColorMap[cat] || "gray.500";
    const baseColor = color.split(".")[0];
    return `${baseColor}.500`;
  });
  const resolvedChartBackgroundColors = useToken(
    "colors",
    chartBackgroundColorsKeys
  );
  const resolvedChartBorderColors = useToken("colors", chartBorderColorsKeys);

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
    labels: chartCategoryLabels,
    datasets: [
      {
        label: "Gastos por Categoria",
        data: Object.values(summaryData.gastosPorCategoria),
        backgroundColor: resolvedChartBackgroundColors,
        borderColor: resolvedChartBorderColors,
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <Box>{/* ... skeleton ... */}</Box>;
  }

  const hasCategoryBudgets = Object.values(
    summaryData.orcamentosPorCategoria
  ).some((budget) => budget > 0);
  const saldoFinal = summaryData.totalGanhos - summaryData.totalGastos;

  return (
    <Box>
      <Flex justify="center" align="center" mb={6}>
        <IconButton icon={<ArrowLeftIcon />} onClick={goToPreviousMonth} />
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
        <IconButton icon={<ArrowRightIcon />} onClick={goToNextMonth} />
      </Flex>
      <Stat
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        textAlign="center"
        mb={8}
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
      <SimpleGrid
        columns={{ base: 1, sm: 3 }}
        spacing={{ base: 3, md: 6 }}
        mb={8}
      >
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Ganhos</StatLabel>
          <StatNumber color="green.500">
            R$ {summaryData.totalGanhos.toFixed(2)}
          </StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Gastos (Total)</StatLabel>
          <StatNumber>R$ {summaryData.totalGastos.toFixed(2)}</StatNumber>
          {summaryData.orcamentoTotal > 0 && (
            <Text fontSize="sm" color="gray.500">
              de R$ {summaryData.orcamentoTotal.toFixed(2)}
            </Text>
          )}
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Pendente</StatLabel>
          <StatNumber color="orange.500">
            R$ {summaryData.totalPendente.toFixed(2)}
          </StatNumber>
        </Stat>
      </SimpleGrid>
      <Heading as="h4" size="md" mb={4} mt={8}>
        Detalhes dos Gastos
      </Heading>
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={{ base: 3, md: 6 }}
        mb={8}
      >
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Total Dividido</StatLabel>
          <StatNumber>R$ {summaryData.totalDividido.toFixed(2)}</StatNumber>
          <StatHelpText>
            R$ {(summaryData.totalDividido / 2).toFixed(2)} para cada
          </StatHelpText>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Gastos no Cartão</StatLabel>
          <StatNumber color="purple.500">
            R$ {summaryData.totalCartao.toFixed(2)}
          </StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Gastos à Vista</StatLabel>
          <StatNumber color="teal.500">
            R$ {summaryData.totalAVista.toFixed(2)}
          </StatNumber>
        </Stat>
      </SimpleGrid>
      {(summaryData.orcamentoTotal > 0 || hasCategoryBudgets) && (
        <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h4" size="md" mb={4}>
            Progresso do Orçamento
          </Heading>
          <VStack spacing={4} align="stretch">
            {summaryData.orcamentoTotal > 0 && (
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="bold">Orçamento Total</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {(
                      (summaryData.totalGastos / summaryData.orcamentoTotal) *
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                </Flex>
                <Progress
                  value={
                    (summaryData.totalGastos / summaryData.orcamentoTotal) * 100
                  }
                  size="lg"
                  colorScheme={
                    summaryData.totalGastos > summaryData.orcamentoTotal
                      ? "red"
                      : "green"
                  }
                  borderRadius="md"
                />
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
                    <Flex justify="space-between" mb={1}>
                      <Text>{categoria}</Text>
                      <Text fontSize="sm">
                        R$ {gastoCategoria.toFixed(2)} de R${" "}
                        {orcamento.toFixed(2)}
                      </Text>
                    </Flex>
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
                    />
                  </Box>
                );
              })}
          </VStack>
        </Box>
      )}
      <Flex direction={{ base: "column", lg: "row" }} gap={8}>
        <Box flex="1">
          <Heading as="h4" size="md" mb={4}>
            Distribuição de Gastos
          </Heading>
          <Box maxW="400px" mx="auto">
            {Object.keys(summaryData.gastosPorCategoria).length > 0 ? (
              <Doughnut data={chartData} />
            ) : (
              <Text>Nenhum gasto registado para este mês.</Text>
            )}
          </Box>
        </Box>
        <Divider orientation={{ base: "horizontal", lg: "vertical" }} />
        <Box flex="1" maxH="400px" overflowY="auto">
          <Heading as="h4" size="md" mb={4}>
            Gastos Pendentes do Mês
          </Heading>
          {summaryData.gastosPendentes.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {" "}
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
                    <Text fontWeight="bold">R$ {gasto.valor.toFixed(2)}</Text>
                    <Tooltip label="Marcar como pago" placement="top">
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
              ))}{" "}
            </VStack>
          ) : (
            <Text>Nenhum gasto pendente para este mês. Ótimo trabalho!</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
export default FullSummaryDashboard;
// Lembre-se de renomear a função para SummaryDashboard
