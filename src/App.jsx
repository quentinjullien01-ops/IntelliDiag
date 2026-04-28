import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Grav, Tag, Btn, EField, ConfBar } from './components';
import { loadMissionsIndex, saveMissionsIndex, loadMission, saveMission, deleteMission, savePhoto, loadPhoto, deletePhotos } from './storage';
import { analyzePhotos, generateSynthesis } from './api';
import { buildAnalysisPrompt, SYNTHESIS_PROMPT } from './prompts';
import { exportToWord } from './export';
import { GRAVITE, RECO, GRAV_OPTIONS, EVO_OPTIONS, IMPACT_OPTIONS, RECO_OPTIONS, bg0, bg1, bg2, bdr, bdr2, tx0, tx1, tx2, accent, accent2, mono } from './theme';

// ═══ PHOTO CELL (ungrouped pool) ═══
const PhotoCell = memo(function PhotoCell({ photo, selected, onToggle }) {
  return (
    <div onClick={() => onToggle(photo.id)} style={{
      aspectRatio: '1', borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
      border: selected ? `2px solid ${accent}` : '2px solid transparent',
      opacity: selected ? 1 : 0.7,
    }}>
      <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
});

// ═══ CONSTAT CARD (left panel) ═══
const ConstatCard = memo(function ConstatCard({ constat: c, index, selected, onSelect }) {
  const g = c.fiche ? GRAVITE[c.fiche.gravite_globale] || GRAVITE[1] : null;
  const mainImg = c.photos[0]?.url;
  return (
    <div onClick={() => onSelect(index)} style={{
      display: 'flex', gap: 10, padding: '10px 12px', cursor: 'pointer', borderRadius: 8,
      background: selected ? `${accent}12` : bg1,
      border: selected ? `1px solid ${accent}40` : '1px solid transparent',
      transition: 'all .15s', marginBottom: 4,
    }}>
      <div style={{ width: 56, height: 44, borderRadius: 6, overflow: 'hidden', background: bg2, flexShrink: 0, position: 'relative' }}>
        {mainImg ? <img src={mainImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: tx2 }}>📷</div>}
        {c.photos.length > 1 && <div style={{ position: 'absolute', top: 2, right: 2, background: '#000b', borderRadius: 3, padding: '0 4px', fontSize: 9, color: '#fff9', fontFamily: mono }}>{c.photos.length}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: tx2 }}>#{String(index + 1).padStart(3, '0')}</span>
          {g && <Grav v={c.fiche.gravite_globale} size={18} />}
          {c.validated && <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>✓</span>}
          {c.status === 'analyzing' && <span style={{ fontSize: 9, color: accent, animation: 'pulse 1s infinite' }}>●</span>}
          {c.status === 'pending' && <span style={{ fontSize: 9, color: tx2 }}>◌</span>}
        </div>
        {c.fiche
          ? <p style={{ margin: 0, fontSize: 11, color: tx1, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fiche.synthese}</p>
          : <span style={{ fontSize: 11, color: tx2 }}>{c.status === 'analyzing' ? 'Analyse...' : c.status === 'error' ? 'Erreur' : 'En attente'}</span>}
      </div>
    </div>
  );
});

// ═══ EDITABLE DESORDRE ═══
const EditableDesordre = memo(function EditableDesordre({ d, di, updDes }) {
  const [open, setOpen] = useState(true);
  const g = GRAVITE[d.gravite] || GRAVITE[1];
  return (
    <div style={{ background: bg1, border: `1px solid ${g.bd}25`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }}>
        <Grav v={d.gravite} size={22} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: tx0 }}>
          {d.type?.replace(/_/g, ' ')}{d.sous_type && <span style={{ color: tx2, fontSize: 12 }}> — {d.sous_type}</span>}
        </span>
        <Tag color={d.evolutivite === 'urgent' ? '#ef4444' : d.evolutivite === 'evolutif' ? '#eab308' : '#22c55e'}>{d.evolutivite}</Tag>
        <span style={{ color: tx2, fontSize: 11, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
      </div>
      {open && (
        <div style={{ padding: '8px 12px', borderTop: `1px solid ${bdr}` }}>
          <EField label="Type" value={d.type} onChange={(v) => updDes(di, 'type', v)} />
          <EField label="Sous-type" value={d.sous_type} onChange={(v) => updDes(di, 'sous_type', v)} />
          <EField label="Description" value={d.description} onChange={(v) => updDes(di, 'description', v)} type="textarea" />
          <EField label="Localisation" value={d.localisation_relative} onChange={(v) => updDes(di, 'localisation_relative', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <EField label="Gravité" value={d.gravite} onChange={(v) => updDes(di, 'gravite', parseInt(v))} options={GRAV_OPTIONS} />
            <EField label="Évolutivité" value={d.evolutivite} onChange={(v) => updDes(di, 'evolutivite', v)} options={EVO_OPTIONS} />
            <EField label="Impact" value={d.impact} onChange={(v) => updDes(di, 'impact', v)} options={IMPACT_OPTIONS} />
          </div>
        </div>
      )}
    </div>
  );
});

// ═══ FICHE PANEL ═══
function FichePanel({ constat: c, index, onUpdate, onValidate }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  useEffect(() => { setPhotoIdx(0); }, [c?.id]);

  if (!c) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: tx2, fontSize: 14 }}>Sélectionnez un constat</div>;

  if (c.status === 'pending' || c.status === 'analyzing') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} />
      <span style={{ color: tx1 }}>{c.status === 'pending' ? 'En attente...' : 'Analyse en cours...'}</span>
    </div>
  );

  if (c.status === 'error') return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#991b1b22', border: '1px solid #991b1b44', borderRadius: 8, padding: 16 }}>
        <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>Erreur : {c.error}</p>
      </div>
    </div>
  );

  const f = c.fiche;
  if (!f) return null;
  const g = GRAVITE[f.gravite_globale] || GRAVITE[1];
  const r = RECO[f.recommandation_globale] || { label: '', icon: '📋' };

  // Refs pour garder upd/updDes stables malgré les changements de f/onUpdate.
  // Sans ça, EditableDesordre (memo) rerend tous les désordres à chaque keystroke.
  const fRef = useRef(f);
  const onUpdateRef = useRef(onUpdate);
  fRef.current = f;
  onUpdateRef.current = onUpdate;

  const upd = useCallback((path, val) => {
    const cur = fRef.current;
    const parts = path.split('.');
    if (parts.length === 1) {
      onUpdateRef.current({ ...cur, [path]: val });
      return;
    }
    const nf = { ...cur };
    let obj = nf;
    for (let i = 0; i < parts.length - 1; i++) {
      obj[parts[i]] = { ...obj[parts[i]] };
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = val;
    onUpdateRef.current(nf);
  }, []);

  const updDes = useCallback((di, path, val) => {
    const cur = fRef.current;
    const parts = path.split('.');
    const newDesordres = cur.desordres.map((d, i) => {
      if (i !== di) return d;
      if (parts.length === 1) return { ...d, [path]: val };
      const nd = { ...d };
      let obj = nd;
      for (let j = 0; j < parts.length - 1; j++) {
        obj[parts[j]] = { ...obj[parts[j]] };
        obj = obj[parts[j]];
      }
      obj[parts[parts.length - 1]] = val;
      return nd;
    });
    onUpdateRef.current({ ...cur, desordres: newDesordres });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Photo viewer */}
      <div style={{ height: '40%', borderBottom: `1px solid ${bdr}`, background: '#000', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {c.photos[photoIdx]?.url
          ? <img src={c.photos[photoIdx].url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          : <div style={{ color: tx2 }}>Pas de photo (mission restaurée)</div>}
        {c.photos.length > 1 && <>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {c.photos.map((_, i) => <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: 8, height: 8, borderRadius: 4, background: i === photoIdx ? '#fff' : '#fff5', cursor: 'pointer' }} />)}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, background: '#000b', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#fff9', fontFamily: mono }}>{photoIdx + 1}/{c.photos.length}</div>
          {photoIdx > 0 && <button onClick={() => setPhotoIdx(photoIdx - 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 14, background: '#000a', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>‹</button>}
          {photoIdx < c.photos.length - 1 && <button onClick={() => setPhotoIdx(photoIdx + 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 14, background: '#000a', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>›</button>}
        </>}
      </div>

      {/* Fiche content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Header + validate */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: tx2 }}>CONSTAT #{String(index + 1).padStart(3, '0')}</span>
            <Grav v={f.gravite_globale} size={24} />
            <Tag>{c.photos.length} photo{c.photos.length > 1 ? 's' : ''}</Tag>
          </div>
          <button onClick={onValidate} style={{
            padding: '6px 14px', borderRadius: 6,
            border: c.validated ? '1.5px solid #22c55e' : `1.5px solid ${bdr2}`,
            background: c.validated ? '#22c55e18' : bg2,
            color: c.validated ? '#22c55e' : tx1,
            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {c.validated ? '✓ Validé' : 'Valider la fiche'}
          </button>
        </div>

        <ConfBar score={f.confiance?.score} validated={c.validated} />

        <div style={{ marginTop: 12 }}>
          <EField label="Synthèse" value={f.synthese} onChange={(v) => upd('synthese', v)} type="textarea" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <EField label="Gravité globale" value={f.gravite_globale} onChange={(v) => upd('gravite_globale', parseInt(v))} options={GRAV_OPTIONS} />
            <EField label="Recommandation" value={f.recommandation_globale} onChange={(v) => upd('recommandation_globale', v)} options={RECO_OPTIONS} />
          </div>
        </div>

        {/* Désordres */}
        <div style={{ fontSize: 10, color: tx2, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          Désordres <span style={{ background: `${accent}22`, color: accent, padding: '1px 7px', borderRadius: 8, fontWeight: 800 }}>{f.desordres?.length || 0}</span>
        </div>
        {f.desordres?.map((d, di) => <EditableDesordre key={di} d={d} di={di} updDes={updDes} />)}
      </div>
    </div>
  );
}

// ═══ MAIN APP ═══
export default function App() {
  const [scr, setScr] = useState('home');
  const [ms, setMs] = useState([]);
  const [cm, setCm] = useState(null);
  const [constats, setConstats] = useState([]);
  const [sel, setSel] = useState(null);
  const [nm, setNm] = useState('');
  const [op, setOp] = useState('');
  const [cx, setCx] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('diag-ia:api-key') || '');
  const [engine, setEngine] = useState(() => localStorage.getItem('diag-ia:engine') || 'demo');
  const [syn, setSyn] = useState('');
  const [gs, setGs] = useState(false);
  const [dg, setDg] = useState(false);
  const [ungrouped, setUngrouped] = useState([]);
  const [selUG, setSelUG] = useState(new Set());
  const fr = useRef();
  const pr = useRef(false);
  const qr = useRef([]);

  // Stable callback : évite que les 50 ConstatCard rerendent à chaque sélection
  const handleSelect = useCallback((i) => setSel(i), []);

  // Stable toggle : évite que les 50 PhotoCell rerendent à chaque cochage
  const togglePhotoSel = useCallback((id) => {
    setSelUG((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  // Load missions on mount
  useEffect(() => { setMs(loadMissionsIndex()); }, []);

  // Save API key
  useEffect(() => { if (apiKey) localStorage.setItem('diag-ia:api-key', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('diag-ia:engine', engine); }, [engine]);

  // Auto-save mission (debounced 500 ms — évite stringify+localStorage à chaque keystroke)
  useEffect(() => {
    if (!cm || scr !== 'mission') return;
    const t = setTimeout(() => {
      const done = constats.filter((c) => c.fiche);
      const data = {
        ...cm, updated_at: Date.now(), contexte_ouvrage: cx, synthese: syn,
        nb_fiches: done.length,
        nb_desordres: done.reduce((s, c) => s + (c.fiche?.desordres?.length || 0), 0),
        gravite_max: done.length ? Math.max(...done.map((c) => c.fiche?.gravite_globale || 1)) : 0,
        constats: done.map((c) => ({
          fiche: c.fiche, validated: c.validated, timestamp: c.timestamp,
          photoIds: c.photos.map((p) => p.id).filter(Boolean),
          photoCount: c.photos.length,
        })),
      };
      saveMission(data);
      setMs((prev) => prev.map((m) => m.id === cm.id ? { ...m, updated_at: data.updated_at, nb_fiches: data.nb_fiches, nb_desordres: data.nb_desordres, gravite_max: data.gravite_max } : m));
    }, 500);
    return () => clearTimeout(t);
  }, [constats, cx, syn, cm, scr]);

  // Queue processor
  const processQueue = useCallback(async () => {
    if (pr.current) return;
    pr.current = true;
    while (qr.current.length > 0) {
      const id = qr.current[0];
      setConstats((p) => p.map((c) => c.id === id ? { ...c, status: 'analyzing' } : c));
      try {
        const con = await new Promise((r) => { setConstats((p) => { r(p.find((c) => c.id === id)); return p; }); });
        const files = con.photos.map((p) => p.file).filter(Boolean);
        if (!files.length) throw new Error('Pas de photos avec fichier');
        const result = await analyzePhotos(files, buildAnalysisPrompt(cx), apiKey, engine);
        // Save photos to IndexedDB
        for (const ph of con.photos) {
          if (ph.file && ph.id) await savePhoto(ph.id, ph.file);
        }
        setConstats((p) => p.map((c) => c.id === id ? { ...c, status: 'done', fiche: result, timestamp: Date.now() } : c));
      } catch (err) {
        setConstats((p) => p.map((c) => c.id === id ? { ...c, status: 'error', error: err.message } : c));
      }
      qr.current.shift();
    }
    pr.current = false;
  }, [cx, apiKey]);

  // Add photos to pool
  const addPhotos = useCallback((files) => {
    const newP = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6), url: URL.createObjectURL(f), file: f }));
    setUngrouped((p) => [...p, ...newP]);
  }, []);

  // Create constat from selected photos
  const createConstat = useCallback((photoIds) => {
    const ids = photoIds?.size > 0 ? photoIds : new Set(ungrouped.map((p) => p.id));
    const photos = ungrouped.filter((p) => ids.has(p.id));
    if (!photos.length) return;
    const id = 'c' + Date.now() + Math.random().toString(36).slice(2, 6);
    setConstats((p) => [...p, { id, photos, fiche: null, status: 'pending', validated: false, error: null, timestamp: Date.now() }]);
    setUngrouped((p) => p.filter((ph) => !ids.has(ph.id)));
    setSelUG(new Set());
    qr.current.push(id);
    setTimeout(processQueue, 50);
  }, [ungrouped, processQueue]);

  // Auto-create 1:1 — batch en un seul setConstats au lieu de N appels successifs
  const autoCreate = useCallback(() => {
    if (!ungrouped.length) return;
    const ts = Date.now();
    const newConstats = ungrouped.map((ph) => ({
      id: 'c' + ts + Math.random().toString(36).slice(2, 6) + ph.id.slice(-4),
      photos: [ph], fiche: null, status: 'pending', validated: false, error: null, timestamp: ts,
    }));
    setConstats((p) => [...p, ...newConstats]);
    qr.current.push(...newConstats.map((c) => c.id));
    setUngrouped([]);
    setSelUG(new Set());
    setTimeout(processQueue, 50);
  }, [ungrouped, processQueue]);

  // Mission actions
  const startMission = () => {
    if (!nm.trim()) return;
    const id = 'm' + Date.now();
    const m = { id, name: nm, operateur: op, contexte_ouvrage: cx, created_at: Date.now(), updated_at: Date.now(), nb_fiches: 0, nb_desordres: 0, gravite_max: 0, synthese: '', constats: [] };
    saveMission(m);
    const ni = [{ id, name: nm, operateur: op, created_at: m.created_at, updated_at: m.updated_at, nb_fiches: 0, nb_desordres: 0, gravite_max: 0 }, ...ms];
    saveMissionsIndex(ni);
    setMs(ni); setCm(m); setConstats([]); setUngrouped([]); setSyn(''); setSel(null); setScr('mission');
  };

  const resumeMission = async (id) => {
    const m = loadMission(id);
    if (!m) return;
    setNm(m.name); setOp(m.operateur || ''); setCx(m.contexte_ouvrage || ''); setSyn(m.synthese || '');
    setCm(m);
    // Restore constats — toutes les photos chargées en parallèle (Promise.all)
    const restored = await Promise.all((m.constats || []).map(async (c, idx) => {
      let photos = [];
      if (c.photoIds?.length) {
        const files = await Promise.all(c.photoIds.map((pid) => loadPhoto(pid)));
        photos = c.photoIds.map((pid, i) => ({
          id: pid, url: files[i] ? URL.createObjectURL(files[i]) : null, file: files[i],
        }));
      }
      if (photos.length === 0) {
        // Fallback: placeholders (cache vidé / mission importée)
        for (let i = 0; i < (c.photoCount || 1); i++) {
          photos.push({ id: null, url: null, file: null });
        }
      }
      return { id: 'r' + idx, photos, fiche: c.fiche, status: 'done', validated: c.validated || false, error: null, timestamp: c.timestamp };
    }));
    setConstats(restored); setUngrouped([]); setSel(null); setScr('mission');
  };

  const delMission = (id) => {
    if (!confirm('Supprimer cette mission et ses photos ?')) return;
    const m = loadMission(id);
    if (m?.constats) {
      const allPhotoIds = m.constats.flatMap((c) => c.photoIds || []);
      if (allPhotoIds.length) deletePhotos(allPhotoIds);
    }
    deleteMission(id);
    const ni = ms.filter((m) => m.id !== id);
    saveMissionsIndex(ni);
    setMs(ni);
  };

  const goHome = () => {
    qr.current = []; pr.current = false;
    setCm(null); setConstats([]); setUngrouped([]); setSel(null);
    setMs(loadMissionsIndex());
    setScr('home');
  };

  const genSynthesis = async () => {
    const done = constats.filter((c) => c.fiche);
    if (!done.length) return;
    setGs(true);
    try {
      const fichesData = done.map((c, i) => ({ numero: i + 1, ...c.fiche }));
      const result = await generateSynthesis(SYNTHESIS_PROMPT, nm, cx, fichesData, apiKey, engine);
      setSyn(result);
    } catch (e) { alert('Erreur : ' + e.message); }
    setGs(false);
  };

  const an = constats.filter((c) => c.status === 'analyzing' || c.status === 'pending').length;
  const done = constats.filter((c) => c.fiche);

  const inputBase = { width: '100%', padding: '10px 14px', background: bg1, border: `1px solid ${bdr2}`, borderRadius: 8, color: tx0, fontSize: 13, outline: 'none' };
  const labelStyle = { fontSize: 10, color: tx2, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, display: 'block', marginBottom: 6 };

  // ═══ RENDER ═══
  return (
    <div style={{ minHeight: '100vh', background: bg0, color: tx0, display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ height: 48, padding: '0 20px', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', gap: 12, background: bg1, flexShrink: 0 }}>
        <div onClick={scr === 'mission' ? goHome : undefined} style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${accent}, ${accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', cursor: scr === 'mission' ? 'pointer' : 'default' }}>D</div>
        <span style={{ fontSize: 14, fontWeight: 700 }}>DiagIA</span>
        <span style={{ fontSize: 10, color: tx2, background: bg2, padding: '2px 8px', borderRadius: 10 }}>Desktop</span>
        {scr === 'mission' && <><div style={{ width: 1, height: 20, background: bdr2 }} /><span style={{ fontSize: 12, color: tx1 }}>{nm}</span></>}
        <div style={{ flex: 1 }} />
        {an > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 14, background: `${accent}15` }}><div style={{ width: 8, height: 8, borderRadius: 4, border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} /><span style={{ fontSize: 10, color: accent, fontWeight: 700 }}>{an} en cours</span></div>}
        {scr === 'mission' && done.length > 0 && <>
          <Btn small onClick={genSynthesis} disabled={gs}>{gs ? '...' : '✨ Synthèse'}</Btn>
          <Btn small onClick={() => exportToWord(nm, op, cx, constats, syn)}>📄 Word</Btn>
          <Btn small onClick={() => {
            const payload = { mission: nm, operateur: op, contexte: cx, synthese: syn, constats: done.map((c, i) => ({ numero: i + 1, validated: c.validated, ...c.fiche })) };
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)])); a.download = `diag-ia_${nm || 'mission'}.json`; a.click();
          }}>⬇ JSON</Btn>
        </>}
        {scr === 'mission' && <Btn small onClick={goHome}>🏠</Btn>}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: 'hidden' }}>

        {/* HOME */}
        {scr === 'home' && (
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 52, opacity: 0.5 }}>🏗</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>DiagIA Desktop</h1>
              <p style={{ color: tx2, fontSize: 14 }}>Diagnostic structurel — Traitement post-mission</p>
            </div>

            {/* Engine + API Key */}
            <div style={{ marginBottom: 24, padding: 16, background: bg1, borderRadius: 10, border: `1px solid ${bdr2}` }}>
              <label style={labelStyle}>Moteur IA</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[{v:'demo',l:'Demo (gratuit)'},{v:'gemini',l:'Gemini (gratuit)'},{v:'claude',l:'Claude (payant)'}].map(o => (
                  <button key={o.v} onClick={() => setEngine(o.v)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: engine === o.v ? `2px solid ${accent}` : `1px solid ${bdr2}`, background: engine === o.v ? `${accent}15` : bg2, color: engine === o.v ? accent : tx1, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{o.l}</button>
                ))}
              </div>
              {engine !== 'demo' && <>
                <label style={labelStyle}>{engine === 'gemini' ? 'Cle API Google Gemini' : 'Cle API Anthropic'}</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={engine === 'gemini' ? 'AIza...' : 'sk-ant-...'} style={inputBase} />
                <p style={{ fontSize: 10, color: tx2, marginTop: 6 }}>{engine === 'gemini' ? 'Gratuit ! Creez votre cle sur ai.google.dev' : 'Payant. Cle sur console.anthropic.com'}</p>
              </>}
              {engine === 'demo' && <p style={{ fontSize: 11, color: accent }}>Mode demo actif — donnees fictives realistes, pas besoin de cle API.</p>}
            </div>

            <Btn primary onClick={() => { setNm(''); setOp(''); setCx(''); setSyn(''); setScr('setup'); }} style={{ width: '100%', padding: 16, fontSize: 16, marginBottom: 32 }}>+ Nouvelle mission</Btn>

            {ms.length > 0 && <>
              <div style={labelStyle}>Missions ({ms.length})</div>
              {ms.map((m) => (
                <div key={m.id} onClick={() => resumeMission(m.id)} style={{ background: bg1, border: `1px solid ${bdr2}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🏗</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: tx2 }}>{new Date(m.updated_at).toLocaleDateString('fr-FR')} — {m.nb_fiches} fiche{m.nb_fiches > 1 ? 's' : ''} · {m.nb_desordres || 0} désordre{(m.nb_desordres || 0) > 1 ? 's' : ''}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delMission(m.id); }} style={{ background: 'none', border: 'none', color: '#ffffff20', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
              ))}
            </>}
          </div>
        )}

        {/* SETUP */}
        {scr === 'setup' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '36px 24px' }}>
            <button onClick={() => setScr('home')} style={{ background: 'none', border: 'none', color: accent, fontSize: 13, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>← Retour</button>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Nouvelle mission</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Nom de la mission *</label><input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Ex: Parking Chevêne — Annecy" style={{ ...inputBase, padding: '12px 14px', fontSize: 15 }} /></div>
              <div><label style={labelStyle}>Opérateur</label><input value={op} onChange={(e) => setOp(e.target.value)} placeholder="Ex: Q. Jullien" style={inputBase} /></div>
              <div><label style={labelStyle}>🏢 Contexte de l'ouvrage</label><textarea value={cx} onChange={(e) => setCx(e.target.value)} placeholder={"Décrivez l'ouvrage : type, époque, structure, matériaux, environnement, historique..."} style={{ ...inputBase, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }} /></div>
              <Btn primary disabled={!nm.trim()} onClick={startMission} style={{ padding: 14, fontSize: 15 }}>Démarrer la mission →</Btn>
            </div>
          </div>
        )}

        {/* MISSION */}
        {scr === 'mission' && (
          <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
            {/* LEFT PANEL */}
            <div style={{ width: 320, borderRight: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', background: bg1, flexShrink: 0 }}>
              {/* Ungrouped pool */}
              {ungrouped.length > 0 && (
                <div style={{ borderBottom: `1px solid ${bdr}`, padding: 12 }}>
                  <div style={{ fontSize: 10, color: tx2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Photos à trier ({ungrouped.length})</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Btn small onClick={() => createConstat(selUG)} disabled={selUG.size === 0}>Grouper ({selUG.size})</Btn>
                      <Btn small onClick={autoCreate}>1:1</Btn>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                    {ungrouped.map((p) => (
                      <PhotoCell key={p.id} photo={p} selected={selUG.has(p.id)} onToggle={togglePhotoSel} />
                    ))}
                  </div>
                </div>
              )}

              {/* Constats list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {constats.length > 0 && <div style={{ fontSize: 10, color: tx2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 6, padding: '0 4px' }}>Constats ({constats.length})</div>}
                {constats.map((c, i) => <ConstatCard key={c.id} constat={c} index={i} selected={sel === i} onSelect={handleSelect} />)}
                {constats.length === 0 && ungrouped.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: tx2, fontSize: 13 }}>Importez les photos de votre mission</div>}
              </div>

              {/* Import zone */}
              <div onDragOver={(e) => { e.preventDefault(); setDg(true); }} onDragLeave={() => setDg(false)} onDrop={(e) => { e.preventDefault(); setDg(false); addPhotos(e.dataTransfer.files); }}
                onClick={() => fr.current?.click()}
                style={{ padding: 16, borderTop: `1px solid ${bdr}`, textAlign: 'center', cursor: 'pointer', background: dg ? `${accent}08` : bg2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dg ? accent : tx1 }}>📁 Importer des photos</div>
                <div style={{ fontSize: 10, color: tx2, marginTop: 2 }}>Glisser-déposer ou cliquer</div>
                <input ref={fr} type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ flex: 1, background: bg0 }}>
              <FichePanel
                constat={sel !== null ? constats[sel] : null}
                index={sel}
                onUpdate={(nf) => { setConstats((p) => p.map((c, i) => i === sel ? { ...c, fiche: nf } : c)); }}
                onValidate={() => { setConstats((p) => p.map((c, i) => i === sel ? { ...c, validated: !c.validated } : c)); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
