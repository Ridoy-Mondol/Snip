import { UserProps } from "./UserProps";
export type BlogProps = {
    id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null; 
  createdAt: Date;
  author: UserProps;
  authorId: string;
  };
  
  export type NewBlogProps = {
    token: UserProps;
    handleSubmit?: () => void;
  };
  