import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accélérez votre croissance vers Plus | ZedCheckout",
  description: "Optimisez votre checkout  pendant votre phase de croissance. Solution bridge pour préparer votre passage à Plus. +20% conversions validées.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
