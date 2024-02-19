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

export type ReviewData = {
  content: string;
  positive: boolean;
  itemId: number;
  posterId: number;
};
