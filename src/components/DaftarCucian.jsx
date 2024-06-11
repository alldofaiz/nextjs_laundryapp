"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { MdModeEditOutline } from "react-icons/md";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Image from "next/image";
import axios from "axios";

const MySwal = withReactContent(Swal);

export default function DaftarCucian() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/laundry/");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      selector: (row) => row.tanggal_masuk,
      sortable: true,
    },
    {
      name: "Tanggal Selesai",
      selector: (row) => row.tanggal_selesai,
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
          <button className=" py-2 px-4 bg-blue-500 rounded-md flex text-center justify-center">
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
        const updatedData = data.map((item) =>
          item.id === row.id ? { ...item, status: "Selesai" } : item
        );
        setData(updatedData);
      } else {
        setSelectedItem(null);
      }
    });
  };

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchText.toLowerCase())
  );

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
    </div>
  );
}
