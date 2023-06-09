import Layout from "@/components/Layout";
import {
  CloseButton,
  Skeleton,
  Modal,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import Head from "next/head";
import React, { useEffect, useState, useRef } from "react";

const columns = [
  { key: "MACHINESN", label: "MACHINESN", width: "1/8", searchable: true },
  { key: "FRAME", label: "FRAME", width: "1/8", searchable: true },
  {
    key: "PLANTADDRESS1",
    label: "PLANTADDRESS1",
    width: "1/8",
    searchable: true,
  },
  { key: "PLANTNAME", label: "PLANTNAME", width: "1/8", searchable: true },
  { key: "UNITNAME", label: "UNITNAME", width: "1/8", searchable: true },
  {
    key: "CRM_PLANT_ID",
    label: "CRM_PLANT_ID",
    width: "1/8",
    searchable: true,
  },
  { key: "CRM_UNIT_ID", label: "CRM_UNIT_ID", width: "1/8", searchable: true },
];

const PlantInfo = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const tableRef = useRef(null);
  const headerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_PLANT_INFO);
      const plant_info = await response.json();
      const plant_info_ori = plant_info.map((plant) => {
        return {
          ...plant,
          id: plant.MACHINESN,
          CRM_PLANT_ID_ORIGINAL: plant.CRM_PLANT_ID,
          CRM_UNIT_ID_ORIGINAL: plant.CRM_UNIT_ID,
        };
      });
      setData(plant_info_ori);
      setIsLoading(false);
    } catch (error) {
      console.error("データの読み込みに失敗しました", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScroll = () => {
    const tableHeader = headerRef.current;
    const tableContainer = tableWrapperRef.current;
    if (tableHeader && tableContainer) {
      tableHeader.style.transform = `translateY(${tableContainer.scrollTop}px)`;
    }
  };

  const handleEditClick = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              editable: !item.editable,
              CRM_PLANT_ID: item.CRM_PLANT_ID_ORIGINAL,
              CRM_UNIT_ID: item.CRM_UNIT_ID_ORIGINAL,
            }
          : item
      )
    );
  };

  const handleSaveClick = (id) => {
    const editedItem = data.find((item) => item.id === id);
    setSelectedData(editedItem);
    setConfirmationOpen(true);
  };

  const handleConfirmation = async (confirmed) => {
    setConfirmationOpen(false);

    if (confirmed) {
      try {
        // Perform the save operation
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_PLANT_UPDATE_INFO,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              MACHINESN: selectedData.id,
              CRM_PLANT_ID: selectedData.CRM_PLANT_ID,
              CRM_UNIT_ID: selectedData.CRM_UNIT_ID,
            }),
          }
        );

        if (response.ok) {
          setNotification({
            type: "success",
            message: "データの更新が完了しました。",
          });
          setTimeout(() => {
            setNotification(null);
          }, 3000); // Close the notification after 3 seconds

          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedData.id ? { ...item, editable: false } : item
            )
          );
        } else {
          throw new Error("データの保存に失敗しました。");
        }
      } catch (error) {
        console.error("データの保存に失敗しました", error);
        setNotification({
          type: "error",
          message: "データの保存に失敗しました。",
        });
      }
    } else {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedData.id
            ? {
                ...item,
                editable: false,
                CRM_PLANT_ID: item.CRM_PLANT_ID_ORIGINAL,
                CRM_UNIT_ID: item.CRM_UNIT_ID_ORIGINAL,
              }
            : item
        )
      );
    }
  };

  const handleCancelClick = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              editable: false,
              CRM_PLANT_ID: item.CRM_PLANT_ID_ORIGINAL,
              CRM_UNIT_ID: item.CRM_UNIT_ID_ORIGINAL,
            }
          : item
      )
    );
  };

  const handleInputChange = (e, id, key) => {
    const { value } = e.target;
    let isEditable = true;
    if (
      (key === "CRM_PLANT_ID" || key === "CRM_UNIT_ID") &&
      value.length > 25
    ) {
      setErrorMessage("入力は25文字以下である必要があります。");
      isEditable = false;
      return;
    }
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id && (key === "CRM_PLANT_ID" || key === "CRM_UNIT_ID")
          ? { ...item, [key]: value, editable: isEditable }
          : item
      )
    );
    setErrorMessage(null);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const filteredData = data.filter((item) => {
    return columns.some((column) => {
      if (column.searchable && typeof item[column.key] === "string") {
        return item[column.key]
          .toLowerCase()
          .includes(searchKeyword.toLowerCase());
      }
      return false;
    });
  });

  return (
    <Layout>
      <Head>
        <title>プラントID登録</title>
      </Head>
      {isLoading ? (
        <Skeleton height={30} />
      ) : (
        <div className="container mx-auto p-4 overflow-x-auto">
          <h1 className="text-3xl font-bold mb-4">プラント情報</h1>
          <p>~ CRM_UNIT_ID, CRM_PLANT_ID の更新 ~</p>
          {notification && (
            <div
              className={`p-4 mb-4 ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white flex justify-between`}
            >
              <span>{notification.message}</span>
              <CloseButton
                size="xl"
                iconSize={20}
                onClick={closeNotification}
              />
            </div>
          )}
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
          <div className="pb-2 bg-white">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search"
            />
          </div>
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "75vh" }}
            onScroll={handleScroll}
            ref={tableWrapperRef}
          >
            <Table>
              <thead ref={headerRef} className="bg-white">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-2 w-${column.width}`}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 w-1/8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
                        {columns.map((column) => (
                          <td key={`${index}-${column.key}`} colSpan={1}>
                            <Skeleton height={30} />
                          </td>
                        ))}
                        <td></td>
                      </tr>
                    ))
                  : filteredData.map((item) => (
                      <tr key={item.id}>
                        {columns.map((column) => (
                          <td
                            key={`${item.id}-${column.key}`}
                            className={`px-4 py-2 w-${column.width}`}
                          >
                            {item.editable &&
                            (column.key === "CRM_PLANT_ID" ||
                              column.key === "CRM_UNIT_ID") ? (
                              <TextInput
                                value={item[column.key] || ""}
                                onChange={(e) =>
                                  handleInputChange(e, item.id, column.key)
                                }
                              />
                            ) : (
                              <Text>{item[column.key]}</Text>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 w-1/8">
                          {item.editable ? (
                            <>
                              <button
                                className="px-2 py-1 bg-blue-500 text-white rounded"
                                onClick={() => handleSaveClick(item.id)}
                              >
                                DB書込
                              </button>
                              <button
                                className="px-2 py-1 bg-red-500 text-white rounded"
                                onClick={() => handleCancelClick(item.id)}
                              >
                                キャンセル
                              </button>
                            </>
                          ) : (
                            <button
                              className="px-2 py-1 bg-green-500 text-white rounded"
                              onClick={() => handleEditClick(item.id)}
                            >
                              編集
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </Table>
          </div>
          <Modal
            opened={isConfirmationOpen}
            onClose={() => setConfirmationOpen(false)}
            title="データの保存"
            size="md"
          >
            <Table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>値</th>
                </tr>
              </thead>
              <tbody>
                {selectedData &&
                  columns.map((column) => (
                    <tr key={column.key}>
                      <td>{column.label}</td>
                      <td>{selectedData[column.key]}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 bg-green-500 text-white rounded"
                onClick={() => handleConfirmation(true)}
              >
                保存
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => handleConfirmation(false)}
              >
                キャンセル
              </button>
            </div>
          </Modal>
        </div>
      )}
    </Layout>
  );
};

export default PlantInfo;
