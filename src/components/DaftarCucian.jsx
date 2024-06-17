"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Image from "next/image";
import axios from "axios";

import { IoMdClose } from "react-icons/io";
import {
  MdModeEditOutline,
  MdOutlineLocalLaundryService,
} from "react-icons/md";

const MySwal = withReactContent(Swal);

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function DaftarCucian() {
  const formatDate = (dateString) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = new Date(dateString);
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const dayOfMonth = date.getDate();

    return `${day}, ${dayOfMonth} ${month} ${year}`;
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]); // State untuk menyimpan daftar items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/orders/");
      const sortedData = response.data.sort((a, b) => a.status - b.status);
      setData(sortedData);
      console.log("Fetched order:", sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openEditModal = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setIsModalOpen(false);
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const formData = {
      hp: event.target.hp.value,
      nama: event.target.nama.value,
      tanggal_masuk: event.target.tanggal_masuk.value,
      tanggal_selesai: event.target.tanggal_selesai.value,
      catatan_khusus: event.target.catatan_khusus.value,
      jenis_laundry: event.target.jenis_laundry.value,
      jumlah_berat: event.target.jumlah_berat.value,
      total_harga: event.target.total_harga.value,
      status: "0", // Status default 'Proses'
    };

    try {
      const response = await axios.put(
        `http://localhost:8000/api/orders/${itemToEdit.id}/`,
        formData
      );
      console.log("Respon dari server (update):", response.data);

      // Update data di frontend
      const updatedData = data.map((item) =>
        item.id === itemToEdit.id ? { ...item, ...formData } : item
      );
      setData(updatedData);

      closeEditModal();
    } catch (error) {
      console.error("Error updating data:", error);
      // Tampilkan pesan kesalahan atau lakukan penanganan kesalahan lainnya
    }
  };

  const getJenisLaundryDisplayName = (jenisLaundry) => {
    switch (jenisLaundry) {
      case "cucibiasa":
        return "Cuci Biasa";
      case "cuciexpress":
        return "Cuci Express";
      case "setrikasaja":
        return "Setrika Saja";
      case "cucisprei":
        return "Cuci Seprei";
      case "cucijas":
        return "Cuci Jas";

      default:
        return jenisLaundry;
    }
  };

  const getUnit = (jenisLaundry) => {
    switch (jenisLaundry) {
      case "cucibiasa":
      case "cuciexpress":
      case "setrikasaja":
        return "kg";
      case "cucisprei":
      case "cucijas":
        return "pcs";
      default:
        return "";
    }
  };

  const columns = [
    {
      name: "No.",
      selector: (_, index) => index + 1,
      sortable: true,
    },
    {
      name: "id",
      selector: (row) => row.id,
      sortable: false,
    },
    {
      name: "Nama",
      selector: (row) => row.nama,
      sortable: false,
    },
    {
      name: "No. Handphone",
      selector: (row) => row.hp,
      sortable: false,
    },
    {
      name: "Jenis Laundry",
      cell: (row) => (
        <div>
          {row.items.map((item, index) => (
            <div key={index}>
              {getJenisLaundryDisplayName(item.jenis_laundry)}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Berat",
      cell: (row) => (
        <div>
          {row.items.map((item, index) => {
            // Periksa apakah item.jumlah_berat adalah angka yang valid
            const parsedBerat = parseFloat(item.jumlah_berat);
            if (!isNaN(parsedBerat)) {
              return (
                <div key={index}>
                  {parsedBerat.toFixed(2)} {getUnit(item.jenis_laundry)}
                </div>
              );
            } else {
              // Jika item.jumlah_berat tidak valid, tampilkan nilai kosong atau sesuaikan dengan kebutuhan
              return null; // atau tampilkan pesan alternatif jika diperlukan
            }
          })}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Tanggal Masuk",
      selector: (row) => formatDate(row.tanggal_masuk),
      sortable: true,
    },
    {
      name: "Tanggal Selesai",
      selector: (row) => formatDate(row.tanggal_selesai),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => row.total_harga,
      sortable: true,
      format: (row) =>
        `Rp ${row.total_harga ? row.total_harga.toLocaleString("id-ID") : ""}`,
    },
    {
      name: "Catatan",
      selector: (row) => row.catatan_khusus,
      sortable: false,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="space-x-2 flex items-center">
          <div
            className={`py-2 px-4 w-20 text-center ${
              row.status === "0" ? "bg-yellow-500" : "bg-green-700"
            } text-white font-bold rounded-md`}
          >
            <h1>{row.status === "0" ? "Proses" : "Selesai"}</h1>
          </div>
          <button
            className=" py-2 px-4 bg-blue-500 rounded-md flex text-center justify-center"
            onClick={() => openEditModal(row)}
          >
            <MdModeEditOutline size={16} color="white" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      sortable: true,
    },
  ];

  const handleRowClick = (row) => {
    setSelectedItem(row);
    MySwal.fire({
      title: <h1>Konfirmasi Cucian</h1>,
      html: (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src="/alert.png"
              alt="Custom image"
              width={150}
              height={150}
            />
          </div>
        </div>
      ), // Image after the title
      showCancelButton: true,
      confirmButtonText: "Cucian Selesai",
      cancelButtonText: "Batal",
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Memperbarui status cucian di backend
        axios
          .put(`http://localhost:8000/api/orders/${row.id}/`, {
            ...row,
            status: "1", // Mengubah status menjadi 1 (Selesai)
          })
          .then((response) => {
            // Memperbarui data di frontend setelah berhasil memperbarui di backend
            const updatedData = data.map((item) =>
              item.id === row.id ? { ...item, status: "1" } : item
            );
            const sortedData = updatedData.sort((a, b) => a.status - b.status);
            setData(sortedData);
            setSelectedItem(null);

            // Menampilkan alert sukses setelah status diperbarui
            MySwal.fire({
              icon: "success",
              title: "Pesanan Selesai",
              text: "Status cucian berhasil diubah menjadi selesai!",
              confirmButtonText: "OK",
            });
          })
          .catch((error) => {
            console.error("Error updating laundry status:", error);
          });
      } else {
        setSelectedItem(null);
      }
    });
  };

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (id) => {
    MySwal.fire({
      title: "Apakah Anda yakin?",
      text: "Data ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/orders/${id}/`);
          // Hapus item dari state data
          setData(data.filter((item) => item.id !== id));
          MySwal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil dihapus.",
          });
        } catch (error) {
          console.error("Error deleting data:", error);
          MySwal.fire({
            icon: "error",
            title: "Gagal",
            text: "Gagal menghapus data",
          });
        }
      }
    });
  };

  // Fungsi untuk menambah item ke dalam state items
  const addItem = () => {
    const newItem = {
      jenisLaundry: "",
      jumlahBerat: "",
    };
    setItems([...items, newItem]);
  };

  // Fungsi untuk menghapus item dari state items berdasarkan index
  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Fungsi untuk menghandle perubahan jenis laundry pada item tertentu
  const handleChangeJenisLaundry = (index, event) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      jenisLaundry: event.target.value,
    };
    setItems(updatedItems);
  };

  // Fungsi untuk menghandle perubahan jumlah berat pada item tertentu
  const handleChangeJumlahBerat = (index, event) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      jumlahBerat: event.target.value,
    };
    setItems(updatedItems);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center px-2">
        <h1 className="text-4xl font-bold text-center mt-5 mb-5">
          Daftar Cucian
        </h1>
        <div className=" px-2 border-2 rounded-lg">
          <input
            type="text"
            className="ml-auto px-3 py-1 border border-gray-400 rounded-md mb-1 mt-5 w-40"
            placeholder="Cari Nama"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          <DataTable
            columns={columns}
            data={filteredData} // Menggunakan data yang telah difilter
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 8]}
            onRowClicked={handleRowClick}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeEditModal}
        style={customStyles}
        contentLabel="Update Cucian"
      >
        {itemToEdit && (
          <form
            onSubmit={handleUpdateSubmit}
            className="bg-white px-5 py-5 rounded-lg flex flex-col"
          >
            <div className="items-center border-b-2 mb-2">
              <div className="flex justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MdOutlineLocalLaundryService size={20} />{" "}
                  <h2 className="text-xl font-bold">Update Cucian</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
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
                  defaultValue={itemToEdit.hp}
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
                  defaultValue={itemToEdit.nama}
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
                  defaultValue={itemToEdit.tanggal_masuk}
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
                  defaultValue={itemToEdit.tanggal_selesai}
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <div className="flex flex-col">
                <label htmlFor="total_harga">Total Harga</label>
                <input
                  type="number"
                  id="total_harga"
                  name="total_harga"
                  className="border px-4 py-1 mt-2 rounded-md bg-gray-300 cursor-not-allowed"
                  required
                  defaultValue={itemToEdit.total_harga}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="catatan_khusus">Catatan Khusus</label>
                <input
                  type="text"
                  id="catatan_khusus"
                  name="catatan_khusus"
                  className="border px-2 py-1 mt-2 rounded-md"
                  defaultValue={itemToEdit.catatan_khusus}
                />
              </div>
            </div>

            <div className="static border max-w-2xl p-4 mt-4">
              {items.map((item, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <div className="flex flex-col">
                    <label htmlFor={`jenis_laundry${index}`}>
                      Jenis Laundry
                    </label>
                    <select
                      id={`jenis_laundry${index}`}
                      name={`jenis_laundry${index}`}
                      className="border px-4 py-1 mt-2 rounded-md"
                      required
                      value={item.jenisLaundry}
                      onChange={(event) =>
                        handleChangeJenisLaundry(index, event)
                      }
                    >
                      <option value="" disabled>
                        Pilih jenis laundry
                      </option>
                      <option value="cucibiasa">
                        Cuci Biasa (Rp 7.000/kg)
                      </option>
                      <option value="cuciexpress">
                        Cuci Express (Rp 10.000/kg)
                      </option>
                      <option value="setrikasaja">
                        Setrika Saja (Rp 5.000/kg)
                      </option>
                      <option value="cucisprei">
                        Cuci Sprei (Rp 10.000/pcs)
                      </option>
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
                      placeholder={`Masukkan jumlah ${getUnit(
                        item.jenisLaundry
                      )}`}
                      required
                      value={item.jumlahBerat}
                      onChange={(event) =>
                        handleChangeJumlahBerat(index, event)
                      }
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

            <div className=" flex-col flex space-y-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
              >
                Update
              </button>
              <button
                type="button"
                onClick={closeEditModal}
                className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  closeEditModal();
                  handleDelete(itemToEdit.id);
                }}
                className="bg-yellow-700 text-white px-4 py-2 rounded-md mt-4"
              >
                Hapus
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
