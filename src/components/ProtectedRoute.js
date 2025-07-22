// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

// Este componente recebe o usuário e o componente filho a ser renderizado
function ProtectedRoute({ usuario, children }) {
  if (!usuario) {
    // Se não houver usuário logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se houver usuário, renderiza o componente filho (ex: o Dashboard)
  return children;
}

export default ProtectedRoute;
