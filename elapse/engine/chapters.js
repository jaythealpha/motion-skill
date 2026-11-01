// The time bar is cut into chapters, each with its own stretch of real time and its own unit (minutes or years).
// Inside a chapter, real time is proportional to the bar. Every time is held as UTC milliseconds.
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

// a time: an ISO date-time with no zone (taken as written, so the same on every machine) or a decimal year
export function parseAt(at) {
  if (typeof at === 'number' && isFinite(at)) {
    const y = Math.floor(at), a = Date.UTC(y, 0, 1);
    return a + (at - y) * (Date.UTC(y + 1, 0, 1) - a);
  }
  const m = typeof at === 'string' && at.trim().replace(/Z$/, '').match(ISO);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}

const span = c => [c._start ?? parseAt(c.start), c._end ?? parseAt(c.end)];

export function chapterAt(model, t) {
  const cs = model.chapters;
  for (let i = 0; i < cs.length; i++) if (t < cs[i].bar[1] || i === cs.length - 1) return t < cs[i].bar[0] && i > 0 ? i - 1 : i;
  return 0;
}

export function barToTime(model, t) {
  const c = model.chapters[chapterAt(model, t)], [a, b] = span(c), [ba, bb] = c.bar;
  return a + (b - a) * (bb > ba ? (t - ba) / (bb - ba) : 0);
}

export function timeToBar(model, at) {
  const ms = typeof at === 'number' && Math.abs(at) > 1e7 ? at : parseAt(at);
  if (!isFinite(ms)) return NaN;
  for (const c of model.chapters) {
    const [a, b] = span(c);
    if (ms >= a && ms <= b) return c.bar[0] + (b > a ? (ms - a) / (b - a) : 0) * (c.bar[1] - c.bar[0]);
  }
  return NaN;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = n => String(n).padStart(2, '0');
// the real time at bar t: '4월 15일 01:00' / 'Apr 15, 01:00' in a minute chapter, '1996년' / '1996' in a year chapter
export function formatTime(model, t, lang = 'ko') {
  const c = model.chapters[chapterAt(model, t)], ms = barToTime(model, t);
  if(c.unit==='month'){const d=new Date(ms);return lang==='en'?`${d.getUTCFullYear()}.${p2(d.getUTCMonth()+1)}`:`${d.getUTCFullYear()}년 ${d.getUTCMonth()+1}월`;}
  if (c.unit === 'year') { const y = new Date(ms).getUTCFullYear(); return lang === 'en' ? String(y) : `${y}년`; }
  if(model.geometry?.type==='wtc-2001-2018'){const d=new Date(Math.floor(ms/1000)*1000),hm=`${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;return lang==='en'?`${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${hm}`:`${d.getUTCMonth()+1}월 ${d.getUTCDate()}일 ${hm}`;}
  const d = new Date(Math.round(ms / 60000) * 60000), hm = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
  return lang === 'en' ? `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${hm}` : `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${hm}`;
}
