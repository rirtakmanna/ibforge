// src/pages/LinkedInPosts.jsx — Phase 1 placeholder.

import { useParams } from 'react-router-dom';

function LinkedInPosts() {
  const { id } = useParams();
  return (
    <div>
      <h1>LinkedIn Posts placeholder</h1>
      <p>Step id: {id}</p>
    </div>
  );
}

export default LinkedInPosts;