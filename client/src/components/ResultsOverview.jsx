import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function ResultsOverview({ path = '/api/student/results' }) {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) {
          setResults(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    load();
    return () => (mounted = false);
  }, [path]);

  if (loading) return <div className="loader">Loading results...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="card results-container">
      <h3>Exam Results</h3>
      {results.length === 0 ? (
        <p className="no-data">No exam results published yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="results-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Marks Obtained</th>
                <th>Remarks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const percent = Math.round((r.score / r.totalMarks) * 100);
                let grade = 'F';
                let gradeClass = 'grade-f';
                if (percent >= 90) { grade = 'A+'; gradeClass = 'grade-a'; }
                else if (percent >= 80) { grade = 'A'; gradeClass = 'grade-a'; }
                else if (percent >= 70) { grade = 'B'; gradeClass = 'grade-b'; }
                else if (percent >= 60) { grade = 'C'; gradeClass = 'grade-c'; }
                else if (percent >= 50) { grade = 'D'; gradeClass = 'grade-d'; }

                return (
                  <tr key={r._id}>
                    <td>
                      <div className="subject-name">{r.class?.name || 'N/A'}</div>
                      <div className="subject-code">{r.class?.code || ''}</div>
                    </td>
                    <td>{r.examType}</td>
                    <td>
                      <strong className="obtained-marks">{r.score}</strong> / <span className="total-marks">{r.totalMarks}</span>
                    </td>
                    <td>{r.remarks || '—'}</td>
                    <td>
                      <span className={`grade-badge ${gradeClass}`}>{grade} ({percent}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
