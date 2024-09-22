import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import Link from "next/link";
import Image from "next/image";
import { multiFormatDateString } from "@/lib/utils";
import PostStats from "./PostStats";
type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user, isAuthenticated } = useUserContext(); // Get user and auth status from context

  if (!post.creator) return null;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.creator.$id}`}>
            <Image
              width={12}
              height={12}
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        {/* Only show edit button if the user is logged in and is the post creator */}
        {isAuthenticated && user.id === post.creator.$id && (
          <Link href={`/update-post/${post.$id}`}>
            <Image
              src={"/assets/icons/edit.svg"}
              alt="edit"
              width={20}
              height={20}
            />
          </Link>
        )}
      </div>

      <Link href={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          {post.tags && post.tags.length > 0 && (
            <ul className="flex gap-1 mt-2">
              {post.tags.map((tag: string, index: number) => (
                <li
                  key={`${tag}${index}`}
                  className="text-light-3 small-regular"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        {post.imageUrl && (
          <Image
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="post-card_img"
            width={582}
            height={450}
          />
        )}
      </Link>

      <PostStats post={post} userId={user?.id || ""} />
    </div>
  );
};

export default PostCard;
