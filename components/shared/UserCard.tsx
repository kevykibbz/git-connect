"use client"

import { Models } from "appwrite";

import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link href={`/profile/${user.$id}`} className="user-card">
      <Image
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        width={14}
        height={14}
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button type="button" size="sm" className="shad-button_primary px-5 rounded-full">
        Follow
      </Button>
    </Link>
  );
};

export default UserCard;
