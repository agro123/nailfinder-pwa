// src/services/localDB.js

// --- FUNCIONES GENERALES ---
export const getUsers = () => {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

// --- CREAR UN USUARIO NUEVO ---
export const createUser = (newUser) => {
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
};

// --- BUSCAR UN USUARIO POR EMAIL ---
export const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find((u) => u.email === email);
};

// --- BORRAR TODOS LOS USUARIOS (para pruebas) ---
export const clearUsers = () => {
  localStorage.removeItem("users");
};
