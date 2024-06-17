"use client";
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { MdOutlineLocalLaundryService } from "react-icons/md";
import axios from "axios";

const Page = ({ showForm, toggleForm }) => {
  const [items, setItems] = useState([{ jenisLaundry: "", jumlahBerat: "" }]);
  const [totalHarga, setTotalHarga] = useState(0);

  const hargaLaundry = {
    cucibiasa: 7000,
    cuciexpress: 10000,
    setrikasaja: 5000,
    cucisprei: 10000,
    cucijas: 20000,
  };

  const addItem = () => {
    setItems([...items, { jenisLaundry: "", jumlahBerat: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleChangeJenisLaundry = (index, event) => {
    const newItems = items.slice();
    newItems[index].jenisLaundry = event.target.value;
    setItems(newItems);
  };

  const handleChangeJumlahBerat = (index, event) => {
    const newItems = items.slice();
    newItems[index].jumlahBerat = event.target.value;
    setItems(newItems);
  };

  const getUnit = (jenisLaundry) => {
    if (
      jenisLaundry === "cucibiasa" ||
      jenisLaundry === "cuciexpress" ||
      jenisLaundry === "setrikasaja"
    ) {
      return "kg";
    } else if (jenisLaundry === "cucisprei" || jenisLaundry === "cucijas") {
      return "pcs";
    }
    return "";
  };

  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const unitPrice = hargaLaundry[item.jenisLaundry] || 0;
      const weight = parseFloat(item.jumlahBerat) || 0;
      return sum + unitPrice * weight;
    }, 0);
    setTotalHarga(total);
  }, [items]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = {
        hp: event.target.hp.value,
        nama: event.target.nama.value,
        tanggal_masuk: event.target.tanggal_masuk.value,
        tanggal_selesai: event.target.tanggal_selesai.value,
        catatan_khusus: event.target.catatan_khusus.value,
        items: items, // Send all items
        total_harga: totalHarga,
        status: "0",
      };

      console.log("Data yang akan dikirim ke server:", formData);

      const response = await axios.post(
        "http://localhost:8000/api/add_order/",
        formData
      );

      console.log("Respon dari server:", response.data);

      event.target.reset();
      setItems([{ jenisLaundry: "", jumlahBerat: "" }]);
      setTotalHarga(0);
    } catch (error) {
      console.error("Error saat menyimpan data:", error);
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white px-5 py-5 rounded-lg flex flex-col"
      >
        <div className="items-center border-b-2 mb-2">
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MdOutlineLocalLaundryService size={20} />{" "}
              <h2 className="text-xl font-bold">Tambah Cucian</h2>
            </div>
            <button
              type="button"
              onClick={toggleForm}
              className="text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-col flex">
            <label htmlFor="hp">No. Handphone</label>
            <input
              type="number"
              id="hp"
              name="hp"
              className="border px-4 py-1 mt-2 rounded-md"
              required
            />
          </div>
          <div className="flex-col flex">
            <label htmlFor="nama">Nama</label>
            <input
              type="text"
              id="nama"
              name="nama"
              className="border px-4 py-1 mt-2 rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-4 ">
          <div className="flex flex-col ">
            <label htmlFor="tanggal_masuk">Tanggal Masuk</label>
            <input
              type="date"
              id="tanggal_masuk"
              name="tanggal_masuk"
              className="border px-4 py-1 mt-2 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tanggal_selesai">Tanggal Selesai</label>
            <input
              type="date"
              id="tanggal_selesai"
              name="tanggal_selesai"
              className="border px-4 py-1 mt-2 rounded-md"
              required
            />
          </div>
        </div>

        <div className="static border max-w-2xl p-4 mt-4">
          {items.map((item, index) => (
            <div key={index} className="flex space-x-4 mb-4">
              <div className="flex flex-col">
                <label htmlFor={`jenis_laundry${index}`}>Jenis Laundry</label>
                <select
                  id={`jenis_laundry${index}`}
                  name={`jenis_laundry${index}`}
                  className="border px-4 py-1 mt-2 rounded-md"
                  required
                  value={item.jenisLaundry}
                  onChange={(event) => handleChangeJenisLaundry(index, event)}
                >
                  <option value="" disabled>
                    Pilih jenis laundry
                  </option>
                  <option value="cucibiasa">Cuci Biasa (Rp 7.000/kg)</option>
                  <option value="cuciexpress">
                    Cuci Express (Rp 10.000/kg)
                  </option>
                  <option value="setrikasaja">
                    Setrika Saja (Rp 5.000/kg)
                  </option>
                  <option value="cucisprei">Cuci Sprei (Rp 10.000/pcs)</option>
                  <option value="cucijas">Cuci Jas (Rp 20.000/pcs)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor={`jumlah_berat${index}`}>
                  Jumlah ({getUnit(item.jenisLaundry)})
                </label>
                <input
                  type="number"
                  id={`jumlah_berat${index}`}
                  name={`jumlah_berat${index}`}
                  className="border px-4 py-1 mt-2 rounded-md"
                  placeholder={`Masukkan jumlah ${getUnit(item.jenisLaundry)}`}
                  required
                  value={item.jumlahBerat}
                  onChange={(event) => handleChangeJumlahBerat(index, event)}
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="mt-8"
                  onClick={() => removeItem(index)}
                >
                  <IoMdClose size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="px-1 py-1 w-20 border bg-blue-500 text-white text-sm rounded-lg"
            onClick={addItem}
          >
            Tambah
          </button>
        </div>

        <div className="flex space-x-4 mt-4">
          <div className="flex flex-col">
            <label htmlFor="total_harga">Total Harga</label>
            <input
              type="number"
              id="total_harga"
              name="total_harga"
              readOnly
              className="border px-4 py-1 mt-2 cursor-default bg-gray-300 rounded-md"
              value={totalHarga}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="catatan_khusus">Catatan Khusus</label>
            <input
              type="text"
              id="catatan_khusus"
              name="catatan_khusus"
              className="border px-2 py-1 mt-2 rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Page;
