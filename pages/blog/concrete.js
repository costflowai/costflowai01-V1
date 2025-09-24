import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function ConcreteBlog() {
  const post = getBlogPost('concrete');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('concrete');
  return {
    props: { post }
  };
}