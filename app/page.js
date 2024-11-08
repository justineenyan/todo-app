"use client";

import Image from "next/image";
import { db } from "./firebaseconfig";
import {
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import React, { useState, useEffect, useCallback } from "react";

// Function to add a todo item to Firestore
async function addTodo(title, details, dueDate) {
  try {
    const docRef = await addDoc(collection(db, "todos"), {
      title,
      details,
      dueDate,
      createdAt: serverTimestamp(),
    });
    console.log("Todo added with ID: ", docRef.id);
    return true;
  } catch (error) {
    console.error("Error adding todo: ", error);
    return false;
  }
}

// Function to delete a todo item from Firestore
async function deleteTodo(todoId, setTodos) {
  try {
    await deleteDoc(doc(db, "todos", todoId));
    // Immediately update state to reflect deletion
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
    console.log("Todo deleted successfully");
  } catch (error) {
    console.error("Error deleting todo: ", error);
  }
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Real-time listener to fetch todos
  const fetchTodos = useCallback(() => {
    const todosCollection = collection(db, "todos");
    const q = query(todosCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTodos = [];
      querySnapshot.forEach((doc) => {
        fetchedTodos.push({ id: doc.id, ...doc.data() });
      });
      setTodos(fetchedTodos);
    });
    return unsubscribe; // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    const unsubscribe = fetchTodos();
    return () => unsubscribe();
  }, [fetchTodos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUpdateMode && selectedTodo) {
      try {
        const todoRef = doc(db, "todos", selectedTodo.id);
        await updateDoc(todoRef, { title, details, dueDate });

        setTitle("");
        setDetails("");
        setDueDate("");
        setSelectedTodo(null);
        setIsUpdateMode(false);

        alert("Todo updated successfully!");
      } catch (error) {
        console.error("Error updating todo: ", error);
      }
    } else {
      const added = await addTodo(title, details, dueDate);
      if (added) {
        setTitle("");
        setDetails("");
        setDueDate("");
        alert("Todo added successfully!");
      }
    }
  };

  const handleUpdateClick = (todo) => {
    setTitle(todo.title);
    setDetails(todo.details);
    setDueDate(todo.dueDate);
    setSelectedTodo(todo);
    setIsUpdateMode(true);
  };

  return (
    <main className="flex flex-1 items-center justify-center flex-col md:flex-row min-h-screen">
      {/* Left section */}
      <section className="flex-1 flex md:flex-col items-center md:justify-start mx-auto">
        <div className="absolute top-4 left-4">
          <Image
            src="/images/yang.png"
            alt="a todo pic"
            width={50}
            height={50}
          />
        </div>
        {/* Todo form */}
        <div className="p-6 md:p-12 mt-10 rounded-lg shadow-xl w-full max-w-lg bg-white">
          <h2 className="text-center text-2xl font-bold leading-9 text-gray-900">
            {isUpdateMode ? "Update Your Todo" : "Create a Todo"}
          </h2>
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-600">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border py-2 pl-2 text-gray-900 shadow ring"
              />
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-600">
                Details
              </label>
              <textarea
                id="details"
                name="details"
                rows="4"
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded border py-2 pl-2 text-gray-900 shadow ring"
              ></textarea>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-600">
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border py-2 pl-2 text-gray-900 shadow ring bg-blue-200"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700">
              {isUpdateMode ? "Update Todo" : "Create Todo"}
            </button>
          </form>
        </div>
      </section>

      <section className="md:w-1/2 md:max-h-screen overflow-y-auto md:ml-10 mt-20 mx-auto">
        <div className="p-6 md:p-12 mt-10 rounded-lg shadow-xl w-full max-w-lg bg-white">
          <h2 className="text-center text-2xl font-bold leading-9 text-gray-900">
            Todo List
          </h2>
          <div className="mt-6 space-y-6">
            {todos.map((todo) => (
              <div key={todo.id} className="border p-4 rounded-md shadow md">
                <h3 className="text-lg font-semibold text-gray-900 break-words">{todo.title}</h3>
                <p className="text-sm text-gray-500">Due Date: {todo.dueDate}</p>
                <p className="text-gray-700 break-words">{todo.details}</p>
                <div className="mt-4 space-x-6">
                  <button
                    className="px-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                    onClick={() => handleUpdateClick(todo)}
                  >
                    Update
                  </button>
                  <button
                    className="px-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md"
                    onClick={() => deleteTodo(todo.id, setTodos)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
