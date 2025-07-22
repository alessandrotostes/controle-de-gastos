// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// A função de login é a signInWithEmailAndPassword
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      // Usa a função do Firebase para fazer o login
      await signInWithEmailAndPassword(auth, email, senha);
      // Se o login for bem-sucedido, redireciona para o Dashboard
      navigate("/");
    } catch (error) {
      // Trata erros comuns como senha incorreta ou usuário não encontrado
      setErro("E-mail ou senha inválidos.");
      console.error("Erro no login:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
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
          placeholder="Sua senha"
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default Login;
