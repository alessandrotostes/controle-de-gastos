import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Text,
  VStack,
  HStack,
  Tag,
  Heading,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Flex,
  Skeleton,
  SkeletonText,
  Tooltip,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import EditExpenseModal from "./EditExpenseModal";

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function ExpenseList({
  usuario,
  currentDate,
  filtroCategoria,
  filtroTexto,
  filtroStatus,
  categoryColorMap,
}) {
  const [gastos, setGastos] = useState([]);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [gastoParaEditar, setGastoParaEditar] = useState(null);
  const [idParaExcluir, setIdParaExcluir] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!usuario || !currentDate || !usuario.familiaId) return;
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
    const q = query(
      collection(db, "gastos"),
      where("familiaId", "==", usuario.familiaId),
      where("data", ">=", startTimestamp),
      where("data", "<=", endTimestamp),
      orderBy("data", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let gastosData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setGastos(gastosData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar gastos: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [usuario, currentDate]);

  // AQUI ESTÁ A LÓGICA DE FILTRAGEM CORRIGIDA
  useEffect(() => {
    let dadosProcessados = [...gastos];

    if (filtroCategoria) {
      dadosProcessados = dadosProcessados.filter(
        (gasto) => gasto.categoria === filtroCategoria
      );
    }
    if (filtroTexto) {
      dadosProcessados = dadosProcessados.filter((gasto) =>
        gasto.descricao.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }
    if (filtroStatus === "pago") {
      dadosProcessados = dadosProcessados.filter(
        (gasto) => gasto.pago === true
      );
    } else if (filtroStatus === "pendente") {
      dadosProcessados = dadosProcessados.filter(
        (gasto) => gasto.pago !== true
      );
    }

    // A ordenação agora é feita sobre a lista JÁ FILTRADA
    dadosProcessados.sort((a, b) => {
      const pagoA = !!a.pago;
      const pagoB = !!b.pago;
      if (pagoA !== pagoB) {
        return pagoA - pagoB;
      }
      // Se o status for o mesmo, mantém a ordem de data que veio do Firestore
      const dataA = a.data.seconds;
      const dataB = b.data.seconds;
      return dataB - dataA;
    });

    setGastosFiltrados(dadosProcessados);
  }, [gastos, filtroCategoria, filtroTexto, filtroStatus]);

  const handleDelete = async () => {
    await deleteDoc(doc(db, "gastos", idParaExcluir));
    onDeleteClose();
  };
  const handleEditClick = (gasto) => {
    setGastoParaEditar(gasto);
    onEditOpen();
  };
  const handleDeleteClick = (gastoId) => {
    setIdParaExcluir(gastoId);
    onDeleteOpen();
  };
  const handleTogglePago = async (gastoId, pagoAtual) => {
    await updateDoc(doc(db, "gastos", gastoId), { pago: !pagoAtual });
  };

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton height="150px" borderRadius="lg" />
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <Box>
      {gastosFiltrados.length === 0 ? (
        <Text textAlign="center" mt={10} fontSize="lg" color="gray.500">
          {gastos.length > 0
            ? "Nenhum resultado encontrado para os filtros aplicados."
            : "Nenhum gasto registado para este mês."}
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {gastosFiltrados.map((gasto) => {
            const categoryColor = categoryColorMap[gasto.categoria] || "gray";
            const baseColorScheme = categoryColor.split(".")[0];
            return (
              <Card
                key={gasto.id}
                borderWidth="1px"
                borderRadius="lg"
                opacity={gasto.pago ? 0.6 : 1}
                size="sm"
                variant="outline"
              >
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Tooltip label={gasto.descricao} placement="top">
                      <Heading
                        size="md"
                        textDecoration={gasto.pago ? "line-through" : "none"}
                        isTruncated
                      >
                        {gasto.descricao}
                      </Heading>
                    </Tooltip>
                    <Tooltip
                      label={gasto.metodoPagamento || "À Vista"}
                      placement="top"
                    >
                      <Box
                        as="span"
                        fontSize="xl"
                        color={
                          gasto.metodoPagamento === "Cartão de Crédito"
                            ? "purple.500"
                            : "green.400"
                        }
                      >
                        {gasto.metodoPagamento === "Cartão de Crédito" ? (
                          <FaCreditCard />
                        ) : (
                          <FaMoneyBillWave />
                        )}
                      </Box>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    R$ {gasto.valor.toFixed(2)}
                  </Text>
                  {gasto.dividido && (
                    <Text fontSize="xs" color="gray.500">
                      (R$ {(gasto.valor / 2).toFixed(2)} p/ pessoa)
                    </Text>
                  )}
                  <HStack mt={3}>
                    <Tag colorScheme={baseColorScheme} size="md">
                      {gasto.categoria}
                    </Tag>
                    <Tag
                      size="md"
                      variant="solid"
                      colorScheme={gasto.pago ? "green" : "yellow"}
                      onClick={() => handleTogglePago(gasto.id, gasto.pago)}
                      cursor="pointer"
                    >
                      {gasto.pago ? "Pago" : "Pendente"}
                    </Tag>
                  </HStack>
                </CardBody>
                <CardFooter justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(gasto.data)}
                  </Text>
                  <HStack>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="yellow"
                      onClick={() => handleEditClick(gasto)}
                      aria-label="Editar gasto"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteClick(gasto.id)}
                      aria-label="Excluir gasto"
                    />
                  </HStack>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {gastoParaEditar && (
        <EditExpenseModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          gasto={gastoParaEditar}
          usuario={usuario}
        />
      )}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Gasto
            </AlertDialogHeader>
            <AlertDialogBody>
              Tem a certeza? Esta ação não pode ser desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
export default ExpenseList;
