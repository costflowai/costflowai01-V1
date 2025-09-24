import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function PaintBlog() {
  const post = getBlogPost('paint');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('paint');
  return {
    props: { post }
  };
}
