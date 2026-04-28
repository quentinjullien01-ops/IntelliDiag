export const bg0 = '#0a0a14';
export const bg1 = '#10101e';
export const bg2 = '#16162a';
export const bdr = '#ffffff0a';
export const bdr2 = '#ffffff12';
export const tx0 = '#f0eeeb';
export const tx1 = '#a8a4a0';
export const tx2 = '#666';
export const accent = '#ff6b35';
export const accent2 = '#ff8f5e';
export const mono = "'JetBrains Mono', monospace";

export const GRAVITE = {
  1: { bg: '#dcfce7', bd: '#22c55e', tx: '#166534', lb: 'Mineur' },
  2: { bg: '#fef9c3', bd: '#eab308', tx: '#854d0e', lb: 'Modere' },
  3: { bg: '#ffedd5', bd: '#f97316', tx: '#9a3412', lb: 'Significatif' },
  4: { bg: '#fee2e2', bd: '#ef4444', tx: '#991b1b', lb: 'Critique' },
};

export const RECO = {
  surveillance: { label: 'Surveillance', icon: 'eye' },
  investigation: { label: 'Investigation complementaire', icon: 'search' },
  travaux_legers: { label: 'Travaux legers', icon: 'tool' },
  travaux_lourds: { label: 'Travaux lourds', icon: 'build' },
  mise_en_securite: { label: 'Mise en securite', icon: 'alert' },
};

export const GRAV_OPTIONS = [
  { v: 1, l: '1 - Mineur' }, { v: 2, l: '2 - Modere' },
  { v: 3, l: '3 - Significatif' }, { v: 4, l: '4 - Critique' },
];
export const EVO_OPTIONS = [
  { v: 'stable', l: 'Stable' }, { v: 'evolutif', l: 'Evolutif' }, { v: 'urgent', l: 'Urgent' },
];
export const IMPACT_OPTIONS = [
  { v: 'esthetique', l: 'Esthetique' }, { v: 'fonctionnel', l: 'Fonctionnel' }, { v: 'structurel', l: 'Structurel' },
];
export const RECO_OPTIONS = [
  { v: 'surveillance', l: 'Surveillance' }, { v: 'investigation', l: 'Investigation' },
  { v: 'travaux_legers', l: 'Travaux legers' }, { v: 'travaux_lourds', l: 'Travaux lourds' },
  { v: 'mise_en_securite', l: 'Mise en securite' },
];
