// src/components/SummaryDashboard.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Spinner,
  Flex,
  IconButton,
  Text,
  useToken,
} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function SummaryDashboard({ usuario, categoryColorMap }) {
  const [summaryData, setSummaryData] = useState({
    totalGanhos: 0,
    totalGastos: 0,
    saldo: 0,
    gastosPorCategoria: {},
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchMonthlyData = async () => {
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

      // Buscar Ganhos do mês
      const ganhosQuery = query(
        collection(db, "ganhos"),
        where("userId", "==", usuario.uid),
        where("data", ">=", startTimestamp),
        where("data", "<=", endTimestamp)
      );
      const ganhosSnap = await getDocs(ganhosQuery);
      const totalGanhos = ganhosSnap.docs.reduce(
        (acc, doc) => acc + doc.data().valor,
        0
      );

      // Buscar Gastos do mês
      const gastosQuery = query(
        collection(db, "gastos"),
        where("userId", "==", usuario.uid),
        where("data", ">=", startTimestamp),
        where("data", "<=", endTimestamp)
      );
      const gastosSnap = await getDocs(gastosQuery);

      let totalGastos = 0;
      const gastosPorCategoria = {};

      gastosSnap.forEach((doc) => {
        const gasto = doc.data();
        totalGastos += gasto.valor;
        if (gastosPorCategoria[gasto.categoria]) {
          gastosPorCategoria[gasto.categoria] += gasto.valor;
        } else {
          gastosPorCategoria[gasto.categoria] = gasto.valor;
        }
      });

      setSummaryData({
        totalGanhos,
        totalGastos,
        saldo: totalGanhos - totalGastos,
        gastosPorCategoria,
      });
      setLoading(false);
    };

    if (usuario) {
      fetchMonthlyData();
    }
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

  return (
    <Box>
      <Flex justify="center" align="center" mb={6}>
        <IconButton
          icon={<ArrowLeftIcon />}
          onClick={goToPreviousMonth}
          aria-label="Mês anterior"
        />
        <Heading as="h3" size="lg" mx={6} w="250px" textAlign="center">
          {currentDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </Heading>
        <IconButton
          icon={<ArrowRightIcon />}
          onClick={goToNextMonth}
          aria-label="Próximo mês"
        />
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Total de Ganhos</StatLabel>
          <StatNumber color="green.500">
            R$ {summaryData.totalGanhos.toFixed(2)}
          </StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Total de Gastos</StatLabel>
          <StatNumber color="red.500">
            R$ {summaryData.totalGastos.toFixed(2)}
          </StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" borderRadius="lg">
          <StatLabel>Saldo do Mês</StatLabel>
          <StatNumber color={summaryData.saldo >= 0 ? "blue.500" : "red.500"}>
            R$ {summaryData.saldo.toFixed(2)}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={summaryData.saldo >= 0 ? "increase" : "decrease"}
            />
            {summaryData.totalGanhos > 0
              ? ((summaryData.saldo / summaryData.totalGanhos) * 100).toFixed(2)
              : 0}
            %
          </StatHelpText>
        </Stat>
      </SimpleGrid>

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
  );
}

export default SummaryDashboard;
