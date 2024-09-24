export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  education: string;
  work_experience: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  education: string;
  work_experience: string;
};

export type INewUser = {
  name: string;
  email: string;
  username?: string;
  password: string;
};

export type IAuthUser = {
  email: string;
  password: string;
};

export type Repository={
  id: number;
  name: string;
  html_url: string;
}


export type IUComment={
  $id?: string;
  userId: string;
  postId: string;
  comment: string;
  createdAt?:string
}