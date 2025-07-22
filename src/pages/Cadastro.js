// src/pages/Cadastro.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importe a função de criação de usuário do Firebase e nosso 'auth'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Cadastro() {
  // Estados para guardar o e-mail e a senha digitados pelo usuário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(""); // Estado para guardar mensagens de erro
  const navigate = useNavigate(); // Hook para redirecionar o usuário após o cadastro

  // Função que é chamada quando o formulário é enviado
  const handleCadastro = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    setErro(""); // Limpa erros anteriores

    try {
      // Usa a função do Firebase para criar um novo usuário
      await createUserWithEmailAndPassword(auth, email, senha);
      // Se o cadastro for bem-sucedido, redireciona o usuário para a página de login
      navigate("/login");
    } catch (error) {
      // Se houver um erro (ex: e-mail já existe, senha fraca), exibe a mensagem
      setErro(error.message);
      console.error("Erro no cadastro:", error);
    }
  };

  return (
    <div>
      <h1>Crie sua Conta</h1>
      <form onSubmit={handleCadastro}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          required
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha (mínimo 6 caracteres)"
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
      {/* Exibe a mensagem de erro, se houver uma */}
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default Cadastro;
