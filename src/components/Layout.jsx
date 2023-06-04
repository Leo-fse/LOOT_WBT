// src/components/Layout.js
import React from "react";
import { Breadcrumbs, Anchor } from "@mantine/core";

const Layout = ({ children }) => {
  const items = [
    { title: "PlantID", href: "/PlantInfo" },
    { title: "Plant", href: "/PlantPulilc" },
    { title: "GTB", href: "/GTB" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <div>
      <Breadcrumbs separator="|" mt="xs">
        {items}
      </Breadcrumbs>
      {children}
    </div>
  );
};

export default Layout;
