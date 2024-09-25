"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import { useGetGithubRepos } from "@/lib/react-query/queries";
import Link from "next/link";
import { Loader } from "@/components/shared";
import { Repository } from "@/types";

// Define a Repository type with the required fields

const GithubDrawer = ({ userId }: { userId: string }) => {
  const [open, setOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URL}&state=${userId}`;

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const accessToken = url.searchParams.get("access_token");

    if (accessToken) {
      window.close();
    }
  }, []);

  const openGitHubPopup = () => {
    const width = 600;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      githubAuthUrl,
      "GitHubAuth",
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
    );
  };

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={openGitHubPopup}
          className="h-12 bg-dark-4 px-5 text-light-1 flex items-center gap-2 rounded-full"
        >
          <Image
            src="/assets/images/branch.png"
            alt="settings"
            width={20}
            height={20}
          />
          <p className="whitespace-nowrap text-sm">Get github Repos</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>GitHub Repositories</DialogTitle>
          <DialogDescription>
            Here is a list of all GitHub repositories retrieved.
          </DialogDescription>
        </DialogHeader>
        <RepoForm />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="h-12 bg-dark-4 px-5 text-light-1 flex items-center gap-2 rounded-full">
          <Image
            src="/assets/images/branch.png"
            alt="settings"
            width={20}
            height={20}
          />
          <p className="whitespace-nowrap text-sm">Get github Repos</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>GitHub Repositories</DrawerTitle>
          <DrawerDescription className="tiny-medium sm:text-base">
            Here is a list of all GitHub repositories retrieved.
          </DrawerDescription>
        </DrawerHeader>
        <RepoForm />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

function RepoForm() {
  const [page, setPage] = React.useState(1);
  const limit = 4; // Number of repositories per page

  const {
    data: repositories,
    isPending: isReposLoading,
    isError: isReposError,
  } = useGetGithubRepos(page, limit);

  return (
    <>
      <div className="mt-4">
        <h3 className="tiny-medium sm:text-base px-4">Your Repositories:</h3>

        {isReposLoading ? (
          <div className="p-4 m-4">
            <Loader />
          </div>
        ) : (
          <>
            <ul className="list-disc space-y-2 text-gray-500">
              {isReposError || !Array.isArray(repositories) || repositories.length === 0 ? (
                <li className="text-center mt-2 tiny-medium sm:text-base">No repositories found.</li>
              ) : (
                repositories.map((repo: Repository, idx: number) => (
                  <li key={repo.id} className="capitalize tiny-medium sm:text-base">
                    <Link
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${(page - 1) * limit + (idx + 1)}.`} {repo.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-4 mb-2 flex px-2 py-2 justify-between">
              <button
                className="px-4 py-2 border rounded-full mx-2 tiny-medium sm:text-base"
                disabled={page === 1}
                onClick={() => setPage((prev: number) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border rounded-full mx-2 tiny-medium sm:text-base"
                onClick={() => setPage((prev: number) => prev + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GithubDrawer;
