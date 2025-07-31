import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  Tag,
  InputGroup,
  InputLeftAddon,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  ChevronDownIcon,
  MinusIcon,
  RepeatIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";

function SavingsManager({ usuario }) {
  const [savings, setSavings] = useState([]);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
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
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    if (!usuario || !usuario.familiaId) return;
    const q = query(
      collection(db, "metas"),
      where("familiaId", "==", usuario.familiaId),
      orderBy("criadoEm", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavings(savingsData);
    });
    return unsubscribe;
  }, [usuario]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (newName.trim() === "") return;
    await addDoc(collection(db, "metas"), {
      nome: newName,
      valorAlvo: Number(newTarget) || 0,
      valorAtual: 0,
      familiaId: usuario.familiaId,
      status: "Pausada",
      criadoEm: serverTimestamp(),
    });
    setNewName("");
    setNewTarget("");
    toast({
      title: "Item adicionado!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    onEditOpen();
  };
  const handleUpdateItem = async () => {
    if (!currentItem) return;
    const itemRef = doc(db, "metas", currentItem.id);
    await updateDoc(itemRef, {
      nome: currentItem.nome,
      valorAlvo: Number(currentItem.valorAlvo) || 0,
    });
    onEditClose();
    toast({
      title: "Item atualizado!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    onDeleteOpen();
  };
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    await deleteDoc(doc(db, "metas", itemToDelete.id));
    onDeleteClose();
    toast({
      title: "Item excluído!",
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSetStatus = async (itemToUpdate, newStatus) => {
    const batch = writeBatch(db);
    if (newStatus === "Ativa") {
      savings.forEach((item) => {
        if (item.id !== itemToUpdate.id) {
          const itemRef = doc(db, "metas", item.id);
          batch.update(itemRef, { status: "Pausada" });
        }
      });
    }
    const targetRef = doc(db, "metas", itemToUpdate.id);
    batch.update(targetRef, { status: newStatus });
    await batch.commit();
    toast({
      title: "Status da poupança atualizado!",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleResetProgress = async (itemToReset) => {
    if (
      window.confirm(
        `Tem a certeza que quer reiniciar o progresso de "${itemToReset.nome}"? O valor atual voltará a ser zero.`
      )
    ) {
      const itemRef = doc(db, "metas", itemToReset.id);
      await updateDoc(itemRef, { valorAtual: 0, status: "Pausada" });
      toast({ title: "Progresso reiniciado!", status: "success" });
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Ativa":
        return <Tag colorScheme="green">Ativa</Tag>;
      case "Pausada":
        return <Tag colorScheme="yellow">Pausada</Tag>;
      case "Concluída":
        return <Tag colorScheme="blue">Concluída</Tag>;
      default:
        return <Tag>Indefinido</Tag>;
    }
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Gerir Poupanças e Investimentos
      </Heading>
      <VStack
        as="form"
        onSubmit={handleAddItem}
        spacing={4}
        align="stretch"
        mb={8}
        p={4}
        borderWidth="1px"
        borderRadius="lg"
      >
        <FormControl isRequired>
          <FormLabel>Nome da Poupança / Investimento</FormLabel>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Fundo de Emergência, Ações XPTO"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Valor Alvo (Opcional)</FormLabel>
          <InputGroup>
            <InputLeftAddon>R$</InputLeftAddon>
            <Input
              type="text"
              inputMode="decimal"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value.replace(",", "."))}
              placeholder="5000,00"
            />
          </InputGroup>
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Adicionar Item
        </Button>
      </VStack>

      <VStack spacing={4} align="stretch">
        {savings.map((item) => (
          <HStack
            key={item.id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            justifyContent="space-between"
          >
            <Box flex="1" mr={2}>
              <HStack>
                <Text fontWeight="bold">{item.nome}</Text>
                {getStatusTag(item.status)}
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {item.valorAlvo > 0
                  ? `Atingido: R$ ${item.valorAtual.toFixed(
                      2
                    )} de R$ ${item.valorAlvo.toFixed(2)}`
                  : `Acumulado: R$ ${item.valorAtual.toFixed(2)}`}
              </Text>
              {item.valorAlvo > 0 && (
                <Progress
                  value={(item.valorAtual / item.valorAlvo) * 100}
                  size="xs"
                  colorScheme="green"
                  borderRadius="md"
                  mt={1}
                />
              )}
            </Box>
            <HStack>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon />}
                  aria-label="Opções"
                  variant="ghost"
                />
                <MenuList>
                  {item.status !== "Ativa" && (
                    <MenuItem
                      icon={<CheckIcon />}
                      onClick={() => handleSetStatus(item, "Ativa")}
                    >
                      Ativar
                    </MenuItem>
                  )}
                  {item.status !== "Pausada" && (
                    <MenuItem
                      icon={<MinusIcon />}
                      onClick={() => handleSetStatus(item, "Pausada")}
                    >
                      Pausar
                    </MenuItem>
                  )}
                  {item.status !== "Concluída" && (
                    <MenuItem
                      icon={<CheckCircleIcon />}
                      onClick={() => handleSetStatus(item, "Concluída")}
                    >
                      Marcar como Concluída
                    </MenuItem>
                  )}
                  {item.status === "Concluída" && (
                    <MenuItem
                      icon={<RepeatIcon />}
                      onClick={() => handleResetProgress(item)}
                    >
                      Reiniciar Progresso
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
              <IconButton
                icon={<EditIcon />}
                aria-label="Editar"
                onClick={() => handleEditClick(item)}
              />
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Excluir"
                colorScheme="red"
                onClick={() => handleDeleteClick(item)}
              />
            </HStack>
          </HStack>
        ))}
      </VStack>

      {currentItem && (
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={currentItem.nome}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, nome: e.target.value })
                  }
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Valor Alvo (Opcional)</FormLabel>
                <InputGroup>
                  <InputLeftAddon>R$</InputLeftAddon>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={currentItem.valorAlvo}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        valorAlvo: e.target.value.replace(",", "."),
                      })
                    }
                  />
                </InputGroup>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onEditClose} mr={3}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleUpdateItem}>
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {itemToDelete && (
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Excluir Item</AlertDialogHeader>
              <AlertDialogBody>
                Tem a certeza que quer excluir **"{itemToDelete.nome}"**?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDeleteItem} ml={3}>
                  Excluir
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </Box>
  );
}

export default SavingsManager;
