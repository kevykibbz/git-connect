"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Textarea,
} from "../ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CommentsValidation } from "@/lib/validation";
import { useCreateComment } from "@/lib/react-query/queries";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "../shared";
import { useUserContext } from "@/context/AuthContext";

const CommentForm = ({postId}:{postId:string}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user,isAuthenticated } = useUserContext();

  // Function to handle input click
  const handleInputClick = () => {
    setIsDialogOpen(true);
  };

  // Detect screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Set mobile or desktop based on media query
    const handleScreenChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Initial screen size check
    setIsMobile(mediaQuery.matches);

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleScreenChange);

    // Cleanup event listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  const form = useForm<z.infer<typeof CommentsValidation>>({
    resolver: zodResolver(CommentsValidation),
    defaultValues: {
      comment: "",
    },
  });

  //query
  const {
    mutateAsync: createComment,
    isPending: isLoadingCreatingComment,
  } = useCreateComment();

  // Handler
  const handleSubmit = async (value: z.infer<typeof CommentsValidation>) => {
    try {
      await createComment({
        ...value,
        userId: user.id,
        postId:postId,
      });
      toast({ title: "Comment posted successfully." });

      setIsDialogOpen(false);
      form.reset(); 
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast({ title: "Failed to create comment. Please try again" });
    }
  };

  return (
    <>
      {/* Input for entering comments */}
      <div className="mt-4">
        <Input
          type="text"
          placeholder="Add a comment..."
          className="w-full"
          disabled={!isAuthenticated}
          onClick={handleInputClick} // Open dialog or drawer on click
        />
      </div>

      {/* Dialog for desktop screens */}
      {!isMobile && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="tiny-medium sm:text-base">Add Comment</DialogTitle>
              <DialogDescription className="tiny-medium sm:text-base">
                You can write and submit a comment below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
              >
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormControl>
                        <Textarea
                          placeholder="Enter your comment"
                          className="w-full tiny-medium sm:text-base"
                          disabled={!isAuthenticated}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-2 text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="mt-4 tiny-medium sm:text-base shad-button_primary px-5 text-light-1 flex items-center gap-2 rounded-full"
                  disabled={isLoadingCreatingComment} 
                >
                  {isLoadingCreatingComment ? <div className="flex items-center justify-center gap-2"><Loader/> Submitting...</div> : "Submit"}{" "}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Drawer for mobile screens */}
      {isMobile && (
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="tiny-medium sm:text-base">Add Comment</DrawerTitle>
              <DrawerDescription className="tiny-medium sm:text-base">
                You can write and submit a comment below.
              </DrawerDescription>
            </DrawerHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
              >
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormControl>
                        <Textarea
                          placeholder="Enter your comment"
                          className="w-full tiny-medium sm:text-base"
                          disabled={!isAuthenticated}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-2 text-red-500" />
                    </FormItem>
                  )}
                />
                <DrawerFooter className="pt-4 flex items-center gap-4 flex-row justify-between w-full">
                  <DrawerClose asChild>
                    <Button
                      className="bg-gray-500 tiny-medium sm:text-base text-white flex-grow whitespace-nowrap rounded-l-full"
                      onClick={() => setIsDialogOpen(false)} // Close only when clicking "Close"
                    >
                      Close
                    </Button>
                  </DrawerClose>
                  <Button
                  type="submit"
                  className="shad-button_primary tiny-medium sm:text-base flex-grow whitespace-nowrap rounded-r-full"
                  disabled={isLoadingCreatingComment} 
                >
                  {isLoadingCreatingComment ? <div className="flex items-center justify-center gap-2"><Loader/> Submitting...</div> : "Submit"}{" "}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default CommentForm;
