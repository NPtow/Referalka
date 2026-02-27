"use client";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none disabled:opacity-50";

const variants = {
  primary: "bg-[#1863e5] text-white hover:bg-[#2141c6] active:scale-[0.98]",
  outline: "border border-[#1863e5] text-[#1863e5] hover:bg-blue-50",
  ghost: "text-[#4A5568] hover:bg-gray-100",
};

const sizes = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}
