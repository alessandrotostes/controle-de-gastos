// src/components/AddIncomeModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import IncomeForm from "./IncomeForm";

function AddIncomeModal({ isOpen, onClose, usuario }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Adicionar Novo Ganho</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <IncomeForm usuario={usuario} onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AddIncomeModal;
