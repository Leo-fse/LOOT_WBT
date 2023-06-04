import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Text,
  TextInput,
  CloseButton,
  Skeleton,
  Modal,
} from "@mantine/core";
import Layout from "@/components/Layout";
import Head from "next/head";

const columns = [
  { key: "id", label: "ID", width: "1/12", searchable: false },
  { key: "title", label: "Title", width: "2/12", searchable: true },
  { key: "body", label: "Body", width: "3/12", searchable: true },
  { key: "username", label: "Username", width: "1/12", searchable: true },
  { key: "city", label: "City", width: "1/12", searchable: true },
  { key: "email", label: "Email", width: "1/12", searchable: false },
  { key: "phone", label: "Phone", width: "1/12", searchable: false },
  { key: "actions", label: "Actions", width: "1/12", searchable: false },
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
      const usersResponse = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const postsResponse = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );

      const users = await usersResponse.json();
      const posts = await postsResponse.json();

      const postsWithUserDetails = posts.map((post) => {
        const correspondingUser = users.find((user) => user.id === post.userId);
        return {
          ...post,
          username: correspondingUser?.username,
          email: correspondingUser?.email,
          emailOriginal: correspondingUser?.email,
          phone: correspondingUser?.phone,
          phoneOriginal: correspondingUser?.phone,
          city: correspondingUser?.address.city,
          editable: false,
        };
      });

      setData(postsWithUserDetails);
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
        item.id === id ? { ...item, editable: !item.editable } : item
      )
    );
  };

  const handleSaveClick = (id) => {
    const editedItem = data.find((item) => item.id === id);
    setSelectedData(editedItem);
    setConfirmationOpen(true);
  };

  const handleConfirmation = (confirmed) => {
    setConfirmationOpen(false); // Close the confirmation modal

    if (confirmed) {
      // Perform the save operation
      // ...

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
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedData.id
            ? {
                ...item,
                editable: false,
                email: item.emailOriginal,
                phone: item.phoneOriginal,
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
              email: item.emailOriginal,
              phone: item.phoneOriginal,
            }
          : item
      )
    );
  };

  const handleInputChange = (e, id, key) => {
    const { value } = e.target;
    let isEditable = true;
    if ((key === "email" || key === "phone") && value.length > 25) {
      setErrorMessage("入力は25文字以下である必要があります。");
      isEditable = false;
      return;
    }
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id && (key === "email" || key === "phone")
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
          )}{" "}
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
                      </tr>
                    ))
                  : filteredData.map((item) => (
                      <tr key={item.id}>
                        {columns.map((column) => (
                          <td
                            key={`${item.id}-${column.key}`}
                            className={`px-4 py-2 w-${column.width}`}
                          >
                            {column.key === "actions" ? (
                              item.editable ? (
                                <>
                                  <button
                                    className="px-2 py-1 bg-blue-500 text-white rounded"
                                    onClick={() => handleSaveClick(item.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                    onClick={() => handleCancelClick(item.id)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="px-2 py-1 bg-green-500 text-white rounded"
                                  onClick={() => handleEditClick(item.id)}
                                >
                                  Edit
                                </button>
                              )
                            ) : column.key === "email" ||
                              column.key === "phone" ? (
                              item.editable ? (
                                <TextInput
                                  value={item[column.key]}
                                  onChange={(e) =>
                                    handleInputChange(e, item.id, column.key)
                                  }
                                />
                              ) : (
                                <Text>{item[column.key]}</Text>
                              )
                            ) : (
                              <Text>{item[column.key]}</Text>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </Table>
          </div>
          <Modal
            opened={isConfirmationOpen}
            onClose={() => setConfirmationOpen(false)}
            title="データの保存"
            size="sm"
          >
            <Text>データを保存しますか？</Text>
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
