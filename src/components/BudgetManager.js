// src/components/BudgetManager.js
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  SimpleGrid,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
registerLocale("pt-BR", ptBR);

function BudgetManager({ usuario }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalBudget, setTotalBudget] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const budgetDocId = `${usuario.uid}_${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    const budgetDocRef = doc(db, "orcamentos", budgetDocId);
    const docSnap = await getDoc(budgetDocRef);
    if (docSnap.exists()) {
      const budgetData = docSnap.data();
      setTotalBudget(budgetData.valorTotal || "");
      setCategoryBudgets(budgetData.orcamentosPorCategoria || {});
    } else {
      setTotalBudget("");
      setCategoryBudgets({});
    }
    setLoading(false);
  }, [budgetDocId]);

  useEffect(() => {
    const q = query(
      collection(db, "categorias"),
      where("userId", "==", usuario.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserCategories(cats);
    });
    return unsubscribe;
  }, [usuario.uid]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSaveBudget = async () => {
    let finalTotalBudget = Number(totalBudget) || 0;

    // Lógica para somar as categorias se o total for 0
    if (finalTotalBudget === 0 && Object.keys(categoryBudgets).length > 0) {
      finalTotalBudget = Object.values(categoryBudgets).reduce(
        (sum, value) => sum + Number(value),
        0
      );
    }

    const cleanCategoryBudgets = Object.fromEntries(
      Object.entries(categoryBudgets).map(([key, value]) => [
        key,
        Number(value) || 0,
      ])
    );
    const budgetDocRef = doc(db, "orcamentos", budgetDocId);
    const budgetData = {
      userId: usuario.uid,
      mesAno: `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}`,
      valorTotal: finalTotalBudget,
      orcamentosPorCategoria: cleanCategoryBudgets,
    };
    await setDoc(budgetDocRef, budgetData, { merge: true });
    toast({
      title: "Orçamento salvo!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    fetchBudget(); // Recarrega os dados para mostrar o total calculado
  };

  const handleCategoryBudgetChange = (categoryName, value) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [categoryName]: value.replace(",", "."),
    }));
  };

  return (
    <Box mb={12}>
      <Heading as="h2" size="lg" mb={6}>
        Definir Orçamento Mensal
      </Heading>
      <FormControl mb={4}>
        <FormLabel>Selecione o Mês</FormLabel>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          locale="pt-BR"
          customInput={<Input />}
        />
      </FormControl>
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel>
            Orçamento Total do Mês (Opcional se preencher por categoria)
          </FormLabel>
          <InputGroup>
            <InputLeftAddon>R$</InputLeftAddon>
            <Input
              type="text"
              inputMode="decimal"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value.replace(",", "."))}
              placeholder="3000,00"
            />
          </InputGroup>
        </FormControl>
        <Box>
          <Text fontWeight="bold" mb={2}>
            Orçamento por Categoria
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {userCategories.map((cat) => (
              <FormControl key={cat.id}>
                <FormLabel>{cat.nome}</FormLabel>
                <InputGroup>
                  <InputLeftAddon>R$</InputLeftAddon>
                  <Input
                    type="text"
                    inputMode="decimal"
                    w="100%"
                    value={categoryBudgets[cat.nome] || ""}
                    onChange={(e) =>
                      handleCategoryBudgetChange(cat.nome, e.target.value)
                    }
                    borderTopLeftRadius={0}
                    borderBottomLeftRadius={0}
                  />
                </InputGroup>
              </FormControl>
            ))}
          </SimpleGrid>
        </Box>
        <Button
          colorScheme="green"
          onClick={handleSaveBudget}
          isLoading={loading}
        >
          Salvar Orçamento
        </Button>
      </VStack>
    </Box>
  );
}

export default BudgetManager;
