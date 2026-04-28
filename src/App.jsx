import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Grav, Tag, Btn, EField, ConfBar } from './components';
import { loadMissionsIndex, saveMissionsIndex, loadMission, saveMission, deleteMission, savePhoto, loadPhoto, deletePhotos } from './storage';
import { analyzeBatch, generateSynthesis } from './api';
import { buildBatchAnalysisPrompt, SYNTHESIS_PROMPT } from './prompts';
import { exportToWord } from './export';
import { GRAVITE, RECO, GRAV_OPTIONS, EVO_OPTIONS, IMPACT_OPTIONS, RECO_OPTIONS, bg0, bg1, bg2, bdr, bdr2, tx0, tx1, tx2, accent, accent2, mono } from './theme';

// ═══ PHOTO CELL (pool) ═══
const PhotoCell = memo(function PhotoCell({ photo, dimmed }) {
  return (
    <div style={{ aspectRatio: '1', borderRadius: 4, overflow: 'hidden', opacity: dimmed ? 0.4 : 1, transition: 'opacity .2s' }}>
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
  // ⚠ Tous les hooks DOIVENT être appelés avant tout early return (Rules of Hooks).
  const [photoIdx, setPhotoIdx] = useState(0);
  useEffect(() => { setPhotoIdx(0); }, [c?.id]);

  const f = c?.fiche || null;
  const fRef = useRef(f);
  const onUpdateRef = useRef(onUpdate);
  fRef.current = f;
  onUpdateRef.current = onUpdate;

  const upd = useCallback((path, val) => {
    const cur = fRef.current;
    if (!cur) return;
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
    if (!cur) return;
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

  // Early returns — APRÈS tous les hooks.
  if (!c) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: tx2, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
        Aucun constat sélectionné
      </div>
      <div style={{ fontSize: 14, color: tx1, fontWeight: 500, textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
        Sélectionnez une fiche dans la liste à gauche pour la consulter, la corriger et la valider.
      </div>
    </div>
  );

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

  if (!f) return null;
  const g = GRAVITE[f.gravite_globale] || GRAVITE[1];
  const r = RECO[f.recommandation_globale] || { label: '', icon: '📋' };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: tx2, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0 }}>
              Constat #{String(index + 1).padStart(3, '0')}
            </span>
            <Grav v={f.gravite_globale} size={26} />
            <Tag>{c.photos.length} photo{c.photos.length > 1 ? 's' : ''}</Tag>
          </div>
          <button onClick={onValidate} style={{
            padding: '8px 14px', borderRadius: 7,
            border: c.validated ? '1.5px solid #22c55e' : `1px solid ${bdr2}`,
            background: c.validated ? '#22c55e18' : bg2,
            color: c.validated ? '#22c55e' : tx0,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!c.validated) e.currentTarget.style.borderColor = `${accent}55`; }}
          onMouseLeave={(e) => { if (!c.validated) e.currentTarget.style.borderColor = bdr2; }}>
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

// ═══ DATE HELPER ═══
function fmtRelDate(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return 'il y a ' + min + ' min';
  if (hr < 24) return 'il y a ' + hr + ' h';
  if (day < 7) return 'il y a ' + day + ' j';
  if (day < 30) return 'il y a ' + Math.floor(day / 7) + ' sem';
  if (day < 365) return 'il y a ' + Math.floor(day / 30) + ' mois';
  const y = Math.floor(day / 365);
  return 'il y a ' + y + ' an' + (y > 1 ? 's' : '');
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
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const fr = useRef();

  // Stable callback : évite que les ConstatCard rerendent à chaque sélection
  const handleSelect = useCallback((i) => setSel(i), []);

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

  // Add photos to pool
  const addPhotos = useCallback((files) => {
    const newP = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6), url: URL.createObjectURL(f), file: f }));
    setUngrouped((p) => [...p, ...newP]);
  }, []);

  // Batch analysis : envoie TOUTES les photos du pool en un seul appel IA,
  // l'IA regroupe par désordre distinct → on crée 1 constat par désordre identifié
  const analyzePool = useCallback(async () => {
    if (analyzing) return;
    const batch = ungrouped;
    if (!batch.length) return;
    const ids = new Set(batch.map((p) => p.id));
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const files = batch.map((p) => p.file).filter(Boolean);
      if (!files.length) throw new Error('Aucune photo avec fichier');
      const result = await analyzeBatch(files, buildBatchAnalysisPrompt(cx), apiKey, engine);
      const ts = Date.now();
      const newConstats = result.map((r, i) => ({
        id: 'b' + ts + '_' + i,
        photos: r.photo_indices.map((idx) => batch[idx]).filter(Boolean),
        fiche: r.fiche,
        status: 'done', validated: false, error: null, timestamp: ts,
      })).filter((c) => c.photos.length > 0);
      // Persist photos to IndexedDB
      for (const c of newConstats) {
        for (const ph of c.photos) {
          if (ph.file && ph.id) await savePhoto(ph.id, ph.file);
        }
      }
      setConstats((p) => [...p, ...newConstats]);
      setUngrouped((p) => p.filter((ph) => !ids.has(ph.id)));
    } catch (e) {
      setAnalyzeError(e.message || 'Erreur d analyse');
    } finally {
      setAnalyzing(false);
    }
  }, [ungrouped, cx, apiKey, engine, analyzing]);

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
    setCm(null); setConstats([]); setUngrouped([]); setSel(null);
    setAnalyzing(false); setAnalyzeError('');
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
        {analyzing && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 14, background: `${accent}15` }}><div style={{ width: 8, height: 8, borderRadius: 4, border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} /><span style={{ fontSize: 10, color: accent, fontWeight: 700 }}>Analyse en cours…</span></div>}
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
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '72px 24px 56px' }}>

            {/* Wordmark — hero brand moment */}
            <div style={{ marginBottom: 56 }}>
              <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0, letterSpacing: -2, color: tx0, lineHeight: 0.95 }}>
                DiagIA<span style={{ color: accent }}>.</span>
              </h1>
              <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10, color: tx2, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                v1.2 &nbsp;·&nbsp; post-mission &nbsp;·&nbsp; 100% local
              </div>
              <p style={{ color: tx1, fontSize: 14, margin: '24px 0 0', lineHeight: 1.55, maxWidth: 480 }}>
                Importez les photos d'une mission, l'IA propose les fiches de constat, vous validez, vous exportez. Aucun cloud.
              </p>
            </div>

            {/* Engine + API Key */}
            <div style={{ marginBottom: 28, padding: 18, background: bg1, borderRadius: 10, border: `1px solid ${bdr2}` }}>
              <label style={labelStyle}>Moteur IA</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { v: 'demo', l: 'Demo', t: 'OFFLINE' },
                  { v: 'gemini', l: 'Gemini', t: 'GOOGLE' },
                  { v: 'claude', l: 'Claude', t: 'ANTHROPIC' },
                ].map(o => {
                  const sel = engine === o.v;
                  return (
                    <button key={o.v} onClick={() => setEngine(o.v)} style={{
                      flex: 1, padding: '12px 12px 14px', borderRadius: 7,
                      border: sel ? `1px solid ${accent}66` : `1px solid ${bdr2}`,
                      background: sel ? `${accent}14` : bg2,
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      position: 'relative',
                      transition: 'all .15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    }}>
                      <span style={{ fontSize: sel ? 14 : 13, fontWeight: 700, color: sel ? tx0 : tx1, transition: 'all .15s' }}>{o.l}</span>
                      <span style={{ fontFamily: mono, fontSize: 9, color: sel ? accent : tx2, letterSpacing: 0.8, fontWeight: 500 }}>{o.t}</span>
                      {sel && <span style={{ position: 'absolute', top: 9, right: 9, width: 6, height: 6, borderRadius: 3, background: accent }} />}
                    </button>
                  );
                })}
              </div>

              {engine === 'demo' && (
                <p style={{ fontSize: 12, color: tx1, lineHeight: 1.5, margin: 0 }}>
                  Génère des fiches fictives réalistes, sans clé. Idéal pour tester le flux ou faire une démo.
                </p>
              )}
              {engine !== 'demo' && (
                <div>
                  <p style={{ fontSize: 12, color: tx1, lineHeight: 1.5, margin: '0 0 10px' }}>
                    {engine === 'gemini'
                      ? 'Modèle gratuit (Google). Créez une clé sur ai.google.dev.'
                      : 'Modèle payant (Anthropic). Créez une clé sur console.anthropic.com.'}
                  </p>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    placeholder={engine === 'gemini' ? 'AIza...' : 'sk-ant-...'}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }} />
                </div>
              )}
            </div>

            {/* CTA — bolder, with arrow momentum */}
            <button onClick={() => { setNm(''); setOp(''); setCx(''); setSyn(''); setScr('setup'); }}
              style={{
                width: '100%', padding: '18px 22px', border: 'none', borderRadius: 8,
                background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                color: '#f0eeeb', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, letterSpacing: -0.2,
                cursor: 'pointer', marginBottom: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'filter .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
              <span>Nouvelle mission</span>
              <span style={{ fontSize: 22, fontWeight: 400, opacity: 0.85 }}>→</span>
            </button>

            {/* Missions */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, padding: '0 2px' }}>
              <span style={{ ...labelStyle, marginBottom: 0, fontSize: 10, letterSpacing: 1.5 }}>Missions</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: tx1, fontWeight: 600 }}>{ms.length}</span>
            </div>

            {ms.length === 0 ? (
              <div style={{ padding: '32px 20px', borderRadius: 10, border: `1px dashed ${bdr2}`, textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: tx2, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Aucune mission</div>
                <div style={{ fontSize: 14, color: tx1, fontWeight: 500, marginBottom: 4 }}>C'est votre premier diagnostic.</div>
                <div style={{ fontSize: 12, color: tx2 }}>Créez une mission avec le bouton orange ci-dessus.</div>
              </div>
            ) : ms.map((m) => {
              const grav = m.gravite_max > 0 ? GRAVITE[m.gravite_max] : null;
              return (
                <div key={m.id} onClick={() => resumeMission(m.id)}
                  style={{ background: bg1, border: `1px solid ${bdr2}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, transition: 'border-color .15s, background .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.background = bg2; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = bdr2; e.currentTarget.style.background = bg1; }}>
                  {grav
                    ? <Grav v={m.gravite_max} size={40} />
                    : <div style={{ width: 40, height: 40, borderRadius: 7, background: bg2, border: `1px dashed ${bdr2}`, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: tx0, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: -0.2 }}>{m.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: tx2 }}>
                      <span>{fmtRelDate(m.updated_at)}</span>
                      <span style={{ color: bdr2 }}>·</span>
                      <span style={{ fontFamily: mono, fontWeight: 500 }}>{m.nb_fiches} fiche{m.nb_fiches > 1 ? 's' : ''}</span>
                      <span style={{ color: bdr2 }}>·</span>
                      <span style={{ fontFamily: mono, fontWeight: 500 }}>{m.nb_desordres || 0} désordre{(m.nb_desordres || 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delMission(m.id); }}
                    style={{ background: 'none', border: 'none', color: tx2, cursor: 'pointer', fontSize: 13, padding: 6, opacity: 0.35, transition: 'opacity .15s, color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.35; e.currentTarget.style.color = tx2; }}>
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SETUP */}
        {scr === 'setup' && (
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 56px' }}>

            {/* Back link */}
            <button onClick={() => setScr('home')}
              style={{ background: 'none', border: 'none', color: tx2, fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = tx0; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = tx2; }}>
              <span style={{ fontSize: 14 }}>←</span> Accueil
            </button>

            {/* Hero */}
            <div style={{ marginTop: 32, marginBottom: 44 }}>
              <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, letterSpacing: -1.2, color: tx0, lineHeight: 1.05 }}>
                Nouvelle mission<span style={{ color: accent }}>.</span>
              </h2>
              <p style={{ color: tx1, fontSize: 14, margin: '16px 0 0', lineHeight: 1.55, maxWidth: 460 }}>
                Donnez un nom à votre mission et décrivez l'ouvrage. Les photos s'importeront à l'étape suivante.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Name — primary input */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  Nom de la mission <span style={{ color: accent, fontSize: 11 }}>requis</span>
                </label>
                <input autoFocus value={nm} onChange={(e) => setNm(e.target.value)}
                  placeholder="Ex : Parking Chevène, Annecy"
                  style={{ ...inputBase, padding: '14px 16px', fontSize: 17, fontWeight: 500 }} />
              </div>

              {/* Operateur */}
              <div>
                <label style={labelStyle}>Opérateur</label>
                <input value={op} onChange={(e) => setOp(e.target.value)}
                  placeholder="Ex : Q. Jullien"
                  style={{ ...inputBase, padding: '12px 14px' }} />
              </div>

              {/* Contexte */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Contexte de l'ouvrage</label>
                  <span style={{ fontSize: 10, color: tx2, fontStyle: 'italic' }}>optionnel, mais recommandé</span>
                </div>
                <textarea value={cx} onChange={(e) => setCx(e.target.value)}
                  placeholder="Type, époque, structure, matériaux, environnement, historique. Plus la description est précise, mieux l'IA cadre son analyse."
                  style={{ ...inputBase, padding: '12px 14px', minHeight: 140, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            </div>

            {/* CTA — matches home pattern */}
            <button onClick={startMission} disabled={!nm.trim()}
              style={{
                width: '100%', marginTop: 36, padding: '18px 22px', border: 'none', borderRadius: 8,
                background: nm.trim() ? `linear-gradient(135deg, ${accent}, ${accent2})` : '#1a1a26',
                color: nm.trim() ? '#f0eeeb' : tx2,
                fontFamily: 'inherit', fontSize: 16, fontWeight: 700, letterSpacing: -0.2,
                cursor: nm.trim() ? 'pointer' : 'not-allowed',
                opacity: nm.trim() ? 1 : 0.6,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'filter .15s, opacity .15s',
              }}
              onMouseEnter={(e) => { if (nm.trim()) e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
              <span>{nm.trim() ? 'Démarrer la mission' : 'Saisissez un nom de mission'}</span>
              <span style={{ fontSize: 22, fontWeight: 400, opacity: 0.85 }}>→</span>
            </button>
          </div>
        )}

        {/* MISSION */}
        {scr === 'mission' && (
          <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
            {/* LEFT PANEL */}
            <div style={{ width: 320, borderRight: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', background: bg1, flexShrink: 0 }}>
              {/* Pool : photos importées en attente d'analyse batch */}
              {ungrouped.length > 0 && (
                <div style={{ borderBottom: `1px solid ${bdr}`, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                    <span style={{ ...labelStyle, marginBottom: 0, fontSize: 10, letterSpacing: 1.5 }}>
                      {analyzing ? 'Analyse en cours' : 'À analyser'}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: analyzing ? accent : tx1, fontWeight: 600 }}>
                      {ungrouped.length}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, maxHeight: 140, overflowY: 'auto', marginBottom: 10 }}>
                    {ungrouped.map((p) => (
                      <PhotoCell key={p.id} photo={p} dimmed={analyzing} />
                    ))}
                  </div>
                  {analyzeError && (
                    <div style={{ fontSize: 11, color: '#fca5a5', background: '#991b1b22', border: '1px solid #991b1b44', borderRadius: 7, padding: '8px 10px', marginBottom: 10, lineHeight: 1.4 }}>
                      {analyzeError}
                    </div>
                  )}
                  <button onClick={analyzePool} disabled={analyzing}
                    style={{
                      width: '100%', padding: '12px 14px', border: 'none', borderRadius: 7,
                      background: analyzing ? '#1a1a26' : `linear-gradient(135deg, ${accent}, ${accent2})`,
                      color: analyzing ? tx2 : '#f0eeeb',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                      cursor: analyzing ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      opacity: analyzing ? 0.7 : 1,
                      transition: 'filter .15s',
                    }}
                    onMouseEnter={(e) => { if (!analyzing) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
                    <span>
                      {analyzing
                        ? 'Analyse de ' + ungrouped.length + ' photo' + (ungrouped.length > 1 ? 's' : '')
                        : analyzeError
                        ? 'Réessayer'
                        : 'Analyser ' + ungrouped.length + ' photo' + (ungrouped.length > 1 ? 's' : '')}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 400, opacity: 0.85 }}>
                      {analyzing ? '⟳' : analyzeError ? '↻' : '→'}
                    </span>
                  </button>
                </div>
              )}

              {/* Constats list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {constats.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, fontSize: 10, letterSpacing: 1.5 }}>Constats</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: tx1, fontWeight: 600 }}>{constats.length}</span>
                  </div>
                )}
                {constats.map((c, i) => <ConstatCard key={c.id} constat={c} index={i} selected={sel === i} onSelect={handleSelect} />)}
                {constats.length === 0 && ungrouped.length === 0 && (
                  <div style={{ padding: '40px 18px 24px', textAlign: 'center' }}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: tx2, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
                      Mission vide
                    </div>
                    <div style={{ fontSize: 13, color: tx1, fontWeight: 500, marginBottom: 6, lineHeight: 1.45 }}>
                      Glissez les photos de la mission ci-dessous pour démarrer.
                    </div>
                    <div style={{ fontSize: 11, color: tx2, lineHeight: 1.5 }}>
                      L'IA produit une fiche par désordre identifié, que vous pourrez valider.
                    </div>
                  </div>
                )}
              </div>

              {/* Import zone */}
              <div onDragOver={(e) => { e.preventDefault(); setDg(true); }} onDragLeave={() => setDg(false)} onDrop={(e) => { e.preventDefault(); setDg(false); addPhotos(e.dataTransfer.files); }}
                onClick={() => fr.current?.click()}
                style={{
                  padding: '20px 16px',
                  borderTop: `1px solid ${bdr}`,
                  textAlign: 'center', cursor: 'pointer',
                  background: dg ? `${accent}10` : bg2,
                  transition: 'background .15s',
                }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: dg ? accent : tx0, marginBottom: 4, letterSpacing: -0.1 }}>
                  {dg ? 'Déposez les photos ici' : 'Importer des photos'}
                </div>
                <div style={{ fontFamily: mono, fontSize: 9, color: dg ? `${accent}cc` : tx2, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {dg ? 'Relâcher pour ajouter' : 'glisser-déposer ou cliquer'}
                </div>
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
