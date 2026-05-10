// src/pages/StepDetail.jsx — Phase 1 placeholder.

import { useParams } from 'react-router-dom';

function StepDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1>Step Detail</h1>
      <p>Step id: {id}</p>
    </div>
  );
}

export default StepDetail;