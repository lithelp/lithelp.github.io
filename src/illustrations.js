// Small vector illustrations, one per text. Each is drawn on a 240×160 canvas.
// bg(top, bottom) paints the rounded background; the rest are simple shapes in the site palette.

const bg = (a, b) => `<rect width="240" height="160" rx="16" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
const stars = pts => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r || 1.4}" fill="#fff" opacity=".85"/>`).join('');

const ART = {
  'Elements-of-Poetry---You-must-read-this': bg('#eef0ff', '#c9cdfb') +
    '<path d="M40 50c25-10 55-10 80 4v76c-25-14-55-14-80-4Z" fill="#fff" stroke="#4f46e5" stroke-width="3"/>' +
    '<path d="M200 50c-25-10-55-10-80 4v76c25-14 55-14 80-4Z" fill="#fff" stroke="#4f46e5" stroke-width="3"/>' +
    '<path d="M55 70h48M55 82h48M55 94h40M137 70h48M137 82h48M137 94h40" stroke="#a5a8f3" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M190 24c-14 10-30 34-38 58l6 3c10-24 24-46 36-58Z" fill="#7c3aed"/><path d="M152 82l-4 12 10-7Z" fill="#312e81"/>',

  'To-the-Nile-by-Keats': bg('#ffd89a', '#ffefcf') +
    '<circle cx="182" cy="44" r="18" fill="#f59e0b"/>' +
    '<path d="M60 108 92 56l32 52Z" fill="#d97706"/><path d="M92 56l32 52h-14Z" fill="#b45309"/>' +
    '<path d="M118 108 140 74l22 34Z" fill="#e8a33d"/><path d="M140 74l22 34h-9Z" fill="#c2410c"/>' +
    '<path d="M0 118c40-10 70 6 120 0s80-14 120-4v46H0Z" fill="#0284c7"/>' +
    '<path d="M0 132c40-8 80 4 120-2s80-10 120-2" stroke="#7dd3fc" stroke-width="3" fill="none"/>' +
    '<path d="M24 120v-26M30 120v-20M36 120v-28M204 116v-24M210 116v-18" stroke="#059669" stroke-width="3" stroke-linecap="round"/>',

  'A-Bird-came-down-the-Walk': bg('#e6f7f5', '#bfe9e3') +
    '<path d="M0 120c60-14 180-14 240 0v40H0Z" fill="#d6c3a5"/><path d="M90 160 110 112h20l20 48Z" fill="#e9dcc6"/>' +
    '<ellipse cx="122" cy="96" rx="22" ry="15" fill="#64748b"/><circle cx="142" cy="84" r="10" fill="#475569"/>' +
    '<path d="M151 84l10 3-10 3Z" fill="#f59e0b"/><circle cx="145" cy="82" r="2" fill="#fff"/>' +
    '<path d="M102 96l-16-6 4 10Z" fill="#334155"/><path d="M118 111v8M126 111v8" stroke="#334155" stroke-width="2.5"/>' +
    '<path d="M60 124c6-6 12 6 18 0" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="190" cy="126" rx="7" ry="5" fill="#1e293b"/><path d="M40 70c0-6 6-12 6-12s6 6 6 12a6 6 0 0 1-12 0Z" fill="#38bdf8"/>',

  'Farewell-to-Barn-Stack-and-Tree': bg('#ffe1c4', '#fff4e3') +
    '<path d="M0 116c80-14 160-14 240 0v44H0Z" fill="#86b65a"/>' +
    '<path d="M38 116V80l30-22 30 22v36Z" fill="#c2410c"/><path d="M30 82l38-30 38 30" stroke="#7c2d12" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
    '<rect x="58" y="94" width="20" height="22" fill="#7c2d12"/>' +
    '<path d="M118 116c0-26 12-40 24-40s24 14 24 40Z" fill="#e8b84a"/><path d="M124 100h36M121 108h42" stroke="#c99a2e" stroke-width="2"/>' +
    '<rect x="194" y="86" width="7" height="30" fill="#7c4a1e"/><circle cx="197" cy="74" r="22" fill="#2f7d4a"/>' +
    '<path d="M0 140c60-6 120 6 240-4" stroke="#38bdf8" stroke-width="5" fill="none"/>',

  'To-the-Evening-Star': bg('#1e1b4b', '#4c3d8f') +
    stars([[30, 30], [60, 50, 1], [96, 22], [150, 36, 1], [210, 28], [190, 60, 1]]) +
    '<circle cx="120" cy="58" r="22" fill="#fde68a" opacity=".22"/>' +
    '<path d="m120 40 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1Z" fill="#fde68a"/>' +
    '<path d="M0 124c40-22 80-22 120-6s80 10 120-4v46H0Z" fill="#312e81"/>' +
    '<ellipse cx="70" cy="132" rx="9" ry="6" fill="#e0e7ff"/><ellipse cx="90" cy="136" rx="8" ry="5" fill="#e0e7ff"/><ellipse cx="160" cy="130" rx="9" ry="6" fill="#e0e7ff"/>',

  'The-Eagle-by-Tennyson': bg('#bfdbfe', '#e0f2fe') +
    '<circle cx="196" cy="34" r="16" fill="#fbbf24"/>' +
    '<path d="M0 120c30-6 60 6 90 0s70-6 100 0 40 6 50 2v38H0Z" fill="#0369a1"/>' +
    '<path d="M10 132c20-4 30 4 50 0M80 140c20-4 30 4 50 0M150 132c20-4 30 4 50 0" stroke="#7dd3fc" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M110 124 140 60l14 10 22 54Z" fill="#57534e"/><path d="M140 60l14 10 6 14-20-10Z" fill="#78716c"/>' +
    '<path d="M120 60c10-12 22-14 30-10-8 2-14 6-16 12 10-4 22-2 30 6-12-2-22 0-30 6Z" fill="#422006"/>' +
    '<circle cx="146" cy="52" r="5" fill="#fef3c7"/><path d="M150 52l7 2-7 2Z" fill="#f59e0b"/>',

  'War-is-Kind': bg('#e7e5e4', '#a8a29e') +
    '<path d="M0 124c60-8 180-8 240 0v36H0Z" fill="#78716c"/>' +
    '<path d="M70 126V92M58 104h24M120 126V96M110 106h20M170 126V90M157 102h26" stroke="#44403c" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M196 126V36" stroke="#57534e" stroke-width="4"/><path d="M198 38h34l-8 12 8 12h-34Z" fill="#e11d48"/>' +
    '<ellipse cx="34" cy="108" rx="18" ry="8" fill="#b45309"/><rect x="16" y="96" width="36" height="12" fill="#d97706"/><ellipse cx="34" cy="96" rx="18" ry="8" fill="#fde68a"/>',

  'I-know-why-the-Caged-Bird-Sings': bg('#ffe4cc', '#fff4e3') +
    '<circle cx="196" cy="40" r="20" fill="#f97316"/>' +
    '<path d="M150 70c8-6 16-6 22 0-6-2-12 0-16 4 8-2 14 0 18 4-8-2-16-2-24 2Z" fill="#7c3aed"/>' +
    '<path d="M60 52c0-20 60-20 60 0v76H60Z" fill="none" stroke="#475569" stroke-width="3"/>' +
    '<path d="M72 46v82M84 42v86M96 41v87M108 42v86" stroke="#475569" stroke-width="2"/><path d="M54 128h72" stroke="#334155" stroke-width="6" stroke-linecap="round"/>' +
    '<ellipse cx="90" cy="104" rx="12" ry="9" fill="#0d9488"/><circle cx="100" cy="96" r="6" fill="#0f766e"/><path d="M105 96l6 2-6 2Z" fill="#f59e0b"/>' +
    '<path d="M98 84c2-4 6-4 8-2M104 78c2-4 8-4 10 0" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/>',

  'poem-by-wislawa': bg('#e2e8f0', '#cbd5e1') +
    '<rect x="20" y="58" width="90" height="70" fill="#64748b"/><rect x="40" y="88" width="24" height="40" fill="#1e293b"/><rect x="74" y="76" width="22" height="18" fill="#fde68a"/>' +
    '<rect x="20" y="48" width="90" height="12" fill="#e11d48"/><path d="M0 128h240v32H0Z" fill="#475569"/><path d="M0 142h240" stroke="#f8fafc" stroke-width="3" stroke-dasharray="14 10"/>' +
    '<circle cx="176" cy="66" r="34" fill="#fff" stroke="#1e293b" stroke-width="5"/><path d="M176 66V44M176 66l14 8" stroke="#e11d48" stroke-width="4" stroke-linecap="round"/>' +
    '<text x="176" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#1e293b">13:20</text>',

  'Breakfast-by-Jaques-Prevert': bg('#fef3c7', '#fde68a') +
    '<ellipse cx="120" cy="128" rx="62" ry="12" fill="#fff" stroke="#d6b26e" stroke-width="2"/>' +
    '<path d="M84 84h72l-8 40H92Z" fill="#fff" stroke="#b45309" stroke-width="3"/><path d="M156 92c16 0 16 22 0 22" stroke="#b45309" stroke-width="4" fill="none"/>' +
    '<ellipse cx="120" cy="86" rx="36" ry="6" fill="#7c4a1e"/>' +
    '<circle cx="104" cy="48" r="8" fill="none" stroke="#94a3b8" stroke-width="3"/><circle cx="124" cy="34" r="10" fill="none" stroke="#94a3b8" stroke-width="3" opacity=".8"/><circle cx="146" cy="20" r="7" fill="none" stroke="#94a3b8" stroke-width="3" opacity=".6"/>',

  'Once-upon-a-Time-by-Gabriel-Okara': bg('#ede9fe', '#ddd6fe') +
    '<path d="M44 44h56v34c0 22-12 36-28 36S44 100 44 78Z" fill="#fff" stroke="#7c3aed" stroke-width="3"/><circle cx="62" cy="70" r="4" fill="#4c1d95"/><circle cx="82" cy="70" r="4" fill="#4c1d95"/><path d="M60 88c8 8 16 8 24 0" stroke="#4c1d95" stroke-width="3" fill="none"/>' +
    '<path d="M140 44h56v34c0 22-12 36-28 36s-28-14-28-36Z" fill="#c4b5fd" stroke="#6d28d9" stroke-width="3"/><path d="M152 70h12M172 70h12" stroke="#4c1d95" stroke-width="4" stroke-linecap="round"/><path d="M156 92h24" stroke="#4c1d95" stroke-width="3"/>' +
    '<path d="M112 126c0-10 16-10 16 0" stroke="#e11d48" stroke-width="3" fill="none"/><path d="M108 112l12 14 12-14" stroke="#e11d48" stroke-width="3" fill="none" stroke-linejoin="round"/>',

  'Richard-Cory': bg('#e0f2fe', '#bae6fd') +
    '<path d="M0 124h240v36H0Z" fill="#94a3b8"/><rect x="20" y="70" width="34" height="54" fill="#cbd5e1"/><rect x="186" y="60" width="34" height="64" fill="#cbd5e1"/>' +
    '<rect x="104" y="54" width="32" height="12" rx="2" fill="#1e293b"/><rect x="110" y="26" width="20" height="30" fill="#1e293b"/>' +
    '<path d="M104 72h32l-4 52h-24Z" fill="#1e3a8a"/><circle cx="120" cy="64" r="0" fill="none"/>' +
    '<path d="m98 22 8 10 6-14 8 14 8-14 6 14 8-10-4 16H102Z" fill="#fbbf24" transform="translate(0 -8)"/>' +
    '<circle cx="70" cy="140" r="7" fill="#fbbf24"/><circle cx="168" cy="144" r="6" fill="#fbbf24"/>',

  'Big-Match-1983': bg('#fee2e2', '#fecaca') +
    '<path d="M0 126h240v34H0Z" fill="#65a30d"/>' +
    '<path d="M98 126V64M120 126V64M142 126V64" stroke="#fef3c7" stroke-width="6" stroke-linecap="round"/><path d="M96 62h48" stroke="#b45309" stroke-width="4"/>' +
    '<path d="M180 126c-14-10-10-30 0-44 2 12 10 14 12 4 10 12 14 30 0 40Z" fill="#f97316"/><path d="M184 126c-6-6-4-16 2-22 2 8 8 10 8 2 4 8 4 16-2 20Z" fill="#fde047"/>' +
    '<path d="M40 126c-12-8-8-24 0-34 2 10 8 10 10 2 8 10 10 24 0 32Z" fill="#ef4444"/>' +
    '<circle cx="60" cy="36" r="10" fill="#9ca3af" opacity=".6"/><circle cx="76" cy="28" r="14" fill="#9ca3af" opacity=".45"/>',

  'The-Earthen-Goblet': bg('#ffedd5', '#fed7aa') +
    '<path d="M0 132h240v28H0Z" fill="#c2a27a"/>' +
    '<path d="M84 40h72c0 34-14 52-36 54-22-2-36-20-36-54Z" fill="#b91c1c"/><path d="M114 94h12v24h-12Z" fill="#991b1b"/><ellipse cx="120" cy="124" rx="28" ry="8" fill="#991b1b"/>' +
    '<ellipse cx="120" cy="40" rx="36" ry="6" fill="#7f1d1d"/><path d="M96 54c6 10 14 16 24 18" stroke="#fca5a5" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M190 132V96" stroke="#15803d" stroke-width="3"/><circle cx="190" cy="88" r="8" fill="#f97316"/><circle cx="190" cy="88" r="3" fill="#fde047"/><path d="M190 112c-8-2-12 2-12 6M190 106c8-2 12 2 12 6" stroke="#15803d" stroke-width="3" fill="none"/>',

  'poem-about-camel': bg('#fde68a', '#fef3c7') +
    '<circle cx="196" cy="38" r="16" fill="#f59e0b"/><path d="M0 122c50-14 110-14 160 0s60 8 80 4v34H0Z" fill="#e8b84a"/>' +
    '<path d="M70 96c0-18 10-30 24-30 10 0 14 10 20 10s10-14 22-14c14 0 20 18 20 34Z" fill="#b45309"/>' +
    '<path d="M156 96c6-10 8-26 18-32 6-4 14 0 12 6l-8 4c-6 4-6 16-10 26Z" fill="#b45309"/><circle cx="180" cy="66" r="2" fill="#1c1917"/>' +
    '<path d="M80 96v30M92 96v30M136 96v30M148 96v30" stroke="#92400e" stroke-width="6" stroke-linecap="round"/>',

  'Father-and-Son-by-Cat-Stevens': bg('#dcfce7', '#bbf7d0') +
    '<path d="M0 126c60-10 180-10 240 0v34H0Z" fill="#4ade80"/><path d="M200 126c-30-20-60-34-90-40" stroke="#fef3c7" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<circle cx="76" cy="58" r="11" fill="#1e3a8a"/><path d="M62 74h28l-4 34h-20Z" fill="#1e3a8a"/><path d="M68 108v18M84 108v18" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="132" cy="70" r="9" fill="#0d9488"/><path d="M121 83h22l-3 26h-16Z" fill="#0d9488"/><path d="M126 109v17M138 109v17" stroke="#0d9488" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M150 90l14-8" stroke="#0d9488" stroke-width="4" stroke-linecap="round"/><path d="M190 40c6-8 16-8 20 0" stroke="#15803d" stroke-width="3" fill="none"/>',

  'the-poem-fear': bg('#e0f2fe', '#f0f9ff') +
    '<path d="M60 98c18-22 44-30 62-24-14 2-26 10-32 20 18-8 40-6 52 6-20-4-40-2-56 10Z" fill="#1e3a8a"/><path d="M118 74l12-4-8 10Z" fill="#1e3a8a"/><path d="M60 98l-26 10 18-16Z" fill="#1e3a8a"/>' +
    '<path d="M150 50l10 10 8-16 8 16 10-10-4 22h-28Z" fill="#fbbf24"/>' +
    '<path d="M150 118c16-8 30-8 46 0v20h-46Z" fill="#fde68a" stroke="#d6b26e" stroke-width="2"/><path d="M146 138h54" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="173" cy="114" r="6" fill="#fecaca"/>',

  'poem-about-clowns-wife': bg('#fce7f3', '#fbcfe8') +
    '<circle cx="120" cy="88" r="40" fill="#fff" stroke="#db2777" stroke-width="3"/>' +
    '<path d="M86 60 120 14l34 46Z" fill="#7c3aed"/><circle cx="120" cy="14" r="7" fill="#fbbf24"/>' +
    '<circle cx="104" cy="82" r="5" fill="#1e293b"/><circle cx="136" cy="82" r="5" fill="#1e293b"/><circle cx="120" cy="96" r="9" fill="#e11d48"/>' +
    '<path d="M100 110c12-6 28-6 40 0" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M104 120c4 6 6 8 6 12" stroke="#38bdf8" stroke-width="3" fill="none"/>' +
    '<circle cx="76" cy="92" r="12" fill="#f97316"/><circle cx="164" cy="92" r="12" fill="#f97316"/>',

  'Upside-Down': bg('#ecfccb', '#d9f99d') +
    '<path d="M0 30h240" stroke="#65a30d" stroke-width="0"/><path d="M0 0h240v34c-60 10-180 10-240 0Z" fill="#84cc16"/>' +
    '<circle cx="120" cy="116" r="12" fill="#f59e0b"/><path d="M106 102h28l-4-34h-20Z" fill="#4f46e5"/><path d="M112 68V46M128 68V46" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M106 96l-14 10M134 96l14 10" stroke="#4f46e5" stroke-width="5" stroke-linecap="round"/><path d="M114 120c4 3 8 3 12 0" stroke="#7c2d12" stroke-width="2" fill="none"/>' +
    '<text x="40" y="132" font-family="Georgia, serif" font-weight="700" font-size="20" fill="#3f6212">ton</text><text x="200" y="140" font-family="Georgia, serif" font-weight="700" font-size="20" fill="#3f6212" transform="rotate(180 200 134)">ton</text>',

  'The-Huntsman': bg('#dcfce7', '#a7f3d0') +
    '<path d="M0 124c60-8 180-8 240 0v36H0Z" fill="#65a30d"/><path d="M20 124l6-22 6 22M200 124l6-26 6 26M220 124l5-18 5 18" fill="#15803d"/>' +
    '<path d="M60 30 190 120" stroke="#78350f" stroke-width="5" stroke-linecap="round"/><path d="M52 24l18 2-6 14Z" fill="#94a3b8"/>' +
    '<path d="M98 108c0-22 12-34 26-34s26 12 26 34c0 6-4 10-8 10v8h-36v-8c-4 0-8-4-8-10Z" fill="#f5f5f4" stroke="#57534e" stroke-width="2.5"/>' +
    '<circle cx="114" cy="100" r="6" fill="#292524"/><circle cx="134" cy="100" r="6" fill="#292524"/><path d="M124 108l-3 6h6Z" fill="#292524"/><path d="M112 120v6M120 120v6M128 120v6M136 120v6" stroke="#57534e" stroke-width="2"/>',

  'They-said-the-House': bg('#1e1b4b', '#3b2f73') +
    stars([[30, 24], [70, 40, 1], [210, 22], [180, 48, 1]]) +
    '<path d="M196 30a18 18 0 1 0 6 28 14 14 0 1 1-6-28Z" fill="#fde68a"/>' +
    '<path d="M40 130V76l40-30 40 30v54Z" fill="#312e81"/><path d="M32 78l48-38 48 38" stroke="#1e1b4b" stroke-width="6" fill="none"/>' +
    '<rect x="56" y="88" width="14" height="16" fill="#fde68a" opacity=".85"/><rect x="90" y="88" width="14" height="16" fill="#1e1b4b"/><rect x="72" y="108" width="16" height="22" fill="#1e1b4b"/>' +
    '<path d="M150 120c0-28 10-44 26-44s26 16 26 44l-6-6-7 6-6-6-7 6-6-6Z" fill="#f8fafc" opacity=".92"/><circle cx="168" cy="96" r="3.5" fill="#1e1b4b"/><circle cx="184" cy="96" r="3.5" fill="#1e1b4b"/><ellipse cx="176" cy="106" rx="4" ry="5" fill="#1e1b4b"/>' +
    '<path d="M0 130h240v30H0Z" fill="#1e1b4b"/>',
};

// Returns the SVG markup for a slug, or '' if there is no illustration.
function illustration(slug, label) {
  const art = ART[slug];
  if (!art) return '';
  const id = 'g-' + slug.replace(/[^a-z0-9]/gi, '').slice(0, 24);
  return `<svg class="illus" viewBox="0 0 240 160" role="img" aria-label="Illustration for ${label}">${art.replace(/url\(#g\)/g, `url(#${id})`).replace(/id="g"/g, `id="${id}"`)}</svg>`;
}

module.exports = { illustration, hasIllustration: slug => !!ART[slug] };
