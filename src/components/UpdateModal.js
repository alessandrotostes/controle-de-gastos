// src/components/UpdateModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  Text,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

// --- CONTROLO DA VERSÃO ---
// Este é o "número de série" da sua atualização.
// Quando fizer uma nova alteração no futuro e quiser que o pop-up apareça de novo,
// basta mudar este número (ex: para "1.1.1").
export const APP_VERSION = "1.1.2";

function UpdateModal({ isOpen, onClose }) {
  const handleClose = () => {
    // Ao fechar, guardamos na "memória" do navegador que o utilizador
    // já viu o pop-up desta versão específica.
    localStorage.setItem("lastVersionSeen", APP_VERSION);
    onClose(); // Esta função vem do Dashboard e fecha o modal visualmente.
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Novidades na Aplicação! 🎉</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="bold" mb={4}>
            Fizemos algumas melhorias:
          </Text>
          {/* Aqui você pode listar o que mudou na sua última atualização */}
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Agora todos os gastos são ordenados data e hora, mostrando o
              último gasto adicionado como primeiro da lista.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Agora temos a barra de "Orçamento Total" sendo a soma de todos os
              orçamentos por categoria, fazendo com que você tenha uma visão
              mais clara de todo o orçamento mensal.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Agora pode marcar gastos como "Pago" diretamente no Dashboard, sem
              necessidade de abrir a página "Gastos" para fazer isso.
            </ListItem>
          </List>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleClose}>
            Entendido!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default UpdateModal;
