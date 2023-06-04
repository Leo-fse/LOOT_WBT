import React, { useEffect, useState, useRef } from "react";
import { Table, Text, TextInput, CloseButton, Skeleton } from "@mantine/core";

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

  useEffect(() => {
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
          const correspondingUser = users.find(
            (user) => user.id === post.userId
          );
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

  const handleSaveClick = async (id) => {
    const editedItem = data.find((item) => item.id === id);
    const postBody = {
      id: editedItem.id,
      email: editedItem.email,
      phone: editedItem.phone,
    };
    console.log(postBody);

    try {
      const response = await fetch("https://api.example.com/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postBody),
      });

      if (response.ok) {
        // POSTリクエストが成功した場合の処理
        console.log("データの更新が成功しました。");
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, editable: false } : item
          )
        );
        setNotification({
          type: "success",
          message: "データの更新が完了しました。",
        });
        setTimeout(() => {
          setNotification(null);
        }, 3000); // 5秒後に通知を閉じる
        // 必要に応じてデータの再取得などの処理を追加することができます。
      } else {
        // POSTリクエストが失敗した場合の処理
        setNotification({
          type: "error",
          message: `データの更新に失敗しました。${postBody[id]}`,
        });
        console.log("データの更新に失敗しました。", postBody[id]);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setNotification({
        type: "error",
        message: `エラーが発生しました`,
      });
    } finally {
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
          <CloseButton size="xl" iconSize={20} onClick={closeNotification} />
        </div>
      )}
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}{" "}
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
                <th key={column.key} className={`px-4 py-2 w-${column.width}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableRef}>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: columns.length }).map((_, i) => (
                      <td key={i} colSpan={1}>
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
                        ) : column.key === "email" || column.key === "phone" ? (
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
    </div>
  );
};

export default PlantInfo;
