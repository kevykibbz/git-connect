"use client"
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import {
  useLikePost,
  useUnLikePost,
  useGetCurrentUser,
  useDeleteSavedPost,
  useSavePost,
} from '@/lib/react-query/queries';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Models } from 'appwrite';
import { usePathname } from 'next/navigation';
import Loader from './Loader';
import { useUserContext } from '@/context/AuthContext';

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  refetchPost: () => void; // Function to refetch post data
};

const PostStats = ({ post, userId, refetchPost }: PostStatsProps) => {
  const { toast } = useToast();
  const pathname = usePathname();
  const { isAuthenticated } = useUserContext();


  // Use useMemo to memoize likes and unlikes list
  // Extract likes and unlikes from post arrays
  const likesList = useMemo(() => 
    post.post_liked?.map((like: Models.Document) => like.userId) || [], 
    [post.post_liked]
  );
  
  const unlikesList = useMemo(() => 
    post.post_unliked?.map((unlike: Models.Document) => unlike.userId) || [], 
    [post.post_unliked]
  );

  const [isSaved, setIsSaved] = useState(false);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [unlikes, setUnlikes] = useState<string[]>(unlikesList);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: unlikePost, isPending: isUnliking } = useUnLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost()
  const { data: currentUser } = useGetCurrentUser();

  useEffect(() => {
    // Update likes and unlikes when the post changes
    setLikes(likesList);
    setUnlikes(unlikesList);
  }, [post,likesList,unlikesList]);

  const handleLikePost = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();

    if (!currentUser) {
      toast({ title: 'You must be logged in to like posts.' });
      return;
    }

    if (!likes.includes(userId)) {
      likePost(
        { postId: post.$id, userId: currentUser.$id },
        {
          onSuccess: () => {
            refetchPost(); // Refresh post data after successful like
          },
        }
      );
    }
  };

  const handleUnlikePost = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();

    if (!currentUser) {
      toast({ title: 'You must be logged in to unlike posts.' });
      return;
    }

    if (!unlikes.includes(userId)) {
      unlikePost(
        { postId: post.$id, userId: currentUser.$id },
        {
          onSuccess: () => {
            refetchPost(); // Refresh post data after successful unlike
          },
        }
      );
    }
  };

  // Check if the current post is saved by the user
  const savedPostRecord = currentUser?.saves?.length
    ? currentUser.saves.find(
        (record: Models.Document) => record.post.$id === post.$id
      )
    : null;

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  const handleSavePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    if (!currentUser) {
      toast({ title: "You must be logged in to save posts." });
      return;
    }

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

   // Use pathname to determine styles
   const containerStyles = pathname.startsWith("/profile") ? "w-full" : "";
  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
       <div className="flex gap-2 mr-5">
        {/* Thumbs Up Icon for liking the post */}
        <ThumbUp
        className="tiny-medium sm:text-base"
          style={{
            cursor: isAuthenticated ? 'pointer' : 'not-allowed',
            color: likes.includes(userId) ? '#877eff' : 'gray'
          }}
          onClick={isAuthenticated ? handleLikePost : undefined} // Disable click if not authenticated
        />
        <p className="small-medium lg:base-medium tiny-medium sm:text-base">{likes.length}</p>

        {/* Thumbs Down Icon for unliking the post */}
        <ThumbDown
        className="tiny-medium sm:text-base"
          style={{
            cursor: isAuthenticated ? 'pointer' : 'not-allowed',
            color: unlikes.includes(userId) ? '#877eff' : 'gray'
          }}
          onClick={isAuthenticated ? handleUnlikePost : undefined} // Disable click if not authenticated
        />
        <p className="small-medium lg:base-medium tiny-medium sm:text-base">{unlikes.length}</p>
        {(isLiking || isUnliking) && <Loader />}
      </div>
      <div className="flex gap-2">
        <Image
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer tiny-medium sm:text-base"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  );
};

export default PostStats;
