"use client";
import DaftarCucian from "@/components/DaftarCucian";
import TambahCucian from "@/components/TambahCucian";
import React, { useState, useEffect } from "react";

import { IoMdAdd } from "react-icons/io";

export default function Page() {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  return (
    <main className="h-screen relative">
      {/* Navbar */}
      <nav className="bg-blue-500 py-5">
        <div className="flex justify-between items-center px-10">
          <h1 className="font-bold">Logo</h1>
          <h1 className="flex justify-center font-bold">Kasir</h1>
          <div className="flex space-x-5">
            <h1>Keluar</h1>
          </div>
        </div>
      </nav>
      {/* Navbar */}

      {/* Table item */}
      <DaftarCucian />
      {/* Table item */}

      {/* Button add cucian */}
      <div className="absolute right-5 bottom-5">
        <button className="p-2 bg-blue-500 rounded-full" onClick={toggleForm}>
          <IoMdAdd color="white" size={30} />
        </button>
      </div>
      {/* Button add cucian */}

      {/* Form */}
      <TambahCucian showForm={showForm} toggleForm={toggleForm} />
      {/* Form */}
    </main>
  );
}
