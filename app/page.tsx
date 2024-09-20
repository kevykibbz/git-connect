import Image from "next/image";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";

export default function Home() {
  return (
    <div className="w-full md:flex">
      {/* <Topbar /> */}
      {/* <LeftSidebar /> */}
      <section className="flex flex-1 h-full">
        hello world
      </section>
      {/* <Bottombar /> */}
    </div>
  );
}
