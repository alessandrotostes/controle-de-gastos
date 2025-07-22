// src/components/ExpenseForm.js
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // Nosso banco de dados

function ExpenseForm({ usuario }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Alimentação"); // Categoria padrão

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descricao === "" || valor === "") {
      alert("Por favor, preencha todos os campos");
      return;
    }

    try {
      // 'addDoc' adiciona um novo documento a uma coleção.
      // O primeiro argumento é a referência da coleção.
      // O segundo é o objeto de dados que queremos salvar.
      await addDoc(collection(db, "gastos"), {
        descricao: descricao,
        valor: Number(valor), // Garante que o valor seja salvo como número
        categoria: categoria,
        data: serverTimestamp(), // Pega a data e hora do servidor
        userId: usuario.uid, // **MUITO IMPORTANTE: vincula o gasto ao usuário logado**
      });

      // Limpa o formulário após o envio
      setDescricao("");
      setValor("");
      setCategoria("Alimentação");
    } catch (error) {
      console.error("Erro ao adicionar gasto: ", error);
      alert("Ocorreu um erro ao adicionar o gasto.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Adicionar Novo Gasto</h3>
      <input
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição"
      />
      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Valor"
      />
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="Alimentação">Alimentação</option>
        <option value="Transporte">Transporte</option>
        <option value="Moradia">Moradia</option>
        <option value="Lazer">Lazer</option>
        <option value="Outros">Outros</option>
      </select>
      <button type="submit">Adicionar Gasto</button>
    </form>
  );
}

export default ExpenseForm;
