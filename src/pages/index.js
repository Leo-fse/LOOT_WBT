// src/pages/index.js
import React from "react";
import { Inter } from "next/font/google";
import { Breadcrumbs, Anchor } from "@mantine/core";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Layout />
    </main>
  );
}
