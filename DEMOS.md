# 데모 실행

이 저장소의 데모는 단일 HTML입니다. **GitHub의 HTML 파일 링크는 소스 보기이며 실행 화면이 아닙니다.** 현재 이 모노레포의 공개 호스팅 주소는 제공하지 않습니다.

## 로컬에서 보기

저장소 최상위에서 실행합니다(Python 3 필요).

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

이미 같은 포트를 사용 중이면 `8766`처럼 다른 포트를 선택하고 아래 주소의 포트도 바꾸세요. 서버는 해당 터미널에서 `Ctrl+C`로 종료합니다. 인터넷에 공개하는 배포 명령이 아닙니다.

| 예시 | 저장소 파일 | 서버 실행 후 주소 |
|---|---|---|
| 갤럭시 S24 | [HTML](unfold/examples/galaxy-s24.html) | http://127.0.0.1:8765/unfold/examples/galaxy-s24.html |
| 아이폰 17 Pro | [HTML](unfold/examples/iphone-17-pro.html) | http://127.0.0.1:8765/unfold/examples/iphone-17-pro.html |
| 아이폰 듀오 | [HTML](unfold/examples/iphone-duo.html) | http://127.0.0.1:8765/unfold/examples/iphone-duo.html |
| 갤럭시 Z 폴드8 — 알려진 구조 불일치 포함 | [HTML](unfold/examples/galaxy-z-fold8.html) | http://127.0.0.1:8765/unfold/examples/galaxy-z-fold8.html |
| 갤럭시 Z 플립8 — 추정 중심 | [HTML](unfold/examples/galaxy-z-flip8.html) | http://127.0.0.1:8765/unfold/examples/galaxy-z-flip8.html |
| 남타워 충돌 대표 장면 | [HTML](elapse/examples/wtc-impact-study.html) | http://127.0.0.1:8765/elapse/examples/wtc-impact-study.html |
| 세계무역센터 ·9·11과 재건 | [HTML](elapse/examples/world-trade-center.html) | http://127.0.0.1:8765/elapse/examples/world-trade-center.html |
| 노트르담 · 화재와 복원 | [HTML](elapse/examples/notre-dame.html) | http://127.0.0.1:8765/elapse/examples/notre-dame.html |
| 에펠탑 건설 · 추정 형상 포함 | [HTML](elapse/examples/eiffel-tower.html) | http://127.0.0.1:8765/elapse/examples/eiffel-tower.html |
| 타이타닉 | [HTML](elapse/examples/titanic.html) | http://127.0.0.1:8765/elapse/examples/titanic.html |
| 브리타닉 | [HTML](elapse/examples/britannic.html) | http://127.0.0.1:8765/elapse/examples/britannic.html |
| 타이타닉 분리 장면 연구 | [HTML](elapse/examples/titanic-break-study.html) | http://127.0.0.1:8765/elapse/examples/titanic-break-study.html |

타이타닉·WTC 대표 장면의 “전체 타임라인” 링크는 각각 같은 폴더의 `titanic.html`·`world-trade-center.html`을 가리킵니다. 그 링크도 사용할 때에는 대표 장면과 대응하는 전체 타임라인 HTML을 함께 받아 두세요. 장면 자체는 단독 실행됩니다.

## 확인할 흐름

- 시간 바를 앞뒤로 이동하고 재생·멈춤·속도를 선택합니다.
- Unfold: 층층이/매트 정렬, 컬러/도면, 접기 조작(폴더블), 매뉴얼 모드를 확인합니다.
- Elapse: 장 버튼, 투시, 출처와 추정·학설·예측 표시를 확인합니다.
- 설명과 실제 데이터의 구분을 보세요. “자료 확인”은 내부 좌표나 수리 절차의 정확성을 보증하지 않습니다.

## 한계

교육·설명용 예시이며 제조사 공식 도면이나 승인된 수리 매뉴얼이 아닙니다. 폴더블의 내부 위치·치수·일부 구조는 추정이며 플립8은 이전 세대 자료도 사용합니다. 폴드8에는 배터리 접근 방향과 출처 설명이 충돌하는 알려진 제한이 있습니다. 타이타닉·브리타닉의 물·입자 효과는 유체 시뮬레이션이 아닙니다. 상세 제한과 출처는 각 데모 안에 표시됩니다.

에펠탑은 1887–1889년 시공 도해입니다. 주요 공정일은 공식 기록을 사용하며, 철골·가설물·기초·중간 높이와 조립 순서는 추정입니다. 300m는 주구조 기준이고 깃대·정상 부속 및 현대 안테나는 재현하지 않습니다. 수위·수심 대신 월별 기록·도해 시공 높이·기준 치수를 표시합니다.

노트르담은 2019년 화재 전부터 2024년 12월 재개관까지를 다룹니다. 손상·복원 부위 7곳을 탐사하며 볼트에서는 지붕을 숨긴 절개 보기를 제공합니다. 공식 기록과 추정 형상을 구분하고, 재개관을 모든 보존 공사의 종료로 표현하지 않습니다. 화염·연기·붕괴·중간 복원은 물리 시뮬레이션이 아닌 교육용 추정 도해입니다.

세계무역센터는2001년9·11의 두 항공기 충돌, 쌍둥이 타워와7 WTC 붕괴, 수습과2018년까지의 주요 재건을 다룹니다. 충돌·낙하·분진·항공기 실루엣과 중간 재건은 추정 도해이며 NIST 해석이나 실제 물리 시뮬레이션이 아닙니다. 사람·피해자는 표현하지 않습니다. 추모 풀·One WTC·오큘러스는 날짜에 따라 탐사할 수 있고, 마지막 장면은 현재 단지 전체나 모든 재개발의 완료를 뜻하지 않습니다.
