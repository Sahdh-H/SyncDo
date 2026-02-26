import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, RefreshCcw, Trash2, Check, Calendar, Clock, Smile } from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ token, setToken }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'medium' });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'history'

    const api = axios.create({
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks/');
            setTasks(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/tasks/', newTask);
            setTasks([res.data, ...tasks]);
            setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
            setIsAdding(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const res = await api.put(`/tasks/${task.id}`, { is_completed: !task.is_completed });
            setTasks(tasks.map(t => t.id === task.id ? res.data : t));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <div className="container">
            <header className="dashboard-header">
                <div>
                    <h1 className="logo-text">SyncDo</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Hello! Let's get things done.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchTasks} className="icon-btn" title="Refresh">
                        <RefreshCcw size={20} />
                    </button>
                    <button onClick={logout} className="icon-btn" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-value">{tasks.filter(t => !t.is_completed).length}</p>
                    <p className="stat-label">To Do</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value" style={{ color: '#10b981' }}>{tasks.filter(t => t.is_completed).length}</p>
                    <p className="stat-label">Finished</p>
                </div>
            </div>

            <main>
                <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: '#f1f5f9', padding: '5px', borderRadius: '15px' }}>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: '0.3s', background: activeTab === 'tasks' ? 'white' : 'transparent', color: activeTab === 'tasks' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'tasks' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Active Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: '0.3s', background: activeTab === 'history' ? 'white' : 'transparent', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'history' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        History
                    </button>
                </div>

                {activeTab === 'tasks' && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="btn btn-primary"
                        style={{ marginBottom: '2rem' }}
                    >
                        {isAdding ? 'Close Form' : 'Add a New Task'}
                        <Plus size={24} />
                    </button>
                )}

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="card"
                            style={{ marginBottom: '2rem' }}
                        >
                            <form onSubmit={handleCreateTask}>
                                <div className="input-group">
                                    <label className="input-label">What do you need to do?</label>
                                    <input
                                        required
                                        placeholder="e.g. Buy groceries"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Any details? (Optional)</label>
                                    <textarea
                                        placeholder="Add some notes here..."
                                        style={{ minHeight: '80px' }}
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">When is it due?</label>
                                    <input
                                        type="datetime-local"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">How important is it?</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Normal</option>
                                        <option value="medium">Important</option>
                                        <option value="high">Urgent!</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Save Task
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="task-list">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div className="pulsating">Loading your tasks...</div>
                        </div>
                    ) : (tasks.filter(t => activeTab === 'history' ? t.is_completed : !t.is_completed)).length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Smile size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                            <p style={{ color: '#64748b', fontWeight: 600 }}>
                                {activeTab === 'history' ? "No completed tasks yet. Go finish some!" : "No tasks yet! Click the button above to start."}
                            </p>
                        </div>
                    ) : (
                        tasks
                            .filter(t => activeTab === 'history' ? t.is_completed : !t.is_completed)
                            .map(task => (
                                <motion.div
                                    layout
                                    key={task.id}
                                    className="task-item"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div
                                        className={`checkbox ${task.is_completed ? 'done' : ''}`}
                                        onClick={() => handleToggleComplete(task)}
                                    >
                                        {task.is_completed && <Check size={18} />}
                                    </div>

                                    <div className="task-info">
                                        <p className={`task-title ${task.is_completed ? 'done' : ''}`}>
                                            {task.title}
                                        </p>
                                        <div className="task-meta">
                                            {task.due_date && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            )}
                                            <span className="priority-badge" style={{
                                                backgroundColor: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#f1f5f9',
                                                color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#d97706' : '#64748b'
                                            }}>
                                                {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Important' : 'Normal'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                                        className="delete-hover"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
