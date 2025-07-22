// src/components/IncomeForm.js
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";

function IncomeForm({ usuario }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "") return;

    try {
      // Adiciona um novo documento à coleção 'ganhos'
      await addDoc(collection(db, "ganhos"), {
        descricao,
        valor: Number(valor),
        data: serverTimestamp(),
        userId: usuario.uid,
      });
      setDescricao("");
      setValor("");
    } catch (error) {
      console.error("Erro ao adicionar ganho: ", error);
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
          <FormLabel>Descrição do Ganho</FormLabel>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Salário"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Valor (R$)</FormLabel>
          <NumberInput value={valor} onChange={(v) => setValor(v)}>
            <NumberInputField placeholder="Ex: 500.00" />
          </NumberInput>
        </FormControl>
        <Button type="submit" colorScheme="green" width="full">
          Adicionar Ganho
        </Button>
      </VStack>
    </Box>
  );
}

export default IncomeForm;
