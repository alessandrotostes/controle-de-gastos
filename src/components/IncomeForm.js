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

function IncomeForm({ usuario, onSuccess }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "") return;

    try {
      await addDoc(collection(db, "ganhos"), {
        descricao,
        valor: Number(valor),
        data: serverTimestamp(),
        userId: usuario.uid,
      });
      setDescricao("");
      setValor("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao adicionar ganho: ", error);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="full">
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
          <NumberInputField placeholder="Ex: 5000.00" />
        </NumberInput>
      </FormControl>
      <Button type="submit" colorScheme="green" width="full" mt={4}>
        Adicionar Ganho
      </Button>
    </VStack>
  );
}

export default IncomeForm;
