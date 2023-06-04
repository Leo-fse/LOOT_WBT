import React, { useEffect, useState, useRef } from "react";
import { Table, Text, CloseButton, Skeleton, Checkbox } from "@mantine/core";

const columns = [
  { key: "check", label: "CHECK", width: "1/12", searchable: false },
  { key: "id", label: "ID", width: "1/12", searchable: false },
  { key: "status", label: "Status", width: "1/12", searchable: false },
  { key: "title", label: "Title", width: "2/12", searchable: true },
  { key: "body", label: "Body", width: "2/12", searchable: true },
  { key: "username", label: "Username", width: "1/12", searchable: true },
  { key: "city", label: "City", width: "1/12", searchable: true },
  { key: "email", label: "Email", width: "1/12", searchable: false },
  { key: "phone", label: "Phone", width: "1/12", searchable: false },
];

const getRandomStatus = () => {
  const statuses = ["新規", "更新"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const PlantDiff = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const tableRef = useRef(null);
  const headerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

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
            status: getRandomStatus(),
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

  const handleRowSelect = (row, isSelected) => {
    if (isSelected) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    }
  };

  const handleWriteToDatabase = () => {
    const confirmation = window.confirm(
      "選択したデータを社外用データベースに書き込むことを確認しますか？"
    );

    if (confirmation) {
      // Insert your database writing operation here
      const result = true; // This should be the result of the database operation

      if (result) {
        setNotification({
          message: "選択したデータの書き込みが成功しました",
          type: "success",
        });
        setSelectedRows([]); // Clear selection on successful write
      } else {
        setNotification({
          message: "データの書き込みに失敗しました、再度試してみてください",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-4">プラント情報</h1>
      <p>~ 社外公開 社内DBとの差分データ表示 ~</p>
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
      <div className="pb-2 bg-white flex justify-between">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search"
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded"
          onClick={handleWriteToDatabase}
        >
          データベースへ書き込む
        </button>
      </div>
      <div></div>
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
                    {columns.map((column) => {
                      if (column.key === "check") {
                        return (
                          <td
                            key={column.key}
                            className={`px-4 py-2 w-${column.width}`}
                            colSpan={1}
                          >
                            <Skeleton height={30} />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={column.key}
                          className={`px-4 py-2 w-${column.width}`}
                        >
                          <Skeleton height={30} width="80%" />
                        </td>
                      );
                    })}
                  </tr>
                ))
              : filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`${
                      item.status === "新規" ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {columns.map((column) => {
                      if (column.key === "check") {
                        return (
                          <td key={`${item.id}-${column.key}`}>
                            <input
                              type="checkbox"
                              checked={selectedRows.some(
                                (r) => r.id === item.id
                              )}
                              onChange={(e) =>
                                handleRowSelect(item, e.target.checked)
                              }
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={`${item.id}-${column.key}`}
                          className={`px-4 py-2 w-${column.width}`}
                        >
                          <Text>{item[column.key]}</Text>
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default PlantDiff;