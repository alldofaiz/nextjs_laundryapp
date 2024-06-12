"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { MdModeEditOutline } from "react-icons/md";
import Modal from "react-modal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Image from "next/image";
import axios from "axios";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/laundry/");
      const sortedData = response.data.sort((a, b) => a.status - b.status);
      setData(sortedData);
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
        `http://localhost:8000/api/laundry/${itemToEdit.id}/`,
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
      selector: (row) => row.jenis_laundry,
      sortable: false,
    },
    {
      name: "Berat (kg)",
      selector: (row) => row.jumlah_berat,
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
          .put(`http://localhost:8000/api/laundry/${row.id}/`, {
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
          await axios.delete(`http://localhost:8000/api/laundry/${id}/`);
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
            text: "Gagal menghapus data.",
          });
        }
      }
    });
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
          <form onSubmit={handleUpdateSubmit}>
            <div className="flex-col flex space-y-4">
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
              <div className="flex space-x-4">
                <div className="flex flex-col">
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
              <div className="flex-col flex">
                <label htmlFor="catatan_khusus">Catatan Khusus</label>
                <input
                  type="text"
                  id="catatan_khusus"
                  name="catatan_khusus"
                  className="border px-2 py-1 mt-2 rounded-md"
                  defaultValue={itemToEdit.catatan_khusus}
                />
              </div>
              <div className="flex-col flex" style={{ display: "none" }}>
                <label htmlFor="jenis_laundry">Jenis Laundry</label>
                <select
                  id="jenis_laundry"
                  name="jenis_laundry"
                  className="border px-4 py-1 mt-2 rounded-md"
                  required
                  defaultValue={itemToEdit.jenis_laundry}
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

              <div className="flex-col flex">
                <label htmlFor="jumlah_berat">Berat (kg)</label>
                <input
                  type="number"
                  id="jumlah_berat"
                  name="jumlah_berat"
                  className="border px-4 py-1 mt-2 rounded-md"
                  placeholder="Masukkan jumlah berat"
                  required
                  defaultValue={itemToEdit.jumlah_berat}
                />
              </div>
              <div className="flex-col flex">
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
