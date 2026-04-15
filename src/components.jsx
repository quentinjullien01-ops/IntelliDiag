import React, { useState } from 'react';
import { GRAVITE, bg0, bg1, bg2, bdr, bdr2, tx0, tx1, tx2, accent, accent2, mono } from './theme';

// ── Gravity badge ──
export function Grav({ v, size = 22 }) {
  const g = GRAVITE[v] || GRAVITE[1];
  return (
    <div style={{
      width: size, height: size, borderRadius: 5, background: g.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.5, color: g.tx,
      border: `1.5px solid ${g.bd}`, flexShrink: 0,
    }}>{v}</div>
  );
}

// ── Tag ──
export function Tag({ children, color }) {
  return (
    <span style={{
      background: bg2, borderRadius: 4, padding: '2px 8px',
      fontSize: 10, color: color || tx2,
      border: `1px solid ${bdr2}`, fontFamily: mono,
    }}>{children}</span>
  );
}

// ── Button ──
export function Btn({ children, primary, small, disabled, onClick, style: s }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding: small ? '5px 12px' : '10px 18px',
      border: primary ? 'none' : `1px solid ${bdr2}`,
      borderRadius: 7, fontSize: small ? 11 : 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#222' : primary ? `linear-gradient(135deg, ${accent}, ${accent2})` : bg2,
      color: disabled ? tx2 : primary ? '#fff' : tx1,
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'inherit',
      ...s,
    }}>{children}</button>
  );
}

// ── Editable field ──
export function EField({ label, value, onChange, type = 'text', options }) {
  const [editing, setEditing] = useState(false);

  const baseInput = {
    background: bg2, border: `1px solid ${bdr2}`, borderRadius: 5,
    color: tx0, padding: '4px 8px', fontSize: 12,
    fontFamily: 'inherit', outline: 'none', width: '100%',
  };

  if (options) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
        <select value={value || ''} onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)} style={baseInput}>
          {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)}
          style={{ ...baseInput, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      {editing ? (
        <input autoFocus value={value || ''} onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
          style={{ ...baseInput, borderColor: `${accent}44` }} />
      ) : (
        <div onClick={() => setEditing(true)}
          style={{ padding: '4px 8px', borderRadius: 5, fontSize: 12, color: tx0, cursor: 'pointer', border: '1px solid transparent', minHeight: 22 }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = bdr2}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
          {value || <span style={{ color: tx2, fontStyle: 'italic' }}>Cliquer pour éditer</span>}
        </div>
      )}
    </div>
  );
}

// ── Confidence bar ──
export function ConfBar({ score, validated }) {
  const p = Math.round((score || 0) * 100);
  const c = p >= 75 ? '#22c55e' : p >= 50 ? '#eab308' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: bg1, borderRadius: 6 }}>
      <span style={{ fontSize: 10, color: tx2 }}>Confiance IA</span>
      <div style={{ flex: 1, maxWidth: 140, height: 4, background: bg0, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: c, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: tx1 }}>{p}%</span>
      {validated && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, marginLeft: 8 }}>+ Validation opérateur</span>}
    </div>
  );
}
