// src/components/ExpenseForm.js
import React, { useState, useEffect } from "react";
// Adicionado 'orderBy' à importação
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  HStack,
  Switch,
} from "@chakra-ui/react";

function ExpenseForm({ usuario }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [dividido, setDividido] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "" || categoria === "") {
      alert("Por favor, preencha todos os campos, incluindo a categoria.");
      return;
    }

    try {
      await addDoc(collection(db, "gastos"), {
        descricao,
        valor: Number(valor),
        categoria,
        dividido: dividido,
        data: serverTimestamp(),
        userId: usuario.uid,
      });

      setDescricao("");
      setValor("");
      setCategoria("");
      setDividido(false);
    } catch (error) {
      console.error("Erro ao adicionar gasto: ", error);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
    >
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Descrição</FormLabel>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Almoço"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Valor (R$)</FormLabel>
          <NumberInput value={valor} onChange={(v) => setValor(v)}>
            <NumberInputField placeholder="Ex: 50.00" />
          </NumberInput>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Categoria</FormLabel>
          <Select
            placeholder="Selecione uma categoria"
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
          <FormLabel htmlFor="dividir-gasto" mb="0">
            Dividir gasto por 2?
          </FormLabel>
          <Switch
            id="dividir-gasto"
            isChecked={dividido}
            onChange={(e) => setDividido(e.target.checked)}
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">
          Adicionar Gasto
        </Button>
      </VStack>
    </Box>
  );
}

export default ExpenseForm;
