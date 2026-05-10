// src/pages/GenerateProject.jsx — Phase 1 placeholder.

import { useParams } from 'react-router-dom';

function GenerateProject() {
  const { id } = useParams();
  return (
    <div>
      <h1>Generate Project placeholder</h1>
      <p>Step id: {id}</p>
    </div>
  );
}

export default GenerateProject;