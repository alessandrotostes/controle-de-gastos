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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

// --- CONTROLO DA VERSÃO ---
// Versão 2.0.0 para refletir a grande atualização do sistema de família e outras melhorias.
export const APP_VERSION = "2.0.1";

function UpdateModal({ isOpen, onClose }) {
  const handleClose = () => {
    // Ao fechar, guardamos na "memória" do navegador que o utilizador
    // já viu o pop-up desta versão específica.
    localStorage.setItem("lastVersionSeen", APP_VERSION);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Bem-vindo à Versão 2.0! 🎉</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Ação Importante */}
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="md"
            mb={6}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Ação Necessária Importante
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Para ativar o novo modo de <strong>gestão familiar</strong>, os
              seus dados antigos foram arquivados. Por favor, vá a
              "Configurações" e{" "}
              <strong>recrie as suas categorias, orçamentos e poupanças</strong>
              . Foi necessária uma grande reestruturação do código e da base de
              dados para que a partir de agora, o aplicativo possa gerir um
              grande fluxo de dados individuais e familiares, com maior
              desempenho e escalabilidade.
            </AlertDescription>
          </Alert>

          <Text fontWeight="bold" mb={3}>
            Principais Novidades da V2.0:
          </Text>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Gestão de Família Colaborativa:</strong> Agora pode
              convidar membros para partilharem e gerirem as finanças em
              conjunto. Visite as Configurações para começar!
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Poupanças e Investimentos:</strong> Uma nova secção em
              "Configurações" para criar e acompanhar metas financeiras, com ou
              sem um valor alvo.
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Filtros Avançados:</strong> Na aba "Gastos", agora pode
              filtrar as suas despesas por categoria e por status ("Pago" ou
              "Pendente").
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Melhorias de Usabilidade:</strong>
              <List ml={6} mt={2} spacing={1} fontSize="sm">
                <ListItem>
                  - Adição de gastos em meses futuros diretamente no formulário.
                </ListItem>
                <ListItem>
                  - Status de "Pago/Pendente" interativo na lista de gastos.
                </ListItem>
                <ListItem>
                  - Seletor de mês clicável para uma navegação mais rápida.
                </ListItem>
              </List>
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
