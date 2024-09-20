"use client"
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function Home() {
  return (
    <div className="w-full md:flex">
        <AuthProvider>
          {/* <Topbar /> */}
          {/* <LeftSidebar /> */}
          <section className="flex flex-1 h-full">hello world</section>
          {/* <Bottombar /> */}
        </AuthProvider>
    </div>
  );
}
