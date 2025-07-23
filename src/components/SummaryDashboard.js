// src/components/SummaryDashboard.js
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
} from "firebase/firestore";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Flex,
  IconButton,
  Text,
  useToken,
  VStack,
  Divider,
  HStack,
  Button,
  Progress,
} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);
ChartJS.register(ArcElement, Tooltip, Legend);

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
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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
        totalPago = 0;
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

        gastosPorCategoria[gasto.categoria] =
          (gastosPorCategoria[gasto.categoria] || 0) + gasto.valor;
      });

      setSummaryData((prevData) => ({
        ...prevData,
        totalGastos,
        totalPago,
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
    (cat) => `${categoryColorMap[cat] || "gray"}.300`
  );
  const borderColorsKeys = categoryLabels.map(
    (cat) => `${categoryColorMap[cat] || "gray"}.500`
  );
  const resolvedBackgroundColors = useToken("colors", backgroundColorsKeys);
  const resolvedBorderColors = useToken("colors", borderColorsKeys);
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

  if (loading) return <Spinner />;

  const hasCategoryBudgets = Object.values(
    summaryData.orcamentosPorCategoria
  ).some((budget) => budget > 0);

  return (
    <Box>
      <Flex justify="center" align="center" mb={6}>
        <IconButton
          icon={<ArrowLeftIcon />}
          onClick={goToPreviousMonth}
          aria-label="Mês anterior"
        />
        <Box mx={2}>
          <DatePicker
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="pt-BR"
            customInput={
              <Button
                as={Heading}
                size="lg"
                variant="ghost"
                w="250px"
                textAlign="center"
              >
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

      <SimpleGrid
        columns={{ base: 2, md: 4 }}
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
          <StatLabel>Total Pago</StatLabel>
          <StatNumber color="blue.500">
            R$ {summaryData.totalPago.toFixed(2)}
          </StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Pendente</StatLabel>
          <StatNumber color="orange.500">
            R$ {summaryData.totalPendente.toFixed(2)}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      {/* CONDIÇÃO DE EXIBIÇÃO ATUALIZADA */}
      {(summaryData.orcamentoTotal > 0 || hasCategoryBudgets) && (
        <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h4" size="md" mb={4}>
            Previsionamento Mensal
          </Heading>
          <VStack spacing={4} align="stretch">
            {/* O progresso total só aparece se houver um orçamento total */}
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
                      colorScheme={
                        percentagem > 100
                          ? "red"
                          : categoryColorMap[categoria] || "gray"
                      }
                      borderRadius="md"
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
              {summaryData.gastosPendentes.map((gasto) => (
                <HStack
                  key={gasto.id}
                  justify="space-between"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.50" }}
                >
                  <Box>
                    <Text fontWeight="medium">{gasto.descricao}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(gasto.data)}
                    </Text>
                  </Box>
                  <Text fontWeight="bold">R$ {gasto.valor.toFixed(2)}</Text>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text>Nenhum gasto pendente para este mês. Ótimo trabalho!</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default SummaryDashboard;
