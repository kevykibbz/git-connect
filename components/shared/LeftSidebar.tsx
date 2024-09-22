"use client";
import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, setIsAuthenticated, isLoading, isAuthenticated } =
    useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    router.push("/auth/signin");
  };

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
      <Link href="/" className="flex gap-3 items-center">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={200}
            height={36}
          />
        </Link>

        {isAuthenticated ? (
          isLoading ? (
            <div className="h-14">
              <Loader />
            </div>
          ) : (
            <Link
              href={`/profile/${user.id}`}
              className="flex gap-3 items-center"
            >
              <Image
                width={14}
                height={14}
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="h-14 w-14 rounded-full"
              />
              <div className="flex flex-col">
                <p className="body-bold">{user.name}</p>
                <p className="small-regular text-light-3">@{user.username}</p>
              </div>
            </Link>
          )
        ) : (
          <div className="flex gap-3 items-center">
            <Image
              width={14}
              height={14}
              src="/assets/icons/profile-placeholder.svg" // Fallback image
              alt="fallback profile"
              className="h-14 w-14 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold">Guest User</p>
              <p className="small-regular text-light-3">@guest</p>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            const isCreatePost = link.route === "/create-post";

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group rounded-full ${
                  isActive ? "bg-primary-500" : ""
                }`}
              >
                <Link
                  href={isAuthenticated || !isCreatePost ? link.route : "#"}
                  className={`flex gap-4 items-center p-4 rounded-full transition-all duration-300
                    ${isActive ? "bg-primary-500 text-white" : ""}
                    ${
                      !isAuthenticated && isCreatePost
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : ""
                    }
                    group-hover:bg-primary-500 group-hover:text-white`}
                >
                  <Image
                    src={link.imgURL}
                    alt={link.label}
                    width={24}
                    height={24}
                    className={`group-hover:invert-white ${
                      isActive ? "invert-white" : ""
                    }`}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {isAuthenticated ? (
        <Button
          variant="ghost"
          className="mt-4 shad-button_ghost"
          onClick={(e) => handleSignOut(e)}
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logout"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Logout</p>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="mt-4 shad-button_ghost"
          onClick={() => router.push("/auth/signin")}
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logout"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Login</p>
        </Button>
      )}
    </nav>
  );
};

export default LeftSidebar;
