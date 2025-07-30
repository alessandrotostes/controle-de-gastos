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
  useToast,
} from "@chakra-ui/react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
registerLocale("pt-BR", ptBR);

function IncomeForm({ usuario, onSuccess }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date());
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "") return;
    try {
      await addDoc(collection(db, "ganhos"), {
        descricao,
        valor: Number(valor),
        data,
        familiaId: usuario.familiaId,
        criadoPor: usuario.uid,
      });
      toast({
        title: "Ganho adicionado!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
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
        <FormLabel>Data do Ganho</FormLabel>
        <DatePicker
          selected={data}
          onChange={(date) => setData(date)}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          customInput={<Input />}
        />
      </FormControl>
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
