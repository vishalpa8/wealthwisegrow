"use client";
import React from "react";

export function FooterYear() {
  const [year, setYear] = React.useState("");
  React.useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  return <>{year}</>;
} 