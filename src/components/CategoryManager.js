// src/components/CategoryManager.js
import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

const availableColors = [
  { nome: "Laranja", valor: "orange.500" },
  { nome: "Amarelo", valor: "yellow.500" },
  { nome: "Verde", valor: "green.500" },
  { nome: "Verde-azulado", valor: "teal.500" },
  { nome: "Azul", valor: "blue.500" },
  { nome: "Ciano", valor: "cyan.500" },
  { nome: "Roxo", valor: "purple.500" },
  { nome: "Rosa", valor: "pink.500" },
  { nome: "Cinza", valor: "gray.500" },
  // --- Novas cores adicionadas ---
  { nome: "Verde Claro", valor: "green.300" },
  { nome: "Azul Escuro", valor: "blue.800" },
  { nome: "Amarelo Queimado", valor: "yellow.800" },
  { nome: "Roxo Escuro", valor: "purple.900" },
  { nome: "Rosa Claro", valor: "pink.300" },
];

function CategoryManager({ usuario }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("gray.500");

  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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

  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "categorias"),
      where("userId", "==", usuario.uid),
      orderBy("nome")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(cats);
    });
    return () => unsubscribe();
  }, [usuario.uid]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategoryName.trim() === "") return;
    await addDoc(collection(db, "categorias"), {
      nome: newCategoryName,
      cor: newCategoryColor,
      userId: usuario.uid,
    });
    setNewCategoryName("");
    toast({
      title: "Categoria adicionada!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    onEditOpen();
  };
  const handleUpdateCategory = async () => {
    if (!currentCategory) return;
    const categoryDocRef = doc(db, "categorias", currentCategory.id);
    await updateDoc(categoryDocRef, {
      nome: currentCategory.nome,
      cor: currentCategory.cor,
    });
    onEditClose();
    toast({
      title: "Categoria atualizada!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    onDeleteOpen();
  };
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    await deleteDoc(doc(db, "categorias", categoryToDelete.id));
    onDeleteClose();
    toast({
      title: "Categoria excluída!",
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Gerir Categorias
      </Heading>
      <VStack
        as="form"
        onSubmit={handleAddCategory}
        spacing={4}
        align="stretch"
        mb={8}
      >
        <FormControl>
          <FormLabel>Nome da Nova Categoria</FormLabel>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Cor</FormLabel>
          <Select
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
          >
            {availableColors.map((color) => (
              <option key={color.valor} value={color.valor}>
                {color.nome}
              </option>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Adicionar Categoria
        </Button>
      </VStack>
      <VStack spacing={4} align="stretch">
        {categories.map((cat) => (
          <HStack
            key={cat.id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            justifyContent="space-between"
          >
            <HStack>
              {/* 2. CÓDIGO CORRIGIDO: Usa o valor da cor diretamente, sem adicionar '.500' */}
              <Box as="span" boxSize="12px" bg={cat.cor} borderRadius="full" />
              <Text fontWeight="bold">{cat.nome}</Text>
            </HStack>
            <HStack>
              <IconButton
                icon={<EditIcon />}
                aria-label="Editar"
                onClick={() => handleEditClick(cat)}
              />
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Excluir"
                colorScheme="red"
                onClick={() => handleDeleteClick(cat)}
              />
            </HStack>
          </HStack>
        ))}
      </VStack>
      {currentCategory && (
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Categoria</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={currentCategory.nome}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      nome: e.target.value,
                    })
                  }
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Cor</FormLabel>
                <Select
                  value={currentCategory.cor}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      cor: e.target.value,
                    })
                  }
                >
                  {availableColors.map((color) => (
                    <option key={color.valor} value={color.valor}>
                      {color.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onEditClose} mr={3}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleUpdateCategory}>
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      {categoryToDelete && (
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Excluir Categoria</AlertDialogHeader>
              <AlertDialogBody>
                Tem a certeza que quer excluir a categoria **"
                {categoryToDelete.nome}"**? Isto não pode ser desfeito.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDeleteCategory} ml={3}>
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
export default CategoryManager;
