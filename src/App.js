import { useState, useEffect } from "react"; // Importe useState e useEffect
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // O observador do Firebase
import { auth } from "./firebase"; // Nosso módulo de autenticação
import ProtectedRoute from "./components/ProtectedRoute"; // Importa o componente de rota protegida
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import "./App.css";

function App() {
  // Estado para guardar o usuário logado. Começa como null.
  const [usuario, setUsuario] = useState(null);
  // Estado para saber se a verificação inicial já terminou.
  const [loading, setLoading] = useState(true);

  // useEffect é um hook que roda quando o componente é montado.
  // Perfeito para configurar nosso observador.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUsuario(currentUser); // Define o usuário (pode ser null se deslogado)
      setLoading(false); // Marca que a verificação terminou
    });

    // Limpa o observador quando o componente for desmontado
    return () => unsubscribe();
  }, []); // O array vazio [] garante que isso só rode uma vez

  // Enquanto a verificação estiver acontecendo, mostramos uma mensagem.
  if (loading) {
    return <div>Carregando...</div>;
  }
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/login">Login</Link> |{" "}
        <Link to="/cadastro">Cadastro</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute usuario={usuario}>
              <Dashboard usuario={usuario} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
