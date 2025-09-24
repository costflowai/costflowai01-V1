import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function FramingBlog() {
  const post = getBlogPost('framing');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('framing');
  return {
    props: { post }
  };
}