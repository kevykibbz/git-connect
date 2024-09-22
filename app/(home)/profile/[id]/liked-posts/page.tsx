"use client";

import LikedPosts from "@/components/shared/LikedPosts";
import { useGetUserById } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";

const LikedPostsPage = ({ params }: { params: { id: string } }) => {
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
      <h1>{currentUser.name}'s Liked Posts</h1>
      <LikedPosts />
    </div>
  );
};

export default LikedPostsPage;
