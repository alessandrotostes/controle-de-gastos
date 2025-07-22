// src/pages/Dashboard.js
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm"; // Importe o formulário
import ExpenseList from "../components/ExpenseList"; // Importe a lista

// O Dashboard agora recebe o objeto 'usuario' como prop
function Dashboard({ usuario }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Dashboard</h1>
        {/* Mostra o e-mail do usuário e o botão de sair */}
        <div>
          <span>{usuario.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
            Sair
          </button>
        </div>
      </header>

      <hr />

      {/* Renderiza o formulário de gastos, passando o usuário */}
      <ExpenseForm usuario={usuario} />

      <hr />

      {/* Renderiza a lista de gastos, passando o usuário */}
      <ExpenseList usuario={usuario} />
    </div>
  );
}

export default Dashboard;
