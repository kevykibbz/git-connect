"use client";
import Image from "next/image";
import React from "react";

interface AuthProps {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: AuthProps) {
  
  return (
    <>
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        {children}
      </section>
      <Image
        src="/assets/images/side-img.svg"
        alt="logo"
        width={785}
        height={976}
        className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
      />
    </>
  );
}
