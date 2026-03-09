import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

interface Task {
  id: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  assignedName: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: '#1A73E8',
  ACTIVE: '#28a745',
  COMPLETED: '#E0A31C',
  ON_HOLD: '#dc3545',
};

export default function ProjectSchedule() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/api/projects/${projectId}/tasks`);
        setTasks(res.data.data);
      } catch {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  const scheduledTasks = useMemo(
    () => tasks.filter((t) => t.startDate && t.endDate),
    [tasks]
  );

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (scheduledTasks.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 1 };
    let min = new Date(scheduledTasks[0].startDate!);
    let max = new Date(scheduledTasks[0].endDate!);
    scheduledTasks.forEach((t) => {
      const s = new Date(t.startDate!);
      const e = new Date(t.endDate!);
      if (s < min) min = s;
      if (e > max) max = e;
    });
    // Add padding
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 2);
    const days = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)));
    return { minDate: min, maxDate: max, totalDays: days };
  }, [scheduledTasks]);

  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 50;
  const LABEL_WIDTH = 200;
  const DAY_WIDTH = Math.max(30, Math.min(60, 900 / totalDays));
  const CHART_WIDTH = totalDays * DAY_WIDTH;

  const getMonthHeaders = () => {
    const headers: { label: string; x: number; width: number }[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const endClamped = monthEnd > maxDate ? maxDate : monthEnd;
      const startDay = Math.max(0, Math.ceil((monthStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
      const endDay = Math.ceil((endClamped.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      headers.push({
        label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        x: startDay * DAY_WIDTH,
        width: (endDay - startDay + 1) * DAY_WIDTH,
      });
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    return headers;
  };

  const getBar = (task: Task) => {
    const start = new Date(task.startDate!);
    const end = new Date(task.endDate!);
    const startDay = (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      x: startDay * DAY_WIDTH,
      width: duration * DAY_WIDTH,
      color: STATUS_COLORS[task.status] || STATUS_COLORS.PLANNED,
    };
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Project Schedule</h1>
          <p className="page-subtitle">Gantt chart for project #{projectId}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/projects/${projectId}/tasks`)}
          >
            View Tasks
          </button>
          <button
            className="btn"
            style={{ backgroundColor: 'transparent', color: '#5C5C5C', border: '1px solid rgba(0,0,0,0.1)' }}
            onClick={() => navigate('/admin/projects')}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header">
            <h2>Schedule</h2>
          </div>
          <div className="card-body">
            {loading && <p style={{ color: '#5C5C5C' }}>Loading schedule…</p>}

            {error && (
              <div style={styles.alertError}>{error}</div>
            )}

            {!loading && !error && scheduledTasks.length === 0 && (
              <div style={styles.empty}>
                <p>No tasks with dates found. Add start/end dates to tasks to see the schedule.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/admin/projects/${projectId}/tasks`)}
                  style={{ marginTop: '1rem' }}
                >
                  View Tasks
                </button>
              </div>
            )}

            {!loading && scheduledTasks.length > 0 && (
              <>
                {/* Legend */}
                <div style={styles.legend}>
                  {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, backgroundColor: color }} />
                      <span style={{ fontSize: '0.8rem', color: '#5C5C5C' }}>{status.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>

                {/* Gantt Chart */}
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', minWidth: LABEL_WIDTH + CHART_WIDTH }}>
                    {/* Labels column */}
                    <div style={{ width: LABEL_WIDTH, flexShrink: 0 }}>
                      <div style={{ height: HEADER_HEIGHT, borderBottom: '2px solid #E5E5E5', display: 'flex', alignItems: 'flex-end', padding: '0 8px 8px', fontWeight: 600, fontSize: '0.8rem', color: '#5C5C5C' }}>
                        Task
                      </div>
                      {scheduledTasks.map((task) => (
                        <div key={task.id} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', fontWeight: 500, borderBottom: '1px solid #F0F0F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <svg
                        width={CHART_WIDTH}
                        height={HEADER_HEIGHT + scheduledTasks.length * ROW_HEIGHT}
                        style={{ display: 'block' }}
                      >
                        {/* Month headers */}
                        {getMonthHeaders().map((h, i) => (
                          <g key={i}>
                            <rect x={h.x} y={0} width={h.width} height={HEADER_HEIGHT} fill={i % 2 === 0 ? '#FAFAFA' : '#F5F5F5'} />
                            <text x={h.x + h.width / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600" fill="#333">
                              {h.label}
                            </text>
                          </g>
                        ))}
                        <line x1={0} y1={HEADER_HEIGHT} x2={CHART_WIDTH} y2={HEADER_HEIGHT} stroke="#E5E5E5" strokeWidth="2" />

                        {/* Row backgrounds */}
                        {scheduledTasks.map((_, i) => (
                          <rect key={i} x={0} y={HEADER_HEIGHT + i * ROW_HEIGHT} width={CHART_WIDTH} height={ROW_HEIGHT} fill={i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'} />
                        ))}

                        {/* Today line */}
                        {(() => {
                          const today = new Date();
                          if (today >= minDate && today <= maxDate) {
                            const todayX = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
                            return (
                              <line x1={todayX} y1={HEADER_HEIGHT} x2={todayX} y2={HEADER_HEIGHT + scheduledTasks.length * ROW_HEIGHT} stroke="#E0A31C" strokeWidth="2" strokeDasharray="4,4" />
                            );
                          }
                          return null;
                        })()}

                        {/* Task bars */}
                        {scheduledTasks.map((task, i) => {
                          const bar = getBar(task);
                          const barY = HEADER_HEIGHT + i * ROW_HEIGHT + 8;
                          const barHeight = ROW_HEIGHT - 16;
                          return (
                            <g key={task.id}>
                              <rect
                                x={bar.x}
                                y={barY}
                                width={bar.width}
                                height={barHeight}
                                rx={4}
                                ry={4}
                                fill={bar.color}
                                opacity={0.85}
                              />
                              {bar.width > 80 && (
                                <text
                                  x={bar.x + bar.width / 2}
                                  y={barY + barHeight / 2 + 4}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill="#FFF"
                                  fontWeight="500"
                                >
                                  {formatDate(task.startDate!)} – {formatDate(task.endDate!)}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  alertError: {
    padding: '12px 16px',
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    color: '#c9302c',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '1px solid rgba(217, 83, 79, 0.2)',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#5C5C5C',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
};
