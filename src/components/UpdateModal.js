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
// Ultima versão lançada: 1.1.3
export const APP_VERSION = "1.1.3";

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
              Removemos a cor Vermelha da aba de categorias, altere para alguma
              das outras cores disponíveis para melhor visualização no Orçamento
              e Gráfico.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Agora quando um gasto de categoria ultrapassa o valor estimado, o
              aplicativo mostra a cor "vermelha", como forma de mostrar gasto
              excedente.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Agora pode marcar gastos como "Pago" diretamente no Dashboard, sem
              necessidade de abrir a página "Gastos" para fazer isso.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              Correções de bugs e melhorias de desempenho.
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
