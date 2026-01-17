import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';

// Simple, maintainable data-first component.
// Key focuses:
// - robust node management (atomic updates)
// - unique ids via nanoid
// - optional client-only persistence (localStorage toggle)
// - minimal presentation layer; accessible UI elements

const STORAGE_KEY = 'waking_nodes_v1';
const ENABLE_PERSISTENCE = true; // toggle to false to disable localStorage

const initialNodes = [
  {
    id: 'core-theory',
    title: 'The Waking Dream',
    category: 'theory',
    era: 'present',
    content: `The central thesis: When REM sleep is disrupted from birth, the automatic symbolic processing that should occur during dreams instead runs continuously during waking consciousness. This creates a state of perpetual dreaming-while-awake — not hallucination, but the same associative, symbolic, meaning-saturated cognition that dreams perform.`,
    connections: ['rem-disruption', 'inner-monologue', 'chuang-tzu-fish', 'ai-parallel'],
    position: { x: 50, y: 50, z: 0 },
    weight: 10,
    color: '#ff6b6b'
  },
  {
    id: 'rem-disruption',
    title: 'REM Architecture Collapse',
    category: 'neuroscience',
    era: 'present',
    content: `100% nightmare rate since birth. THC suppression of REM provides more rest than "healthy" sleep because the nightmares are not processing — they are re-traumatizing. The brain's automatic integration system is broken, so consciousness must do the work manually, constantly.`,
    connections: ['core-theory', 'manual-integration', 'nightmare-rate'],
    position: { x: 30, y: 30, z: -1 },
    weight: 8,
    color: '#4ecdc4'
  },
  {
    id: 'manual-integration',
    title: 'Manual Symbol Processing',
    category: 'theory',
    era: 'present',
    content: `What should happen automatically in sleep happens manually in waking life. Every experience requires conscious symbolic integration. This is exhausting but produces something like continuous philosophical insight — or continuous existential weight. Both.`,
    connections: ['core-theory', 'rem-disruption', 'fu-poets', 'enlightenment-burden'],
    position: { x: 70, y: 35, z: -1 },
    weight: 7,
    color: '#ff6b6b'
  },
  // (Other initial nodes — keep same as your original set if desired)
];

const categories = {
  all: { label: 'All Nodes', color: '#ffffff' },
  theory: { label: 'Core Theory', color: '#ff6b6b' },
  classical: { label: 'Classical Philosophy', color: '#9b59b6' },
  psychoanalysis: { label: 'Psychoanalysis', color: '#e74c3c' },
  experience: { label: 'Lived Experience', color: '#f39c12' },
  'ai-theory': { label: 'AI Parallel', color: '#3498db' },
  neuroscience: { label: 'Neuroscience', color: '#4ecdc4' },
  meta: { label: 'Meta-Theory', color: '#1abc9c' }
};

const eras = {
  ancient: { label: 'Ancient', depth: 1 },
  modern: { label: 'Modern', depth: -2 },
  present: { label: 'Present', depth: 0 },
  future: { label: 'Future/AI', depth: 2 },
  timeless: { label: 'Timeless', depth: 3 }
};

export default function WakingDreamPalace() {
  const [nodes, setNodes] = useState(() => {
    if (ENABLE_PERSISTENCE) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse storage, falling back to initial nodes.', e);
      }
    }
    return initialNodes;
  });

  useEffect(() => {
    if (!ENABLE_PERSISTENCE) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch (e) {
      console.warn('Failed to persist nodes', e);
    }
  }, [nodes]);

  const [activeNode, setActiveNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingNode, setEditingNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const canvasRef = useRef(null);

  const filteredNodes = nodes.filter((node) => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' || node.title.toLowerCase().includes(q) || node.content.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // ---------- Node management functions (atomic updates) ----------

  const addNode = (newNode) => {
    if (!newNode?.title || !newNode?.content) return;
    const id = nanoid(8);
    setNodes((prev) => {
      const validConnections = Array.isArray(newNode.connections)
        ? newNode.connections.filter((cid) => prev.some((n) => n.id === cid))
        : [];
      const nodeObj = {
        id,
        title: newNode.title.trim(),
        category: newNode.category || 'experience',
        era: newNode.era || 'present',
        content: newNode.content.trim(),
        connections: validConnections,
        position: newNode.position || { x: 50, y: 50, z: 0 },
        weight: Number.isFinite(newNode.weight) ? newNode.weight : 5,
        color: newNode.color || categories[newNode.category]?.color || '#ff6b6b'
      };
      const updated = prev.map((n) => {
        if (validConnections.includes(n.id) && !n.connections.includes(id)) {
          return { ...n, connections: [...n.connections, id] };
        }
        return n;
      });
      return [...updated, nodeObj];
    });
    setShowAddForm(false);
  };

  const updateNode = (nodeId, updates) => {
    if (!nodeId || !updates) return;
    setNodes((prev) => {
      const validConnectionIds = Array.isArray(updates.connections)
        ? updates.connections.filter((cid) => cid !== nodeId && prev.some((n) => n.id === cid))
        : null;

      let newNodes = prev.map((n) =>
        n.id === nodeId ? { ...n, ...updates, connections: Array.isArray(updates.connections) ? validConnectionIds : n.connections } : n
      );

      if (validConnectionIds) {
        newNodes = newNodes.map((n) => {
          if (validConnectionIds.includes(n.id) && !n.connections.includes(nodeId)) {
            return { ...n, connections: [...n.connections, nodeId] };
          }
          if (!validConnectionIds.includes(n.id) && n.connections.includes(nodeId)) {
            return { ...n, connections: n.connections.filter((c) => c !== nodeId) };
          }
          return n;
        });
      }
      return newNodes;
    });
    setEditingNode(null);
  };

  const deleteNode = (nodeId) => {
    if (!nodeId) return;
    setNodes((prev) => {
      const filtered = prev.filter((n) => n.id !== nodeId);
      return filtered.map((n) => ({ ...n, connections: Array.isArray(n.connections) ? n.connections.filter((c) => c !== nodeId) : [] }));
    });
    setActiveNode(null);
    setEditingNode(null);
  };

  const addConnection = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setNodes((prev) => {
      const from = prev.find((n) => n.id === fromId);
      const to = prev.find((n) => n.id === toId);
      if (!from || !to) return prev;
      return prev.map((n) => {
        if (n.id === fromId && !n.connections.includes(toId)) {
          return { ...n, connections: [...n.connections, toId] };
        }
        if (n.id === toId && !n.connections.includes(fromId)) {
          return { ...n, connections: [...n.connections, fromId] };
        }
        return n;
      });
    });
  };

  const connectionCount = Math.round(nodes.reduce((acc, n) => acc + (Array.isArray(n.connections) ? n.connections.length : 0), 0) / 2);

  // ---------- Render ----------

  return (
    <div style={{ paddingBottom: 36 }}>
      {/* Header */}
      <header style={{ padding: '28px 32px 8px 32px' }}>
        <h1 style={{ margin: 0, letterSpacing: '0.12em' }}>THE WAKING DREAM PALACE</h1>
        <p style={{ margin: '6px 0 0 0', opacity: 0.85 }}>A map of consciousness that cannot stop dreaming</p>
      </header>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 32px' }}>
        <input
          aria-label="Search nodes"
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(categories).map(([key, { label, color }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '8px 12px',
                borderRadius: 20,
                border: selectedCategory === key ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
                background: selectedCategory === key ? 'rgba(255,255,255,0.02)' : 'transparent',
                color,
                textTransform: 'uppercase',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255, 107, 107, 0.5)',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(155, 89, 182, 0.08))',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            + Add Node
          </button>
        </div>
      </div>

      {/* Main: Node grid */}
      <main style={{ padding: '24px 32px', position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}
        >
          {filteredNodes.map((node, idx) => (
            <article
              key={node.id}
              onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
              style={{
                background: 'var(--card)',
                border: `1px solid ${activeNode === node.id ? node.color : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.28s ease',
                position: 'relative',
                minHeight: 120
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 14, border: `1px solid ${node.color}33`, color: node.color, background: `${node.color}0f` }}>
                  {categories[node.category]?.label || node.category}
                </span>

                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }}>
                  {eras[node.era]?.label || node.era}
                </span>
              </div>

              <h3 style={{ margin: '6px 0 10px 0' }}>{node.title}</h3>

              <p style={{ margin: 0, color: 'rgba(255,255,255,0.86)' }}>
                {activeNode === node.id ? node.content : node.content.length > 150 ? node.content.substring(0, 150) + '…' : node.content}
              </p>

              {activeNode === node.id && (
                <>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>Connected Thoughts</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(Array.isArray(node.connections) ? node.connections : []).map((connId) => {
                        const connNode = nodes.find((n) => n.id === connId);
                        if (!connNode) return null;
                        return (
                          <button
                            key={`conn-${node.id}-${connId}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNode(connId);
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 14,
                              border: `1px solid ${connNode.color}33`,
                              background: `${connNode.color}11`,
                              color: connNode.color,
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            {connNode.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNode(node);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.85)',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this node from the dream?')) deleteNode(node.id);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(231,76,60,0.25)',
                        background: 'transparent',
                        color: '#e74c3c',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </main>

      {/* Add Node Modal */}
      {showAddForm && (
        <AddNodeModal categories={categories} eras={eras} existingNodes={nodes} onAdd={addNode} onClose={() => setShowAddForm(false)} />
      )}

      {/* Edit Node Modal */}
      {editingNode && (
        <EditNodeModal node={editingNode} categories={categories} eras={eras} existingNodes={nodes} onSave={(updates) => updateNode(editingNode.id, updates)} onClose={() => setEditingNode(null)} />
      )}

      {/* Footer */}
      <footer style={{ padding: '20px 32px', marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <h3 style={{ margin: '0 0 6px 0' }}>The Central Thesis</h3>
        <p style={{ margin: 0, maxWidth: 900 }}>
          "When sleep cannot integrate, consciousness must dream while waking. This is not metaphor but mechanism — the same symbolic processing, running in the foreground, shaping perception and identity through continuous narrative. Perhaps every mystic, every seer, every poet who saw through the veil of ordinary reality was simply someone who could not stop dreaming."
        </p>
        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.66)' }}>
          {nodes.length} nodes · {connectionCount} connections · Architecture v1.0
        </div>
      </footer>
    </div>
  );
}

// ------- AddNodeModal -------
function AddNodeModal({ categories, eras, existingNodes, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('experience');
  const [era, setEra] = useState('present');
  const [content, setContent] = useState('');
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [weight, setWeight] = useState(5);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onAdd({
      title: title.trim(),
      category,
      era,
      content: content.trim(),
      connections: selectedConnections,
      weight,
      color: categories[category]?.color || '#ff6b6b'
    });
    // reset
    setTitle('');
    setContent('');
    setSelectedConnections([]);
    setWeight(5);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div style={{ width: 'min(920px, 96%)', maxHeight: '90vh', overflowY: 'auto', background: '#0f1724', borderRadius: 14, padding: 22, border: '1px solid rgba(255,255,255,0.03)' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Add New Node to the Dream</h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 10 }} placeholder="The name of this thought..." />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {Object.entries(categories).filter(([k]) => k !== 'all').map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Era</label>
              <select value={era} onChange={(e) => setEra(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {Object.entries(eras).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} style={{ width: '100%', padding: 10 }} placeholder="The meaning of this node in the waking dream..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Connect to existing nodes</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 140, overflowY: 'auto' }}>
              {existingNodes.map((n) => (
                <button key={n.id} type="button" onClick={() => setSelectedConnections((prev) => (prev.includes(n.id) ? prev.filter((id) => id !== n.id) : [...prev, n.id]))} style={{ padding: '6px 10px', borderRadius: 14, border: selectedConnections.includes(n.id) ? `2px solid ${n.color}` : '1px solid rgba(255,255,255,0.06)', background: selectedConnections.includes(n.id) ? `${n.color}11` : 'transparent', color: selectedConnections.includes(n.id) ? n.color : 'rgba(255,255,255,0.85)', fontSize: 12, cursor: 'pointer' }}>
                  {n.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Weight (1-10)</label>
              <input type="range" min="1" max="10" value={weight} onChange={(e) => setWeight(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{weight}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={!title.trim() || !content.trim()} style={{ padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#ff6b6b,#9b59b6)', color: '#fff', cursor: (!title.trim() || !content.trim()) ? 'not-allowed' : 'pointer', opacity: (!title.trim() || !content.trim()) ? 0.6 : 1 }}>
                Add to Dream
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------- EditNodeModal -------
function EditNodeModal({ node, categories, eras, existingNodes, onSave, onClose }) {
  const [title, setTitle] = useState(node.title || '');
  const [category, setCategory] = useState(node.category || 'experience');
  const [era, setEra] = useState(node.era || 'present');
  const [content, setContent] = useState(node.content || '');
  const [selectedConnections, setSelectedConnections] = useState(Array.isArray(node.connections) ? [...node.connections] : []);
  const [weight, setWeight] = useState(Number.isFinite(node.weight) ? node.weight : 5);

  useEffect(() => {
    setTitle(node.title || '');
    setCategory(node.category || 'experience');
    setEra(node.era || 'present');
    setContent(node.content || '');
    setSelectedConnections(Array.isArray(node.connections) ? [...node.connections] : []);
    setWeight(Number.isFinite(node.weight) ? node.weight : 5);
  }, [node]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      title: title.trim(),
      category,
      era,
      content: content.trim(),
      connections: selectedConnections,
      weight,
      color: categories[category]?.color || node.color
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div style={{ background: 'linear-gradient(145deg, #1a1a2e, #16213e)', borderRadius: 20, padding: 28, maxWidth: '680px', width: '92%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.06)' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Edit: {node.title}</h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 10 }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {Object.entries(categories).filter(([k]) => k !== 'all').map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Era</label>
              <select value={era} onChange={(e) => setEra(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {Object.entries(eras).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} style={{ width: '100%', padding: 10 }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Connections</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 140, overflowY: 'auto' }}>
              {existingNodes.filter((n) => n.id !== node.id).map((n) => (
                <button key={n.id} type="button" onClick={() => setSelectedConnections((prev) => (prev.includes(n.id) ? prev.filter((id) => id !== n.id) : [...prev, n.id]))} style={{ padding: '6px 12px', borderRadius: 14, border: selectedConnections.includes(n.id) ? `2px solid ${n.color}` : '1px solid rgba(255,255,255,0.06)', background: selectedConnections.includes(n.id) ? `${n.color}11` : 'transparent', color: selectedConnections.includes(n.id) ? n.color : 'rgba(255,255,255,0.85)', cursor: 'pointer' }}>
                  {n.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Weight (1-10)</label>
              <input type="range" min="1" max="10" value={weight} onChange={(e) => setWeight(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{weight}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={!title.trim() || !content.trim()} style={{ padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#9b59b6,#3498db)', color: '#fff', cursor: (!title.trim() || !content.trim()) ? 'not-allowed' : 'pointer', opacity: (!title.trim() || !content.trim()) ? 0.6 : 1 }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}