export type PostData = {
  content: string;
  createdAt: Date;
  posterId: number;
};

export type Like = {
  creatorId: number;
  postId: string;
};

export type LikablePost = {
  id: string;
  likes: {
    creatorId: number;
  }[];
};
