import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function InsulationBlog() {
  const post = getBlogPost('insulation');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('insulation');
  return {
    props: { post }
  };
}
