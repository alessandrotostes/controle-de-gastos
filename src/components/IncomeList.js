import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
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
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  IconButton,
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Skeleton,
  SkeletonText,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function IncomeList({ usuario, currentDate }) {
  const [ganhos, setGanhos] = useState([]);
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
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [valorEdit, setValorEdit] = useState("");
  const [dataEdit, setDataEdit] = useState(new Date());
  const cancelRef = useRef();
  const toast = useToast();

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
      collection(db, "ganhos"),
      where("familiaId", "==", usuario.familiaId),
      where("data", ">=", startTimestamp),
      where("data", "<=", endTimestamp),
      orderBy("data", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setGanhos(items);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar ganhos: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [usuario, currentDate]);

  const handleEditClick = (item) => {
    setItemSelecionado(item);
    setDescricaoEdit(item.descricao);
    setValorEdit(item.valor);
    if (item.data && item.data.seconds) {
      setDataEdit(new Date(item.data.seconds * 1000));
    }
    onEditOpen();
  };

  const handleDeleteClick = (item) => {
    setItemSelecionado(item);
    onDeleteOpen();
  };
  const handleUpdate = async () => {
    if (!itemSelecionado) return;
    const itemDocRef = doc(db, "ganhos", itemSelecionado.id);
    await updateDoc(itemDocRef, {
      descricao: descricaoEdit,
      valor: Number(valorEdit),
      data: dataEdit,
    });
    onEditClose();
    toast({
      title: "Ganho atualizado!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  const handleDelete = async () => {
    if (!itemSelecionado) return;
    await deleteDoc(doc(db, "ganhos", itemSelecionado.id));
    onDeleteClose();
    toast({
      title: "Ganho excluído!",
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(3)].map((_, i) => (
          <Flex
            key={i}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            justify="space-between"
            align="center"
          >
            <Box flex="1" mr={4}>
              <SkeletonText
                noOfLines={1}
                spacing="3"
                skeletonHeight="4"
                w="70%"
              />
              <SkeletonText
                noOfLines={1}
                spacing="2"
                skeletonHeight="2"
                w="40%"
                mt={2}
              />
            </Box>
            <Skeleton height="30px" width="100px" />
          </Flex>
        ))}
      </VStack>
    );
  }

  return (
    <Box>
      {ganhos.length === 0 ? (
        <Text textAlign="center" mt={4}>
          Nenhum ganho registado para este mês.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {ganhos.map((item) => (
            <Flex
              key={item.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              direction={{ base: "column", md: "row" }}
            >
              <Box flex="1" mb={{ base: 3, md: 0 }} mr={{ md: 4 }}>
                <Text fontWeight="bold" noOfLines={1}>
                  {item.descricao}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(item.data)}
                </Text>
              </Box>
              <HStack
                w={{ base: "full", md: "auto" }}
                justifyContent="space-between"
              >
                <Text fontWeight="bold" color="green.500">
                  R$ {item.valor.toFixed(2)}
                </Text>
                <HStack>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Editar"
                    onClick={() => handleEditClick(item)}
                    variant="ghost"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Excluir"
                    colorScheme="red"
                    onClick={() => handleDeleteClick(item)}
                    variant="ghost"
                  />
                </HStack>
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Editar Ganho</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Data do Ganho</FormLabel>
                <DatePicker
                  selected={dataEdit}
                  onChange={(date) => setDataEdit(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  customInput={<Input />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Input
                  value={descricaoEdit}
                  onChange={(e) => setDescricaoEdit(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Valor</FormLabel>
                <InputGroup>
                  <InputLeftAddon>R$</InputLeftAddon>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={valorEdit}
                    onChange={(e) =>
                      setValorEdit(e.target.value.replace(",", "."))
                    }
                  />
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEditClose} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Excluir Ganho</AlertDialogHeader>
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
export default IncomeList;
