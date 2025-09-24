import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function FlooringBlog() {
  const post = getBlogPost('flooring');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('flooring');
  return {
    props: { post }
  };
}