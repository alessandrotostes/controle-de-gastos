// src/components/AddExpenseModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import ExpenseForm from "./ExpenseForm";

function AddExpenseModal({ isOpen, onClose, usuario }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Novo Gasto</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* O formulário agora vive dentro do modal e passamos a função onClose para ele */}
          <ExpenseForm usuario={usuario} onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AddExpenseModal;
