import { getBlogPost } from '../../data/blogPosts';
import BlogPostLayout from '../../components/BlogPostLayout';

export default function ExcavationBlog() {
  const post = getBlogPost('excavation');
  return <BlogPostLayout post={post} />;
}

export async function getStaticProps() {
  const post = getBlogPost('excavation');
  return {
    props: { post }
  };
}

