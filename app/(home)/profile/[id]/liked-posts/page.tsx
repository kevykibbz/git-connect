"use client";

import LikedPosts from "@/components/shared/LikedPosts";
import { useGetUserById } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";

const Page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div>
      <h1>{currentUser.name}&apos;s Liked Posts</h1>
      <LikedPosts />
    </div>
  );
};

export default Page;
