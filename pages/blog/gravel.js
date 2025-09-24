import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function GravelBlog() {
  const post = getBlogPost('gravel');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('gravel');
  return {
    props: { post }
  };
}