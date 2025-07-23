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
  Spinner,
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
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
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

function ExpenseList({ usuario, currentDate }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryColorMap, setCategoryColorMap] = useState({});
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
    if (!usuario || !currentDate) return;
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
      where("userId", "==", usuario.uid),
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

        gastosData.sort((a, b) => {
          const pagoA = !!a.pago;
          const pagoB = !!b.pago;
          if (pagoA !== pagoB) {
            return pagoA - pagoB;
          }
          return 0;
        });

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

  useEffect(() => {
    if (usuario) {
      const q = query(
        collection(db, "categorias"),
        where("userId", "==", usuario.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const colorMap = {};
        querySnapshot.forEach((doc) => {
          const category = doc.data();
          colorMap[category.nome] = category.cor;
        });
        setCategoryColorMap(colorMap);
      });
      return () => unsubscribe();
    }
  }, [usuario]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "gastos", idParaExcluir));
      onDeleteClose();
    } catch (error) {
      console.error("Erro ao excluir gasto: ", error);
    }
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
    const gastoDocRef = doc(db, "gastos", gastoId);
    try {
      await updateDoc(gastoDocRef, {
        pago: !pagoAtual,
      });
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento: ", error);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      {/* O Título agora é gerido pelo Dashboard */}
      {gastos.length === 0 ? (
        <Text textAlign="center" mt={4}>
          Nenhum gasto registado para este mês.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {gastos.map((gasto) => (
            <Flex
              key={gasto.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              opacity={gasto.pago ? 0.6 : 1}
              direction={{ base: "column", md: "row" }}
            >
              <Box flex="1" mb={{ base: 3, md: 0 }} mr={{ md: 4 }}>
                <Text
                  fontWeight="bold"
                  noOfLines={1}
                  textDecoration={gasto.pago ? "line-through" : "none"}
                >
                  {gasto.descricao}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(gasto.data)}
                </Text>
              </Box>

              <HStack
                w={{ base: "full", md: "auto" }}
                justifyContent="space-between"
              >
                <VStack align="flex-start" spacing={1}>
                  <Text fontWeight="bold">R$ {gasto.valor.toFixed(2)}</Text>
                  {gasto.dividido && (
                    <Text fontSize="xs" color="gray.600">
                      (R$ {(gasto.valor / 2).toFixed(2)} p/ pessoa)
                    </Text>
                  )}
                  <HStack>
                    <Tag
                      colorScheme={categoryColorMap[gasto.categoria] || "gray"}
                      size="sm"
                    >
                      {gasto.categoria}
                    </Tag>
                    <Tag
                      size="sm"
                      variant="solid"
                      colorScheme={gasto.pago ? "green" : "yellow"}
                      onClick={() => handleTogglePago(gasto.id, gasto.pago)}
                      cursor="pointer"
                    >
                      {gasto.pago ? "Pago" : "Pendente"}
                    </Tag>
                  </HStack>
                </VStack>
                <VStack>
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
                </VStack>
              </HStack>
            </Flex>
          ))}
        </VStack>
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
