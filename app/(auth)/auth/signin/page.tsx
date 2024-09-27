"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SigninValidation } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useEffect } from "react";
import Image from "next/image";

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    checkAuthUser,
    isLoading: isUserLoading,
    isAuthenticated,
  } = useUserContext();
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Queries
  const { mutateAsync: signInAccount, isPending: isSigningInUser } =
    useSignInAccount();

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(user);
      if (!session) {
        toast({
          title: "Login failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Wait briefly for session propagation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        router.replace("/");
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      } else {
        toast({
          title: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  // Redirect authenticated user to homepage
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);
  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <Image
          src="/assets/icons/logo.svg"
          alt="logo"
          width={420}
          height={88.41}
          className="w-full h-auto object-cover"
        />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Log in to your account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details.
        </p>
        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="shad-button_primary rounded-full hover:bg-primary-600 transition duration-300 ease-in-out flex items-center justify-center"
            disabled={isSigningInUser || isUserLoading}
          >
            {isSigningInUser || isUserLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-t-2 border-gray-200 border-t-blue-500 h-4 w-4 mr-2"></div>
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don&apos;t have an account?
            <Link
              href="/auth/signup"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default Page;
