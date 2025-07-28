import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
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
  RadioGroup,
  Radio,
  useToast,
} from "@chakra-ui/react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
registerLocale("pt-BR", ptBR);

// A prop 'selectedDate' vem do Dashboard (ex: 1 de Agosto de 2025)
function ExpenseForm({ usuario, onSuccess, selectedDate }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [dividido, setDividido] = useState(false);
  const [pago, setPago] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState("À Vista");
  const [data, setData] = useState(new Date()); // 1. Novo estado para a data do formulário
  const toast = useToast();

  // 2. useEffect para definir a data padrão quando o modal abre
  useEffect(() => {
    if (selectedDate) {
      setData(selectedDate);
    }
  }, [selectedDate]);

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
        metodoPagamento: metodoPagamento,
        data: data, // 3. Usa a data do estado, em vez de serverTimestamp()
        userId: usuario.uid,
      });
      toast({
        title: "Gasto adicionado!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setDescricao("");
      setValor("");
      setCategoria("");
      setDividido(false);
      setPago(false);
      setMetodoPagamento("À Vista");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao adicionar gasto: ", error);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="full">
      {/* 4. Novo campo de Data no topo do formulário */}
      <FormControl isRequired>
        <FormLabel>Data do Gasto</FormLabel>
        <DatePicker
          selected={data}
          onChange={(date) => setData(date)}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          customInput={<Input />}
        />
      </FormControl>
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
      <FormControl>
        <FormLabel>Método de Pagamento</FormLabel>
        <RadioGroup onChange={setMetodoPagamento} value={metodoPagamento}>
          <HStack spacing={4}>
            <Radio value="À Vista">À Vista (Pix, Débito, Dinheiro)</Radio>
            <Radio value="Cartão de Crédito">Cartão de Crédito</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
      <HStack w="full" justify="space-between" pt={2}>
        <FormControl as={HStack}>
          <FormLabel htmlFor="dividir-gasto" mb="0">
            Dividir por 2?
          </FormLabel>
          <Switch
            id="dividir-gasto"
            isChecked={dividido}
            onChange={(e) => setDividido(e.target.checked)}
          />
        </FormControl>
        <FormControl as={HStack} justifyContent="flex-end">
          <FormLabel htmlFor="pago-checkbox" mb="0">
            Pago?
          </FormLabel>
          <Checkbox
            id="pago-checkbox"
            isChecked={pago}
            onChange={(e) => setPago(e.target.checked)}
          />
        </FormControl>
      </HStack>
      <Button type="submit" colorScheme="blue" width="full" mt={4}>
        Adicionar Gasto
      </Button>
    </VStack>
  );
}

export default ExpenseForm;
