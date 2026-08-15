"use client";
import { useState, useEffect } from "react";

export function FooterYear() {
  const [year, setYear] = useState("");
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  return <>{year}</>;
}