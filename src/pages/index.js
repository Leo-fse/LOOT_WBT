// src/pages/index.js
import React from "react";
import { Inter } from "next/font/google";
import { Breadcrumbs, Anchor } from "@mantine/core";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return <Layout />;
}
