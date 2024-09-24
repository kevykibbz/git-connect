import { LikeEntry } from "@/types";

export function checkIsLiked(likes: LikeEntry[], userId: string): boolean {
  return likes.some((like) => like.userId === userId && like.status === "like");
}
