import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

function FamilyManager({ usuario }) {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!usuario || !usuario.familiaId) return;

    const q = query(
      collection(db, "usuarios"),
      where("familiaId", "==", usuario.familiaId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map((doc) => doc.data().email);
      setMembers(membersData);
    });
    return unsubscribe;
  }, [usuario]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (inviteEmail.trim() === "" || !usuario.familiaId) return;
    setIsLoading(true);

    try {
      const q = query(
        collection(db, "convites"),
        where("emailConvidado", "==", inviteEmail)
      );
      const existingInvites = await getDocs(q);
      if (!existingInvites.empty) {
        toast({
          title: "Este email já foi convidado.",
          status: "warning",
          duration: 3000,
        });
        setIsLoading(false);
        return;
      }

      await addDoc(collection(db, "convites"), {
        familiaId: usuario.familiaId,
        emailConvidado: inviteEmail,
        convidadoPor: usuario.email,
        status: "pendente",
        criadoEm: serverTimestamp(),
      });

      toast({
        title: `Convite enviado para ${inviteEmail}!`,
        description:
          "Contate o admnistrador do app para liberação do novo familiar convidado.",
        status: "success",
        duration: 5000,
      });
      setInviteEmail("");
    } catch (error) {
      toast({
        title: "Erro ao enviar convite.",
        status: "error",
        duration: 3000,
      });
      console.error("Erro ao convidar:", error);
    }
    setIsLoading(false);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Gerir Família
      </Heading>
      <Box mb={8}>
        <Heading as="h3" size="md" mb={3}>
          Membros Atuais
        </Heading>
        {/* AQUI ESTÁ A CORREÇÃO: Adicionamos a propriedade 'wrap' */}
        <HStack spacing={4} wrap="wrap">
          {members.map((email) => (
            // Adicionamos uma Box para controlar o tamanho máximo do email
            <Box
              key={email}
              bg="gray.100"
              _dark={{ bg: "gray.600" }}
              px={3}
              py={1}
              borderRadius="md"
              mb={2}
            >
              <Text isTruncated maxW="250px" title={email}>
                {email}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>
      <VStack
        as="form"
        onSubmit={handleInvite}
        spacing={4}
        align="stretch"
        p={4}
        borderWidth="1px"
        borderRadius="lg"
      >
        <FormControl>
          <FormLabel>Convidar Novo Membro</FormLabel>
          <InputGroup>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email do novo membro"
            />
            <InputRightElement w="auto" pr={1}>
              <Button
                type="submit"
                isLoading={isLoading}
                colorScheme="blue"
                size="sm"
              >
                Convidar
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
      </VStack>
    </Box>
  );
}

export default FamilyManager;
