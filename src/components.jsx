import React, { useState } from 'react';
import { GRAVITE, bg0, bg1, bg2, bdr2, tx0, tx1, tx2, accent, accent2, mono } from './theme';

export function Grav({ v, size = 22 }) {
  var g = GRAVITE[v] || GRAVITE[1];
  return React.createElement('div', { style: { width: size, height: size, borderRadius: 5, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, color: g.tx, border: '1.5px solid ' + g.bd, flexShrink: 0 } }, v);
}

export function Tag({ children, color }) {
  return React.createElement('span', { style: { background: bg2, borderRadius: 4, padding: '2px 8px', fontSize: 10, color: color || tx2, border: '1px solid ' + bdr2, fontFamily: mono } }, children);
}

export function Btn({ children, primary, small, disabled, onClick, style }) {
  return React.createElement('button', {
    disabled: disabled, onClick: onClick,
    style: Object.assign({
      padding: small ? '5px 12px' : '10px 18px',
      border: primary ? 'none' : '1px solid ' + bdr2,
      borderRadius: 7, fontSize: small ? 11 : 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#222' : primary ? 'linear-gradient(135deg,' + accent + ',' + accent2 + ')' : bg2,
      color: disabled ? tx2 : primary ? '#fff' : tx1,
      opacity: disabled ? 0.5 : 1, fontFamily: 'inherit',
    }, style || {})
  }, children);
}

export function EField({ label, value, onChange, type, options }) {
  var _s = useState(false), ed = _s[0], setEd = _s[1];
  var base = { background: bg2, border: '1px solid ' + bdr2, borderRadius: 5, color: tx0, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%' };

  if (options) {
    return React.createElement('div', { style: { marginBottom: 8 } },
      React.createElement('div', { style: { fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 } }, label),
      React.createElement('select', { value: value || '', onChange: function(e) { onChange(parseInt(e.target.value) || e.target.value); }, style: base },
        options.map(function(o) { return React.createElement('option', { key: o.v, value: o.v }, o.l); }))
    );
  }
  if (type === 'textarea') {
    return React.createElement('div', { style: { marginBottom: 8 } },
      React.createElement('div', { style: { fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 } }, label),
      React.createElement('textarea', { value: value || '', onChange: function(e) { onChange(e.target.value); }, style: Object.assign({}, base, { minHeight: 60, resize: 'vertical', lineHeight: 1.5 }) })
    );
  }
  return React.createElement('div', { style: { marginBottom: 8 } },
    React.createElement('div', { style: { fontSize: 9, color: tx2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 } }, label),
    ed
      ? React.createElement('input', { autoFocus: true, value: value || '', onChange: function(e) { onChange(e.target.value); }, onBlur: function() { setEd(false); }, style: Object.assign({}, base, { borderColor: accent + '44' }) })
      : React.createElement('div', { onClick: function() { setEd(true); }, style: { padding: '4px 8px', fontSize: 12, color: tx0, cursor: 'pointer', minHeight: 22 } },
          value || React.createElement('span', { style: { color: tx2, fontStyle: 'italic' } }, 'Cliquer pour editer'))
  );
}
export function ConfBar({ score, validated }) {
  var p = Math.round((score || 0) * 100);
  var c = p >= 75 ? '#22c55e' : p >= 50 ? '#eab308' : '#ef4444';
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#10101e', borderRadius: 6 } },
    React.createElement('span', { style: { fontSize: 10, color: '#666' } }, 'Confiance IA'),
    React.createElement('div', { style: { flex: 1, maxWidth: 140, height: 4, background: '#0a0a14', borderRadius: 2, overflow: 'hidden' } },
      React.createElement('div', { style: { width: p + '%', height: '100%', background: c, borderRadius: 2 } })
    ),
    React.createElement('span', { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: '#a8a4a0' } }, p + '%'),
    validated ? React.createElement('span', { style: { fontSize: 10, color: '#22c55e', fontWeight: 600, marginLeft: 8 } }, '+ Valide') : null
  );
}
