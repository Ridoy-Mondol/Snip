import { UserProps } from "./UserProps";
export type BlogProps = {
    id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;  // The imageUrl could be null if no image is uploaded
  createdAt: Date;
  author: UserProps; // Assuming UserProps is the user data type
  authorId: string;
  };
  
  export type NewBlogProps = {
    token: UserProps; // The user creating the blog, based on the current authentication token
    handleSubmit?: () => void; // Optional callback for submission (can be used to refresh or update the UI)
  };
  