"use client";

import CommentForm from "@/components/forms/CommentForm";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Models } from "appwrite";
import { useGetRecentComments } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui";
import Image from "next/image";


const getInitials = (name: string) => {
  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  } else {
    return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
  }
};

const Page = () => {
  const pathname = usePathname();
  const postId = pathname.split("/")[2] || "";
  const router=useRouter()

  if (!postId) {
    return <div>Error: Post ID not found.</div>;
  }

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isErrorComments,
  } = useGetRecentComments(postId);

  // Handling loading state
  if (isCommentsLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="flex items-center flex-row justify-center gap-2">
          <Loader /> Loading...
        </div>
      </div>
    );
  }

  // Handling error state
  if (isErrorComments) {
    return <div>Error loading comments</div>;
  }

  // Extract documents (comments) if available
  const commentList = comments?.documents || [];

  
  return (
    <div className="flex flex-col w-full min-h-screen">
       <div className="mt-2 hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="shad-button_ghost"
        >
          <Image
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto max-h-[98vh] px-4">
        <h2 className="mt-2 ml-3">{commentList.length.toLocaleString()} Comments</h2>

        {/* Handling case where no comments are available */}
        {commentList.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4 mt-2">
            {commentList.map((comment: Models.Document) => (
              <Card
                key={comment.$id}
                className="flex items-start px-4 py-2 shadow mx-4 mb-4"
              >
                <Avatar className="mr-4">
                  <AvatarImage
                    src={comment.user.imageUrl}
                    alt={comment.user.name}
                  />
                  <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{comment.user.name}</h3>{" "}
                  {/* Assuming userId is displayed here */}
                  <p>{comment.comment}</p>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full shadow-md mb-4 md:mb-3 gap-2 px-4 py-2">
        <CommentForm postId={postId} />
      </div>
    </div>
  );
};

export default Page;
