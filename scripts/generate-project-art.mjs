import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Original, deterministic concept artwork. None of these images depict measured data.
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images');
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>\n`;
const save = (name, value) => fs.writeFileSync(path.join(directory, name), value);
const phase = (x, y) => .6 * (x * x - y * y) + .8 * x * y + .65 * Math.sin(x * 2.5 + y) - .35 * Math.cos(y * 3 - x);
const colors = [[20, 48, 68], [41, 99, 113], [153, 181, 175], [230, 214, 176], [201, 126, 82]];
function color(value) {
  const position = Math.max(0, Math.min(3.999, (value + 1.3) / 2.6 * 4));
  const index = Math.floor(position);
  const mix = position - index;
  return `rgb(${colors[index].map((channel, i) => Math.round(channel + (colors[index + 1][i] - channel) * mix)).join(',')})`;
}
let cells = '';
const count = 110;
const cx = 1110, cy = 470, radius = 440;
for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
  const x = -1 + col * 2 / count, y = -1 + row * 2 / count;
  if (x * x + y * y > 1.05) continue;
  cells += `<rect x="${(cx + x * radius).toFixed(2)}" y="${(cy + y * radius).toFixed(2)}" width="8.2" height="8.2" fill="${color(phase(x, y))}"/>`;
}
let contours = '';
for (let level = -1.2; level <= 1.3; level += .085) {
  let commands = '';
  const steps = 72;
  for (let row = 0; row < steps; row++) for (let col = 0; col < steps; col++) {
    const x = -1 + col * 2 / steps, y = -1 + row * 2 / steps, d = 2 / steps;
    const corners = [[x, y], [x + d, y], [x + d, y + d], [x, y + d]];
    const crossings = [];
    for (let edge = 0; edge < 4; edge++) {
      const a = corners[edge], b = corners[(edge + 1) % 4];
      const av = phase(...a), bv = phase(...b);
      if ((av < level) === (bv < level)) continue;
      const t = (level - av) / (bv - av);
      crossings.push([cx + (a[0] + (b[0] - a[0]) * t) * radius, cy + (a[1] + (b[1] - a[1]) * t) * radius]);
    }
    for (let i = 0; i + 1 < crossings.length; i += 2) commands += `M${crossings[i].map(n => n.toFixed(1)).join(' ')}L${crossings[i + 1].map(n => n.toFixed(1)).join(' ')}`;
  }
  contours += `<path d="${commands}" fill="none" stroke="#f9eedb" stroke-width="1" opacity=".36"/>`;
}
let spots = '';
for (let row = 0; row < 6; row++) for (let col = 0; col < 22; col++) {
  const x = 685 + col * 38 + Math.sin(row + col * .23) * 4;
  const y = 890 + row * 17 + Math.cos(col * .3) * 5;
  spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="${(col + row) % 5 === 0 ? '#dda67b' : '#80b1c2'}" opacity="${.65 - row * .08}"/>`;
}
save('cover-wavefront.svg', svg(1600, 1000, `<defs><clipPath id="aperture"><circle cx="${cx}" cy="${cy}" r="${radius}"/></clipPath></defs><path fill="#152638" d="M0 0h1600v1000H0z"/><g clip-path="url(#aperture)"><g shape-rendering="crispEdges">${cells}</g>${contours}</g><circle cx="${cx}" cy="${cy}" r="${radius}" stroke="#d6d8c4" stroke-opacity=".3" fill="none"/>${spots}`));

let seed = 777;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
let events = '';
for (let i = 0; i < 1250; i++) {
  const x = random() * 1200, y = random() * 790;
  events += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.5 + random() * 1.1).toFixed(1)}" fill="#4c7288" opacity="${(.08 + random() * .18).toFixed(2)}"/>`;
}
let tracks = '';
for (let trail = 0; trail < 8; trail++) {
  let trajectory = '';
  for (let i = 0; i < 160; i++) {
    const t = i / 159;
    const x = 110 + t * 980;
    const y = 650 - t * 390 - Math.sin(t * 4.7) * 75 + trail * 3.4;
    trajectory += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    if (i % 2 === 0) events += `<circle cx="${(x + (random() - .5) * 13).toFixed(1)}" cy="${(y + (random() - .5) * 14).toFixed(1)}" r="${(1 + random() * 1.8).toFixed(1)}" fill="${trail % 3 === 0 ? '#b9623f' : '#305a73'}" opacity="${(.3 + t * .6).toFixed(2)}"/>`;
  }
  tracks += `<path d="${trajectory}" fill="none" stroke="#385f75" stroke-width=".7" opacity=".12"/>`;
}
save('cover-traceformer.svg', svg(1200, 790, `<path fill="#e5e5dd" d="M0 0h1200v790H0z"/>${tracks}${events}<path d="M850 265v-24h24m78 0h24v24m0 78v24h-24m-78 0h-24v-24" fill="none" stroke="#b9623f" stroke-width="2"/><circle cx="912" cy="303" r="4" fill="#b9623f"/>`));

save('cover-vehicle.svg', svg(800, 920, `<g fill="none" stroke="#304e61" stroke-width="2.2" stroke-linejoin="round"><path d="M116 92h306v190H116z"/><path d="M116 126h306M139 109h4m13 0h4m13 0h4"/><path d="M146 162h109m-109 26h170m-170 26h133m-133 26h79" stroke-opacity=".4"/><path d="M270 282v95h305v141" stroke-dasharray="6 8"/><path d="M184 536l227-99 239 134-227 110z" fill="#e4e7df"/><path d="M184 536v129l239 136V681m227-110v128L423 801" fill="#e4e7df"/><path d="M328 474v-66l132-59 132 76v115"/><path d="M460 349v129l132 62m-264-132l132 70"/><path d="M345 416l98 57v-96m31 5v88l99 56v-89z" stroke-opacity=".5"/><ellipse cx="267" cy="733" rx="34" ry="49" transform="rotate(-24 267 733)" fill="#f5f3ee"/><ellipse cx="536" cy="765" rx="34" ry="49" transform="rotate(24 536 765)" fill="#f5f3ee"/><path d="M185 665l238 136 227-102"/><circle cx="270" cy="377" r="5" fill="#bc6c48" stroke="none"/><circle cx="575" cy="518" r="5" fill="#bc6c48" stroke="none"/></g><g font-family="Consolas,monospace" font-size="22" fill="#304e61"><text x="455" y="345">MQTT</text><text x="330" y="602" font-size="36">ROS 2</text><text x="596" y="841">CAN</text></g>`));
