import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function FenceBlog() {
  const post = getBlogPost('fence');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('fence');
  return {
    props: { post }
  };
}
