import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await axios.get(`http://localhost:5000/api/posts`);
      // ค้นหาบทความที่ ID ตรงกับ URL
      const foundPost = res.data.find(p => p._id === id);
      setPost(foundPost);
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="p-10">กำลังโหลด...</div>;

  return (
    <div className="max-w-2xl mx-auto p-10 font-serif">
      <Link to="/" className="text-gray-400 hover:text-black mb-8 inline-block">← ย้อนกลับ</Link>
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </div>
  );
}

export default PostDetail;