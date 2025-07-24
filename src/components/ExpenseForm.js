import React, { useState, useEffect } from "react";
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
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Switch,
  Checkbox,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

function ExpenseForm({ usuario, onSuccess, selectedDate }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [dividido, setDividido] = useState(false);
  const [pago, setPago] = useState(true);

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
        dividido,
        pago,
        data: selectedDate,
        userId: usuario.uid,
      });
      setDescricao("");
      setValor("");
      setCategoria("");
      setDividido(false);
      setPago(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao adicionar gasto: ", error);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="full">
      <FormControl isRequired>
        <FormLabel>Descrição</FormLabel>
        <Input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Almoço"
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
            placeholder="50,00"
          />
        </InputGroup>
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
      <FormControl>
        <Checkbox isChecked={pago} onChange={(e) => setPago(e.target.checked)}>
          Gasto já foi pago?
        </Checkbox>
      </FormControl>
      <Button type="submit" colorScheme="blue" width="full" mt={4}>
        Adicionar Gasto
      </Button>
    </VStack>
  );
}

export default ExpenseForm;
