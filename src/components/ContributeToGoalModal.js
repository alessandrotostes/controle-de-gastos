// src/components/ContributeToGoalModal.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
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
  InputGroup,
  InputLeftAddon,
  Input,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";

function ContributeToGoalModal({ isOpen, onClose, goal, monthlyBalance }) {
  const [amount, setAmount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    // Quando o modal abre, preenche o campo com o saldo do mês, se for positivo
    if (isOpen && monthlyBalance > 0) {
      setAmount(monthlyBalance.toFixed(2));
    } else if (isOpen) {
      setAmount(0);
    }
  }, [isOpen, monthlyBalance]);

  const handleContribute = async () => {
    if (!goal || !amount || Number(amount) <= 0) {
      toast({
        title: "Por favor, insira um valor válido.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const goalRef = doc(db, "metas", goal.id);
    const newCurrentValue = goal.valorAtual + Number(amount);

    try {
      await updateDoc(goalRef, { valorAtual: newCurrentValue });
      toast({
        title: `R$ ${Number(amount).toFixed(2)} adicionados à meta!`,
        description: `"${goal.nome}" agora tem R$ ${newCurrentValue.toFixed(
          2
        )}.`,
        status: "success",
        duration: 5000,
      });
      onClose(); // Fecha o modal após o sucesso
    } catch (error) {
      console.error("Erro ao contribuir para a meta:", error);
      toast({
        title: "Erro ao atualizar a meta.",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Adicionar à Poupança</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>
              Quanto do seu saldo de{" "}
              <Text as="span" fontWeight="bold">
                R$ {monthlyBalance.toFixed(2)}
              </Text>{" "}
              você quer adicionar à meta{" "}
              <Text as="span" fontWeight="bold">
                "{goal?.nome}"
              </Text>
              ?
            </Text>
            <FormControl isRequired>
              <FormLabel>Valor a Adicionar</FormLabel>
              <InputGroup>
                <InputLeftAddon>R$</InputLeftAddon>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                />
              </InputGroup>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Cancelar
          </Button>
          <Button colorScheme="green" onClick={handleContribute}>
            Confirmar Contribuição
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ContributeToGoalModal;
