// Simple Gantt sample with 10 demo tasks
// No external libs. Designed to be embedded as a Power Apps Code component (or opened standalone).

const ganttEl = document.getElementById('gantt');
const tooltip = document.getElementById('tooltip');

// Config
const cellWidth = 40; // px per day
const rowHeight = 40; // matches CSS

// Create demo data: 10 tasks over a 30-day window
const today = startOfDay(new Date());
const startDate = addDays(today, -5);
const endDate = addDays(today, 25);

// tasks can be overridden by host (Power Apps) via postMessage; use let so we can replace
let tasks = createDemoTasks(10, startDate);

// Messaging: communicate with host (Power Apps) via postMessage.
function sendToHost(msg) {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
  } catch (e) {
    console.warn('postMessage failed', e);
  }
}

// Receive properties from host
function receiveProps(props) {
  if (!props) return;
  if (props.tasks) {
    try {
      // accept tasks as array with ISO date strings
      tasks = props.tasks.map(t => ({
        id: t.id,
        title: t.title,
        owner: t.owner,
        start: new Date(t.start),
        end: new Date(t.end),
        percent: t.percent || 0,
      }));
    } catch (e) {
      console.warn('invalid tasks payload', e);
    }
  }
  // rerender with possibly new props
  renderGantt();
}

// Listen for messages from host
window.addEventListener('message', (ev) => {
  const data = ev.data;
  if (!data || typeof data !== 'object') return;
  if (data.type === 'props' || data.type === 'init') {
    receiveProps(data.props || data);
  } else if (data.type === 'setTasks') {
    receiveProps({ tasks: data.tasks });
  }
});

// notify host we are ready and render initial demo data
renderGantt();
sendToHost({ type: 'ready' });

function createDemoTasks(n, base) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const s = addDays(base, Math.floor(Math.random() * 10) + i);
    const len = Math.floor(Math.random() * 8) + 2;
    out.push({
      id: i + 1,
      title: `Task ${i + 1}`,
      owner: ['Alice','Bob','Carol','Dan','Eve'][i % 5],
      start: s,
      end: addDays(s, len),
      percent: Math.floor(Math.random() * 100),
    });
  }
  return out;
}

function renderGantt() {
  ganttEl.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid';

  // header: dates
  const header = document.createElement('div');
  header.className = 'header';
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = 'Name';
  header.appendChild(label);
  const dates = document.createElement('div');
  dates.className = 'dates';
  const days = daysBetween(startDate, endDate);
  for (let d = 0; d <= days; d++) {
    const cell = document.createElement('div');
    cell.className = 'time-cell';
    cell.style.width = cellWidth + 'px';
    cell.textContent = formatDate(addDays(startDate, d));
    dates.appendChild(cell);
  }
  header.appendChild(dates);
  ganttEl.appendChild(header);

  tasks.forEach((t, idx) => {
    const row = document.createElement('div');
    row.className = 'row';

    const lbl = document.createElement('div');
    lbl.className = 'label';
    lbl.textContent = `${t.title} (${t.owner})`;
    row.appendChild(lbl);

    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    timeline.style.height = rowHeight + 'px';

    // backdrop cells for timeline (visual grid)
    for (let d = 0; d <= days; d++) {
      const cell = document.createElement('div');
      cell.className = 'time-cell';
      cell.style.width = cellWidth + 'px';
      timeline.appendChild(cell);
    }

    // task bar
    const bar = document.createElement('div');
    bar.className = 'task-bar';
    bar.dataset.id = t.id;
    const leftOffset = diffDays(startDate, t.start) * cellWidth;
    const width = Math.max(24, diffDays(t.start, t.end) * cellWidth);
    bar.style.left = leftOffset + 'px';
    bar.style.width = width + 'px';
    bar.innerHTML = `
      <div class="handle left" data-side="left"></div>
      <div class="title">${t.title}</div>
      <div style="flex:1"></div>
      <div class="handle right" data-side="right"></div>
    `;

    // events: drag move, resize
    attachDragHandlers(bar, t);

    // tooltip on hover
    bar.addEventListener('mouseenter', (e) => {
      showTooltip(t, e);
    });
    bar.addEventListener('mousemove', (e) => {
      moveTooltip(e);
    });
    bar.addEventListener('mouseleave', () => hideTooltip());

    timeline.appendChild(bar);
    row.appendChild(timeline);
    grid.appendChild(row);
  });

  ganttEl.appendChild(grid);
}

function attachDragHandlers(bar, task) {
  let isDragging = false;
  let isResizing = false;
  let resizeSide = null;
  let startX = 0;
  let startLeft = 0;
  let startWidth = 0;

  bar.addEventListener('mousedown', onDown);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('mousemove', onMove);

  function onDown(e) {
    e.preventDefault();
    const target = e.target;
    if (target.classList.contains('handle')) {
      isResizing = true;
      resizeSide = target.dataset.side;
    } else {
      isDragging = true;
    }
    startX = e.clientX;
    startLeft = parseInt(bar.style.left || '0', 10);
    startWidth = parseInt(bar.style.width || '0', 10);
    bar.classList.add('dragging');
  }
  function onUp(e) {
    if (isDragging || isResizing) {
      // commit changes to task
      const newStart = addDays(startDate, Math.round(parseInt(bar.style.left,10) / cellWidth));
      const newEnd = addDays(startDate, Math.round((parseInt(bar.style.left,10) + parseInt(bar.style.width,10)) / cellWidth));
      task.start = newStart;
      task.end = newEnd;
      // small visual update
      renderGantt();
      // notify host that tasks changed
      try {
        sendToHost({ type: 'tasksChanged', tasks: tasks.map(t => ({ id: t.id, title: t.title, owner: t.owner, start: t.start.toISOString().slice(0,10), end: t.end.toISOString().slice(0,10), percent: t.percent })) });
      } catch (e) { console.warn('send tasksChanged failed', e); }
    }
    isDragging = false; isResizing = false; resizeSide = null;
    bar.classList.remove('dragging');
  }
  function onMove(e) {
    if (!(isDragging || isResizing)) return;
    const dx = e.clientX - startX;
    if (isDragging) {
      const newLeft = Math.max(0, startLeft + dx);
      bar.style.left = Math.round(newLeft) + 'px';
    } else if (isResizing) {
      if (resizeSide === 'right') {
        const newWidth = Math.max(24, startWidth + dx);
        bar.style.width = Math.round(newWidth) + 'px';
      } else if (resizeSide === 'left') {
        const newLeft = Math.max(0, startLeft + dx);
        const newWidth = Math.max(24, startWidth - dx);
        // prevent crossing
        if (newWidth > 24) {
          bar.style.left = Math.round(newLeft) + 'px';
          bar.style.width = Math.round(newWidth) + 'px';
        }
      }
    }
  }
}

function showTooltip(task, e) {
  tooltip.style.display = 'block';
  tooltip.innerHTML = `<strong>${escapeHtml(task.title)}</strong><br/>Owner: ${escapeHtml(task.owner)}<br/>${formatDate(task.start)} - ${formatDate(task.end)}<br/>Progress: ${task.percent}%`;
  moveTooltip(e);
}
function moveTooltip(e) {
  const padding = 12;
  tooltip.style.left = e.clientX + padding + 'px';
  tooltip.style.top = e.clientY + padding + 'px';
}
function hideTooltip() {
  tooltip.style.display = 'none';
}

// Date helpers
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate() + n); return startOfDay(x); }
function diffDays(a,b){ // a earlier than b: returns days difference
  const A = startOfDay(a); const B = startOfDay(b);
  return Math.round((B - A) / (1000*60*60*24));
}
function daysBetween(a,b){ return diffDays(a,b); }
function formatDate(d){ const m = d.getMonth()+1; return `${d.getFullYear()}-${String(m).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
  });
}
