import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

function IncomeForm({ usuario, onSuccess, selectedDate }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "") return;
    try {
      await addDoc(collection(db, "ganhos"), {
        descricao,
        valor: Number(valor),
        data: selectedDate,
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
        <FormLabel>Valor</FormLabel>
        <InputGroup>
          <InputLeftAddon>R$</InputLeftAddon>
          <Input
            type="text"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(",", "."))}
            placeholder="5000,00"
          />
        </InputGroup>
      </FormControl>
      <Button type="submit" colorScheme="green" width="full" mt={4}>
        Adicionar Ganho
      </Button>
    </VStack>
  );
}

export default IncomeForm;
