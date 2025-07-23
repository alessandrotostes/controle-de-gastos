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
  NumberInput,
  NumberInputField,
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
    const budgetDocRef = doc(db, "orcamentos", budgetDocId);
    const budgetData = {
      userId: usuario.uid,
      mesAno: `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}`,
      valorTotal: Number(totalBudget) || 0,
      orcamentosPorCategoria: categoryBudgets,
    };
    await setDoc(budgetDocRef, budgetData, { merge: true });
    toast({
      title: "Orçamento salvo!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCategoryBudgetChange = (categoryName, value) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [categoryName]: Number(value) || 0,
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
          <FormLabel>Orçamento Total do Mês (R$)</FormLabel>
          <NumberInput
            value={totalBudget}
            onChange={(val) => setTotalBudget(val)}
          >
            <NumberInputField placeholder="Ex: 3000.00" />
          </NumberInput>
        </FormControl>
        <Box>
          <Text fontWeight="bold" mb={2}>
            Orçamento por Categoria (Opcional)
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {userCategories.map((cat) => (
              <FormControl key={cat.id}>
                <FormLabel>{cat.nome}</FormLabel>
                <InputGroup>
                  <InputLeftAddon>R$</InputLeftAddon>
                  <NumberInput
                    w="100%"
                    value={categoryBudgets[cat.nome] || ""}
                    onChange={(val) =>
                      handleCategoryBudgetChange(cat.nome, val)
                    }
                  >
                    <NumberInputField
                      borderTopLeftRadius={0}
                      borderBottomLeftRadius={0}
                    />
                  </NumberInput>
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
