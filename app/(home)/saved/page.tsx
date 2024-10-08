"use client";
import { Models } from "appwrite";
import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import Image from "next/image";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { toast } = useToast();
  const savePosts = currentUser?.saves
    ? currentUser.saves
        .map((savePost: Models.Document) => ({
          ...savePost.post,
          creator: {
            imageUrl: currentUser.imageUrl,
          },
        }))
        .reverse()
    : [];

  // Show toast if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      toast({ title: "You must be logged in to view saved posts." });
    }
  }, [currentUser, toast]);
  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <Image
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <div className="flex justify-center items-center w-full min-h-[300px]">
              {" "}
              {/* Centering container */}
              <p className="text-light-4 tiny-medium sm:text-base">
                No available posts
              </p>
            </div>
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Page;
