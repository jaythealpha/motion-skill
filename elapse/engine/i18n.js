import{LANGS,tr,translatePack,setLocale}from'../shared/locale.js';
// Five local UI languages; English is the fresh-visit default.
const S = {
  ko: {
    style: '그림', color: '컬러', blueprint: '도면', xray: '투시', on: '켜기', off: '끄기',
    depth: '보기', simple: '간단히', detail: '자세히',
    play: '재생', pause: '멈춤', speed: '속도',
    sourced: '출처 있음', estimated: '추정', disputed: '학설이 갈림', projection: '예측',
    share: (k, p) => `${k} ${p}%`,
    warn: p => `출처가 있는 항목이 ${p}%뿐이에요. 나머지는 추정이에요.`,
    png: '이미지 저장', video: '영상 저장', recording: '녹화 중…', sources: '출처', about: '이 장소에 대하여',
    autoCam: '자동 카메라', resetView: '처음 시점', close: '닫기',
    shipTime: '(선박 시각)', projBadge: '여기부터는 예측이에요', lightNote: '실제로는 빛이 닿지 않는 깊이예요. 보이도록 밝게 그렸어요.',
    clock: '시각', levels: '구획 수위', depthG: '깊이', year: '연도', m: 'm',
    alternatives: '다른 학설', limitations: '알려진 한계', interpreted: s => `해석: ${s}`,
    gate2: { pass: '화면 자동 점검 통과', skipped: '화면 자동 점검 생략 (이 환경에 브라우저 없음)', fail: '화면 자동 점검 일부 실패', unknown: '화면 자동 점검 기록 없음' },
    method: '장면과 수치는 아래 공개 자료의 사실(시각, 치수, 순서, 탐사 기록)을 근거로 했고, 그림과 설명은 직접 작성했어요. 출처의 사진이나 문장은 쓰지 않았어요.',
    branch: '경로', noVideo: '이 브라우저는 영상 녹화를 지원하지 않아요.', chapter: '장', towers: (n, name) => `${name} ${n}개 높이`,
  },
  en: {
    style: 'Style', color: 'Colour', blueprint: 'Blueprint', xray: 'X-ray', on: 'On', off: 'Off',
    depth: 'View', simple: 'Simple', detail: 'Detailed',
    play: 'Play', pause: 'Pause', speed: 'Speed',
    sourced: 'Sourced', estimated: 'Estimated', disputed: 'Disputed', projection: 'Projection',
    share: (k, p) => `${k} ${p}%`,
    warn: p => `Only ${p}% of the items have a source. The rest are estimates.`,
    png: 'Save image', video: 'Save video', recording: 'Recording…', sources: 'Sources', about: 'About this place',
    autoCam: 'Auto camera', resetView: 'Reset view', close: 'Close',
    shipTime: "(ship's time)", projBadge: 'From here on: projection', lightNote: 'No light reaches this depth. It is drawn lit so it can be seen.',
    clock: 'Time', levels: 'Compartment levels', depthG: 'Depth', year: 'Year', m: 'm',
    alternatives: 'Other theories', limitations: 'Known limitations', interpreted: s => `Read as: ${s}`,
    gate2: { pass: 'Automatic screen check passed', skipped: 'Automatic screen check skipped (no browser here)', fail: 'Automatic screen check partly failed', unknown: 'No screen check recorded' },
    method: 'Scenes and figures rest on facts (times, sizes, order, survey records) from the public sources below; the drawings and text are our own. No photos or sentences from the sources are used.',
    branch: 'Path', noVideo: 'This browser cannot record video.', chapter: 'Chapter', towers: (n, name) => `${n}× ${name}`,
  },
};
export {LANGS};
export function strings(lang='en') { setLocale(lang,{url:false});return lang==='ko'?S.ko:lang==='en'?S.en:translatePack(S.en,lang); }
export const pick = (bi, lang='en') => typeof bi==='string'?tr(bi,lang):(bi ? bi[lang] ?? tr(bi.en || bi.ko || '',lang) : '');
