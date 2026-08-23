import { BlogEditorStudio } from "@/components/admin/BlogEditorStudio";
import { createBlogPostAction } from "../actions";

export default function AdminNewBlogPage() {
  return <BlogEditorStudio onSubmitAction={createBlogPostAction} />;
}
