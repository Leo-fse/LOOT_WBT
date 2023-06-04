// src/pages/index.js
import React from "react";
import { Inter } from "next/font/google";
import PlantInfo from "@/components/PlantInfo";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return <PlantInfo />;
}
