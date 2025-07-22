// src/components/ExpenseList.js
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function ExpenseList({ usuario }) {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    if (!usuario) return; // Não faz nada se o usuário não estiver logado

    // Cria uma consulta para buscar os gastos
    const q = query(
      collection(db, "gastos"),
      where("userId", "==", usuario.uid), // Apenas gastos do usuário logado
      orderBy("data", "desc") // Ordena os mais recentes primeiro
    );

    // 'onSnapshot' é o ouvinte em tempo real.
    // Ele roda uma vez para buscar os dados iniciais e depois
    // roda de novo toda vez que os dados mudam (adicionar, editar, excluir).
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gastosData = [];
      querySnapshot.forEach((doc) => {
        gastosData.push({ ...doc.data(), id: doc.id });
      });
      setGastos(gastosData);
    });

    // Limpa o ouvinte quando o componente for desmontado
    return () => unsubscribe();
  }, [usuario]); // O useEffect vai rodar de novo se o usuário mudar

  return (
    <div>
      <h3>Meus Gastos</h3>
      <ul>
        {gastos.map((gasto) => (
          <li key={gasto.id}>
            {/* Verifica se a data existe antes de tentar formatá-la */}
            {gasto.data &&
              new Date(gasto.data.seconds * 1000).toLocaleDateString()}{" "}
            -<strong>{gasto.descricao}</strong> - R$ {gasto.valor.toFixed(2)} (
            {gasto.categoria})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseList;
