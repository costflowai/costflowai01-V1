import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function AsphaltBlog() {
  const post = getBlogPost('asphalt');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('asphalt');
  return {
    props: { post }
  };
}