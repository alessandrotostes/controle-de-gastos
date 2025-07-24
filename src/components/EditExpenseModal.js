import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  HStack,
  Switch,
  Checkbox,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

function EditExpenseModal({ isOpen, onClose, gasto, usuario }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dividido, setDividido] = useState(false);
  const [pago, setPago] = useState(true);
  const [userCategories, setUserCategories] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (usuario) {
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
        setUserCategories(cats);
      });
      return () => unsubscribe();
    }
  }, [usuario]);

  useEffect(() => {
    if (gasto) {
      setDescricao(gasto.descricao);
      setValor(gasto.valor);
      setCategoria(gasto.categoria);
      setDividido(gasto.dividido || false);
      setPago(gasto.pago === undefined ? true : gasto.pago);
    }
  }, [gasto]);

  const handleUpdate = async () => {
    if (!gasto) return;
    const gastoDocRef = doc(db, "gastos", gasto.id);
    try {
      await updateDoc(gastoDocRef, {
        descricao,
        valor: Number(valor),
        categoria,
        dividido,
        pago,
      });
      toast({
        title: "Gasto atualizado!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar gasto: ", error);
      toast({
        title: "Erro ao atualizar.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Editar Gasto</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Descrição</FormLabel>
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Valor</FormLabel>
              <InputGroup>
                <InputLeftAddon>R$</InputLeftAddon>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={valor}
                  onChange={(e) => setValor(e.target.value.replace(",", "."))}
                />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {userCategories.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl as={HStack} justify="space-between">
              <FormLabel htmlFor="dividir-gasto-edit" mb="0">
                Dividir gasto por 2?
              </FormLabel>
              <Switch
                id="dividir-gasto-edit"
                isChecked={dividido}
                onChange={(e) => setDividido(e.target.checked)}
              />
            </FormControl>
            <FormControl>
              <Checkbox
                isChecked={pago}
                onChange={(e) => setPago(e.target.checked)}
              >
                Gasto já foi pago?
              </Checkbox>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleUpdate}>
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditExpenseModal;
