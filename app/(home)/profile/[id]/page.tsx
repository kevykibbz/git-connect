"use client";
import { Button } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import { useGetCurrentUser, useGetUserById } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import GithubDrawer from "@/components/shared/GithubDrawer";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Page = () => {
  const pathname = usePathname();
  const id: string = pathname.split("/").pop() ?? "";
  const { user } = useUserContext();
  const { data: currentLoggedInUser } = useGetCurrentUser();
  const { data: currentUser } = useGetUserById(id || "");
  const { toast } = useToast();
  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const followDeveloper = (): void => {
    if (!currentLoggedInUser) {
      toast({ title: `You must be logged in to follow ${currentUser.name}.` });
      return;
    }
  };


  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <Image
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            width={28}
            height={28}
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock value={20} label="Followers" />
              <StatBlock value={20} label="Following" />
            </div>

            <p className="capitalize small-medium md:base-medium text-center xl:text-left mt-5 max-w-screen-sm">
              Education:{currentUser.education}
            </p>
            <hr className="border-t border-gray-300 mt-2" />
            <p className="small-medium md:base-medium text-center xl:text-left mt-5 max-w-screen-sm line-clamp-5">
              Work Experience:{currentUser.work_experience}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div
              className={`${
                user.id !== currentUser.$id && "hidden"
              } flex space-x-4`}
            >
              <Link
                href={`/update-profile/${currentUser.$id}`}
                className="h-12 bg-dark-4 px-5 text-light-1 flex items-center gap-2 rounded-full"
              >
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="whitespace-nowrap text-sm">Edit Profile</p>
              </Link>

              <GithubDrawer userId={id}/>
            </div>

            <div className={`${user.id === id && "hidden"}`}>
              <Button
                type="button"
                className="shad-button_primary px-8 rounded-full"
                onClick={() => followDeveloper()}
              >
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            href={`/profile/${id}`}
            className={`profile-tab rounded-l-full ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}
          >
            <Image
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            href={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-full ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}
          >
            <Image
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <GridPostList posts={currentUser.posts} showUser={false} />
    </div>
  );
};

export default Page;
