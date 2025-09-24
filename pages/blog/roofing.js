import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function RoofingBlog() {
  const post = getBlogPost('roofing');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('roofing');
  return {
    props: { post }
  };
}