import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function RebarBlog() {
  const post = getBlogPost('rebar');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('rebar');
  return {
    props: { post }
  };
}
