# 타이타닉 심해 요소 추가 검토 — 2026-11-01

현재 상태: 자료 검토 완료. 물고기·산호·해면의 새 모델/애니메이션은 이번 변경에 추가하지 않았다.

## 결론
추가할 수 있다. 다만 열대 산호초 풍경이 아니라 실제 난파선 주변에서 관측된 심해 생물과 관측용 조명에 맞춰 구성한다.

| 요소 | 근거와 판단 | 권장 구현 |
|---|---|---|
| 그레나디어/래트테일류 물고기 | 난파선 및 주변 서식지 연구에서 관측됨 | 해저 가까이 드물게 지나는 개체. 정확한 종·개체수·크기·경로는 확인한 범위만 사용하고 추정 표시 |
| 냉수성 산호·해면 | 난파선 선수 난간의 부착 군체와 시간에 따른 변화가 연구에 기록됨 | 작은 부착 군체 중심. 인근 해산의 큰 군락을 난파선 전체에 복제하지 않음 |
| 불가사리·게류·말미잘 등 | 현장 연구에 무척추동물 관측 기록 있음 | 관측 위치/형태를 추가 확인한 후 선택. 임의의 대형 동물을 상징물처럼 배치하지 않음 |
| 러스티클 | NOAA가 난파선의 대표적인 생물·부식 현상으로 설명 | 기존 표현 보완 가능. 산호/식물과 다른 표면 현상으로 구분 |
| 침강 입자·바닥 퇴적물 | 시야와 흐름을 보여주는 설명용 표현에 적합 | 기존 입자와 통합, 밀도는 추정 표시. 선체와 글씨를 가리지 않음 |
| 탐사 조명 | 약 3,800m는 자연광 없는 환경 | 가상 관측광임을 표시하고 어두운 배경에 국소적으로 비춤. 밝게 보인다고 실제 자연광이 있는 것으로 표현하지 않음 |
| 열대 산호초·해초밭 | 이 수심·현장 표현에 부적합 | 추가하지 않음. 냉수성 산호의 존재와 열대 산호초 생태계를 혼동하지 않음 |

## 추천 순서
1. 관측 조명과 기존 입자 정돈: 선체 디테일을 읽기 쉽게 한다.
2. 드문 그레나디어류 움직임: 색상 보기/탐사 장면에서만 켜고 도면에서는 제외한다.
3. 실제 군체 형태를 확인한 냉수성 산호·해면: 부착 위치와 크기를 따로 근거화한다.

생물 보기는 선택 기능으로 분리하는 것이 좋다. 재생을 멈추면 생물 모션도 멈추고 애니메이션 감소 설정을 존중한다. 현대 관측 생물을 1912년 침몰 직후부터 같은 밀도로 보여주거나, 시간 바의 연도를 검증되지 않은 개체수/성장률에 연결하지 않는다. 형상·위치·군집 밀도의 추정 여부를 별도 표시한다.

## 자료와 검토 한계
- [Cleland et al. 2025, Megafauna of the RMS Titanic shipwreck and a nearby seamount ridge](https://doi.org/10.1016/j.dsr.2025.104544): 출판사 검색 노출 본문 §3.6 및 어류 서술을 확인했다. 난파선과 인근 해산은 별도 서식지다. 출판사 직접 페이지는 403으로 전문을 열지 못했으므로 전체 분류·좌표를 검증했다고 주장하지 않는다. [정오표](https://doi.org/10.1016/j.dsr.2025.104555)가 확인되어, 성장률·수치 예측은 이 검토에 사용하지 않았다.
- [1994 현장 연구 초록: Exploring the wreck of the Titanic, seabed processes at 3800 metres](https://archives.datapages.com/data/atlantic-geology-journal/data/030/030002/pdfs/154.pdf): 무척추동물과 그레나디어류 관측 기록을 별도로 확인했다.
- [NOAA — The Titanic Wrecksite](https://oceantoday.noaa.gov/titanicwrecksite/): 러스티클과 난파선의 과학적 관측 맥락.
- [NOAA — How far does light travel in the ocean?](https://oceanservice.noaa.gov/facts/light_travel.html): 자연광 없는 수심과 광합성 한계.

이 문서는 추가 가능성 검토다. 생물 모델의 현장 일치도, 애니메이션·모바일 성능·접근성은 아직 구현/검증하지 않았다.

## Follow-up — implemented after this assessment
The subsequent requested implementation is documented in `titanic-ecology-notes.md` and `../representative/titanic-ecology-qa.md`. The original assessment above records the earlier review state. In particular, bow-rail observations support coral; sparse sponge reports include the stern and boat deck, not a bow-rail sponge colony or a Geodia meadow.
