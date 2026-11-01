# 설치와 첫 실행

현재 검증 대상은 **Claude Code의 폴더형 스킬 설치**입니다. 데모 HTML을 보는 데에는 Claude Code나 Node가 필요하지 않습니다.

## 1. 준비

- 생성 작업: Claude Code와 자료를 조사할 수 있는 실행 환경.
- 스크립트: Node.js 22 이상 권장. 데이터 검사·빌드는 Node 18 이상, 전체 화면 검사는 Node 22 이상이 필요합니다.
- 화면 검사: Google Chrome 또는 Chromium, WebGL. npm 패키지 설치는 필요 없습니다.
- 아래 명령은 macOS의 터미널 기준입니다. Linux·Windows·다른 에이전트에서의 설치는 이번 공개 전 점검에서 검증하지 않았습니다.

## 2. 저장소 받기

```bash
git clone https://github.com/jaythealpha/motion-skill.git
cd motion-skill
```

공개 저장소이므로 clone에 GitHub 로그인이 필요하지 않습니다. 스킬 생성 작업에는 별도로 Claude Code와 해당 도구 권한이 필요합니다.

## 3. 스킬 복사

저장소 최상위 폴더에서 실행합니다. 기존 설치가 있으면 덮어쓰지 않고 건너뜁니다.

```bash
skill_root="$HOME/.claude/skills"
mkdir -p "$skill_root"
for skill_name in unfold elapse; do
  if [ -e "$skill_root/$skill_name" ]; then
    printf 'Already exists; preserved: %s\n' "$skill_root/$skill_name"
  else
    cp -R "$skill_name" "$skill_root/$skill_name"
    printf 'Installed: %s\n' "$skill_root/$skill_name"
  fi
done
```

`SKILL.md` 하나만 복사하면 실행되지 않습니다. `engine/`, `scripts/`, `shared/`, `references/`, 예시 데이터 등 **폴더 전체**가 필요합니다. 각 스킬의 `shared/`는 이미 포함되어 있어 설치 후 원본 저장소 밖에서도 빌드할 수 있습니다.

Claude Code의 개인 스킬 위치는 `~/.claude/skills/<이름>/SKILL.md`입니다. 환경별 차이는 [공식 스킬 문서](https://code.claude.com/docs/en/skills)를 확인하세요.

## 4. Claude Code에서 사용

새 세션을 열고 다음처럼 요청합니다. `/unfold` 또는 `/elapse`가 보이지 않으면 설치 위치의 `SKILL.md`와 폴더 이름을 확인하고 새 세션에서 다시 시도하세요. 기존 설치를 건너뛴 경우에는 새 버전으로 갱신된 것이 아닙니다.

```text
/unfold 갤럭시 S24의 구조를 설명하는 조립 애니메이션을 만들어줘.
/elapse 타이타닉의 침수부터 해저 상태까지 시간순으로 보여줘.
```

자료 조사와 모델 생성은 AI 작업입니다. 도구 권한·네트워크·사용 중인 AI 요금제의 제약이 적용되며, 무인 성공을 보장하지 않습니다. 새 요청으로 전체 작업을 생성하는 과정은 이번 점검의 설치·빌드 재현 검사와 구분합니다.

## 5. 설치된 폴더만으로 빌드 확인

아래 명령은 연구나 AI 호출 없이 포함된 예시를 검사·빌드합니다.

```bash
mkdir -p "$PWD/motion-output"
node "$HOME/.claude/skills/unfold/scripts/check_model.mjs" "$HOME/.claude/skills/unfold/examples/galaxy-s24.json" --official 70.6,147,7.6
node "$HOME/.claude/skills/unfold/scripts/build.mjs" "$HOME/.claude/skills/unfold/examples/galaxy-s24.json" "$PWD/motion-output/galaxy-s24.html"
node "$HOME/.claude/skills/elapse/scripts/check_model.mjs" "$HOME/.claude/skills/elapse/examples/titanic.json" --official 269.1,28.2,22.3
node "$HOME/.claude/skills/elapse/scripts/build.mjs" "$HOME/.claude/skills/elapse/examples/titanic.json" "$PWD/motion-output/titanic.html"
```

새 빌드의 화면 검사 상태는 기본적으로 통과가 아닙니다. 실제 검사를 실행하세요.

```bash
node "$HOME/.claude/skills/elapse/scripts/shoot.mjs" "$PWD/motion-output/titanic.html" "$PWD/motion-output/titanic-shots"
```

Chrome을 찾지 못하면 실행 파일의 절대 경로를 `CHROME`에 지정할 수 있습니다.

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node "$HOME/.claude/skills/elapse/scripts/shoot.mjs" "$PWD/motion-output/titanic.html" "$PWD/motion-output/titanic-shots"
```

### 건축 예시 빌드

```bash
node "$HOME/.claude/skills/elapse/scripts/check_model.mjs" "$HOME/.claude/skills/elapse/examples/world-trade-center.json"
node "$HOME/.claude/skills/elapse/scripts/build.mjs" "$HOME/.claude/skills/elapse/examples/world-trade-center.json" "$PWD/motion-output/world-trade-center.html"
```

데모 모델과 출력 HTML에는 라이선스 고지가 포함됩니다. 외부 자료의 권리는 [제3자 고지](THIRD_PARTY_NOTICES.md)를 확인하세요.

## 6. 데모 보기

[데모 목록](DEMOS.md)을 확인하세요. GitHub 파일 보기 화면은 HTML 앱을 실행하지 않습니다. 저장소를 받은 뒤 로컬 서버를 열거나, HTML 원본을 내려받아 브라우저에서 여세요. [GitHub Pages 데모 목록](https://jaythealpha.github.io/motion-skill/)에서는 다운로드 없이 바로 실행할 수 있습니다.

## 업데이트와 제거

업데이트 전 기존 설치 폴더를 별도 위치에 복사해 보관하고, 새 버전으로 교체하세요. 위 설치 명령은 기존 설치를 갱신하지 않습니다. 제거하려면 본인이 설치한 `~/.claude/skills/unfold` 또는 `elapse` 폴더를 직접 관리하세요. 자동 삭제 명령은 제공하지 않습니다.
