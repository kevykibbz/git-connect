"use client";
import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommentForm from "@/components/forms/CommentForm";
import { IUComment } from "@/types";

const Page = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const pathname = usePathname();
  const id: string = pathname.split("/").pop() ?? "";
  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    router.back();
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
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

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <Image
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
            width={417}
            height={320}
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                href={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                <Image
                  width={32}
                  height={32}
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  href={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}
                >
                  <Image
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}
                >
                  <Image
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats
                post={post}
                userId={user.id}
                refetchPost={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <div className="mt-2">
                {post.comments && post.comments.length > 0 && (
                  <>
                    <h2>{post.comments.length.toLocaleString()} comments</h2>
                    <ul className="mt-2 list-disc space-y-2 text-gray-500">
                      {post.comments.slice(0, 2).map((comment: IUComment) => (
                        <li key={comment.$id} className="flex justify-between">
                          <p className="line-clamp-2">{comment.comment}</p>
                          <p className="text-sm font-bold">
                            &middot; {multiFormatDateString(comment.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="flex mt-3 justify-end ">
                      <Link
                        href={`/posts/${post.$id}/comments`}
                        className=" text-blue-500 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                  </>
                )}
                <CommentForm postId={post.$id} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default Page;
