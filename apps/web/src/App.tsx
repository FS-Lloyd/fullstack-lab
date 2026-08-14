import { useState } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main id="center">
      <h1>Tasks</h1>

      <section className="panel">
        <h2>Create Task</h2>
        <TaskForm onCreated={() => setRefreshKey((key) => key + 1)} />
      </section>

      <section className="panel">
        <h2>All Tasks</h2>
        <TaskList refreshKey={refreshKey} />
      </section>
    </main>
  );
}

export default App;
