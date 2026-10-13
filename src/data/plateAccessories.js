// Touch plate catalogue: plate sizes, colours, option lists and the accessories each plate takes.
// nodeSize = modules an accessory occupies.

export const MODULE_OPTIONS = [
  { label: '2 module', maxSlots: 2 },
  { label: '4 module', maxSlots: 4 },
  { label: '6 module', maxSlots: 6 },
  { label: '8 module', maxSlots: 8 },
  { label: '12 module', maxSlots: 12 },
];

export const MATERIAL_COLORS = [
  { code: '#000000', label: 'Black' },
  { code: '#bfc6cb', label: 'Space Grey' },
  { code: '#f4debe', label: 'Titanium' },
  { code: '#ffffff', label: 'White' },
  { code: '#616161', label: 'Gray' },
];

// No dimensions here: the plate's millimetre sizes are not confirmed by the owner.
export const PROFILE_OPTIONS = [
  { label: 'Standard' },
  { label: 'Slim' },
];

export const FINISH_OPTIONS = [
  { label: 'Matte', sub: 'Non-reflective finish' },
  { label: 'Gloss', sub: 'High-shine finish' },
  { label: 'Satin', sub: 'Soft semi-gloss' },
];

export const FRAME_OPTIONS = [
  { label: 'Square', sub: 'Sharp corners' },
  { label: 'Rounded', sub: 'Soft corners' },
  { label: 'Minimal', sub: 'Flush, no bezel' },
];

export const ACCESSORIES = {
  '2 module': [
    { name: '2 Switch (1-25A)', nodeSize: 1 },
    { name: '4 Switch', nodeSize: 2 },
    { name: 'Fan', nodeSize: 2 },
    { name: '2 Switch 1 Curtain', nodeSize: 2 },
    { name: '1 Curtain', nodeSize: 2 },
    { name: 'Socket 10A', nodeSize: 2 },
    { name: 'Socket 16A', nodeSize: 2 },
  ],
  '4 module': [
    { name: '4 Switch', nodeSize: 2 },
    { name: '2 Switch 1 Socket (1-10A)', nodeSize: 3 },
    { name: '2 Switch 1 Fan (1-25A)', nodeSize: 3 },
    { name: '4 Switch 1 Curtain', nodeSize: 3 },
    { name: '6 Switch 1 Curtain', nodeSize: 4 },
    { name: '4 Switch 1 Socket (1-10A)', nodeSize: 4 },
    { name: 'Fan 1 Socket (1-10A)', nodeSize: 4 },
    { name: '2 Switch 1 Fan 1 Curtain', nodeSize: 4 },
    { name: '4 Switch + 1 Fan', nodeSize: 4 },
    { name: '2 Fan', nodeSize: 4 },
    { name: '6 Switch (1-20A)', nodeSize: 3 },
    { name: '8 Switch (1-20A)', nodeSize: 4 },
  ],
  '6 module': [
    { name: '6 Switch (1-20A)', nodeSize: 3 },
    { name: '8 Switch (1-20A)', nodeSize: 4 },
    { name: '10 Switch (2-20A)', nodeSize: 5 },
    { name: '6 Switch 1 Fan', nodeSize: 5 },
    { name: '8 Switch 1 Fan', nodeSize: 6 },
    { name: '2 Switch 1 Fan 1 Socket (1-10A)', nodeSize: 5 },
    { name: '6 Switch 1 Socket (1-10A)', nodeSize: 5 },
    { name: '2 Switch 2 Socket (2-10A)', nodeSize: 5 },
    { name: '8 Switch 1 Curtain', nodeSize: 5 },
    { name: '4 Switch 1 Fan 1 Curtain', nodeSize: 5 },
    { name: '4 Switch + 2 Fan', nodeSize: 6 },
    { name: '4 Switch 1 Fan 1 Socket (1-10A)', nodeSize: 6 },
    { name: '8 Switch 1 Socket (1-10A)', nodeSize: 6 },
    { name: '4 Switch 2 Socket (2-10A)', nodeSize: 6 },
    { name: '6 Switch 1 Socket 1 Curtain', nodeSize: 6 },
  ],
  '8 module': [
    { name: '8 Switch 1 Fan', nodeSize: 6 },
    { name: '4 Switch 2 Fan 1 Socket', nodeSize: 8 },
    { name: '6 Switch 1 Fan 1 Socket', nodeSize: 7 },
    { name: '8 Switch 1 Fan 1 Socket', nodeSize: 7 },
    { name: '8 Switch 1 Curtain 1 Socket', nodeSize: 7 },
    { name: '4 Switch 1 Fan 1 Curtain 1 Socket', nodeSize: 7 },
    { name: '8 Switch 1 Socket', nodeSize: 7 },
    { name: '10 Switch 1 Socket', nodeSize: 7 },
    { name: '4 Switch + 2 Fan', nodeSize: 6 },
    { name: '6 Switch 1 Fan', nodeSize: 5 },
    { name: '10 Switch (2-20A)', nodeSize: 5 },
    { name: '4 Switch 1 Fan 1 Curtain', nodeSize: 5 },
    { name: '8 Switch 1 Curtain', nodeSize: 5 },
  ],
  '12 module': [
    { name: '12 Switch 2 Fan', nodeSize: 5 },
    { name: '20 Switch (4-20A)', nodeSize: 5 },
    { name: '14 Switch 2 Fan', nodeSize: 5 },
    { name: '8 Switch 4 Fan', nodeSize: 5 },
  ],
};
