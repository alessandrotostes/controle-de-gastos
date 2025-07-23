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

function AddExpenseModal({ isOpen, onClose, usuario, selectedDate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Adicionar Novo Gasto</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ExpenseForm
            usuario={usuario}
            onSuccess={onClose}
            selectedDate={selectedDate}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AddExpenseModal;
