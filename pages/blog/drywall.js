import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function DrywallBlog() {
  const post = getBlogPost('drywall');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('drywall');
  return {
    props: { post }
  };
}
