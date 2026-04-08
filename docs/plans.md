# Plans

## Global HR-Tech Segmentation Research

Status: `[~] In progress`

### Goal

Собрать локальную исследовательскую систему для сегментации мировых HR / recruiting / talent-tech стартапов:
- с методологией;
- с нормализованной taxonomy;
- с master schema;
- с первым raw universe batch;
- с заделом под последующий enrichment и deep dives.

### Assumptions

- `source of truth` для исследования живет локально в `research/hr-tech/`.
- Первый проход не пытается сразу дать полный coverage рынка; он создает рабочую систему и стартовый universe batch.
- Funding / users / revenue добавляются только на enrichment stage.
- Для raw stage допустим seed-batch из известных компаний, если он помечен как raw и требует дальнейшей source validation.

### Milestone 1. Подготовить execution pack и research scaffold

Status: `[x] Done`

Tasks:
- обновить `docs/plans.md`, `docs/status.md`, `docs/test-plan.md` под исследовательский pipeline;
- создать папку `research/hr-tech/` и базовую структуру;
- завести методологические файлы `README`, `source-registry`, `taxonomy`, `master-schema`, `pipeline`.

Definition of done:
- есть рабочий execution pack;
- есть локальная структура исследования;
- методологические файлы заполнены и пригодны для продолжения batch-work.

Validation:
- `test -d research/hr-tech`
- `test -f research/hr-tech/README.md`
- `test -f research/hr-tech/source-registry.md`
- `test -f research/hr-tech/taxonomy.md`
- `test -f research/hr-tech/master-schema.md`
- `test -f research/hr-tech/pipeline.md`

Known risks:
- taxonomy может оказаться слишком широкой или пересекающейся;
- source registry без дальнейшей проверки не гарантирует равное качество всех источников.

Stop-and-fix rule:
- если структура папок или schema не выдерживают следующий batch, сначала исправить scaffold, потом собирать данные.

### Milestone 2. Собрать первый raw universe batch

Status: `[~] In progress`

Tasks:
- завести `research/hr-tech/raw/batch-001-raw-universe.csv`;
- собрать стартовый batch компаний с базовыми полями;
- отдельно зафиксировать notes по качеству источников и дубликатам.

Definition of done:
- есть `batch-001-raw-universe.csv` с usable header и стартовым набором компаний;
- есть `batch-001-notes.md` с ограничениями и следующими шагами normalize stage.

Validation:
- `test -f research/hr-tech/raw/batch-001-raw-universe.csv`
- `test -f research/hr-tech/raw/batch-001-notes.md`
- `sed -n '1,5p' research/hr-tech/raw/batch-001-raw-universe.csv`

Known risks:
- raw batch может содержать дубликаты и неканоничные домены;
- часть компаний окажется не startup, а более зрелым HR software vendor.

Stop-and-fix rule:
- если batch неотличим от случайного списка компаний, пересобрать критерии inclusion и повторить сбор.

Current result:
- создан `batch-001-raw-universe.csv` со стартовым seed-batch на 52 компании;
- создан `batch-001-notes.md`;
- следующий проход должен расширить batch и перейти к normalize.

### Milestone 3. Подготовить handoff в normalize + enrichment

Status: `[ ] Pending`

Tasks:
- зафиксировать save rules для raw stage;
- явно отделить raw-only поля от enrichment-only полей;
- описать размер и правила первого enrichment batch.

Definition of done:
- следующий запуск может без пересборки контекста перейти к normalize + enrichment;
- в `pipeline.md` и `README.md` зафиксированы размер батчей и качество перехода между стадиями.

Validation:
- `rg -n "Universe Collection|Normalize|Enrichment" research/hr-tech/pipeline.md`
- `rg -n "raw stage|enrichment stage" research/hr-tech/README.md research/hr-tech/pipeline.md`

Known risks:
- слишком ранний переход к enrichment без нормализации приведет к мусору;
- schema может разойтись с реальным форматом batch-файлов.

Stop-and-fix rule:
- если handoff в следующий этап неочевиден, сначала дописать pipeline и README, потом продолжать batch-work.

## HireHi first-100 parser spike

Status: `[x] Done`

### Goal

Собрать первые 100 уникальных вакансий из публичного фида HireHi в порядке default-sort `date`, распарсить детальные страницы и выдать структурированный отчёт в чат без записи в БД.

### Assumptions

- Источник ограничен публичными HTML/JSON-ответами `hirehi.ru`.
- Для page 1 используется SSR payload, для следующих страниц допускается публичный JSON feed `/api/search/jobs`.
- Спайк не меняет продуктовый runtime и не пишет данные в Prisma.

### Milestone 1. Подготовить execution pack

Status: `[x] Done`

Tasks:
- зафиксировать scope спайка и критерии успеха;
- выбрать артефакты repo для резюмируемого execution loop;
- задать команды валидации и stop conditions.

Definition of done:
- есть `docs/plans.md`, `docs/status.md`, `docs/test-plan.md`;
- статус указывает на следующий исполняемый milestone.

Validation:
- `test -f docs/plans.md`
- `test -f docs/status.md`
- `test -f docs/test-plan.md`

Known risks:
- документы могут разойтись с фактическим прогрессом, если не обновлять их по ходу.

Stop-and-fix rule:
- если scope спайка меняется, сначала обновить этот план, потом продолжать код.

### Milestone 2. Реализовать standalone parser script

Status: `[x] Done`

Tasks:
- добавить `scripts/hirehi-first-100.ts`;
- собрать feed page 1 через SSR и page 2+ через публичный `/api/search/jobs`;
- нормализовать 100 уникальных detail URLs и распарсить страницы вакансий;
- добавить npm script для запуска спайка.

Definition of done:
- `npm run spike:hirehi:first-100` запускает standalone script;
- script печатает JSON с `summary`, `stableFields`, `partialFields`, `vacancies`.

Validation:
- `npm run typecheck`
- `npm run spike:hirehi:first-100`

Known risks:
- HireHi может менять HTML-разметку секций;
- возможны rate limits или нестабильные detail pages.

Stop-and-fix rule:
- если не набираются 100 уникальных вакансий или ломается canonical/detail parse, сначала починить parser, потом переходить к отчёту.

### Milestone 3. Провести spike-run и верификацию

Status: `[x] Done`

Tasks:
- прогнать script на live feed;
- вручную проверить 10 вакансий из начала, середины и конца списка;
- собрать агрегированную сводку и компактный список всех 100 вакансий.

Definition of done:
- в отчёте есть 100 уникальных вакансий;
- у каждой заполнены `sourceUrl`, `title`, `companyName`;
- есть отдельные counts по archived / missing salary / missing seniority / missing work mode.

Validation:
- `npm run spike:hirehi:first-100`

Known risks:
- live-feed может измениться между fetch listing и detail pages;
- часть полей может отсутствовать на source pages.

Stop-and-fix rule:
- если данные не дотягивают до критериев успеха, дорабатывается parser и spike-run повторяется до стабилизации результата.

Result:
- собраны 100 уникальных вакансий с page 1-4;
- core fields заполнены у 100/100;
- missing salary только у 3/100, missing seniority/workMode у 0/100;
- выборочная live-проверка 10 source pages подтвердила title/company/salary/format/location.
