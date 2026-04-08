# Status

## Current phase

- `[~] HR-tech segmentation research raw batch-001 in progress`
- `[x]` HireHi first-100 parser spike complete

## Done

- `[x]` Scope нового исследования зафиксирован: мировой HR / recruiting / talent-tech landscape.
- `[x]` Принято решение вести `source of truth` локально в `research/hr-tech/`.
- `[x]` Создан scaffold `research/hr-tech/` с методологическими файлами.
- `[x]` Создан `raw/batch-001-raw-universe.csv` как seed-batch.
- `[x]` Scope спайка зафиксирован: первые 100 вакансий HireHi, без БД.
- `[x]` Выбрана рабочая ветка `preview/hirehi-first-100-spike`.
- `[x]` Проверено, что публичный feed доступен через SSR page 1 и `/api/search/jobs` для page 2+.
- `[x]` Добавлен `scripts/hirehi-first-100.ts` и npm script `spike:hirehi:first-100`.
- `[x]` Выполнен live-run, результат сохранён в `/tmp/hirehi-first-100.json`.
- `[x]` Сверены 10 source pages из начала, середины и конца выборки.

## Next

- `[ ]` Расширить `batch-001` за пределы seed-batch и убрать явные нецелевые компании.
- `[ ]` Перейти к normalize + dedupe для `batch-001`.
- `[ ]` Подготовить первый enrichment batch на 40-60 компаний.
- `[ ]` Спроектировать отдельную таблицу под HireHi ingestion.
- `[ ]` Перенести parser из spike в backend sync flow для preview.

## Decisions

- Исследование идет по схеме `raw universe -> normalize -> enrichment -> analysis`, а не как единый обзор.
- В первый проход важнее правильный scaffold и usable first batch, чем попытка сразу покрыть весь рынок.
- Для детальных страниц используем id-driven URL `https://hirehi.ru/<category>/vacancy-<id>` и принимаем финальный redirected URL как canonical `sourceUrl`.
- `sourceJobKey` для спайка нормализуется как `hirehi:<id>`.
- `publishedAt` берётся из `JobPosting.datePosted`, а при отсутствии fallback идёт в feed `created_at`.

## Validation commands

- `test -d research/hr-tech`
- `find research/hr-tech -maxdepth 2 | sort`
- `npm run typecheck`
- `npm run spike:hirehi:first-100`

## Validation results

- `npm run typecheck` -> passed
- `npm run spike:hirehi:first-100` -> passed
- summary: `100 total`, `0 archived`, `3 missing salary`, `0 missing seniority`, `0 missing workMode`

## Blockers

- Нет автоматического trusted source ingestion; первый batch собирается полуручно.
- Репозиторий находится вне writable sandbox; правки идут через симлинк в `/tmp`.

## Audit log

- 2026-04-08: стартовал отдельный HR-tech segmentation research pipeline.
- 2026-04-08: выбран локальный storage path `research/hr-tech/`.
- 2026-04-03: подтверждён scope мини-задачи и execution пойдёт сразу, без дополнительного согласования.
- 2026-04-03: создана ветка `preview/hirehi-first-100-spike`.
- 2026-04-03: подтверждён публичный JSON feed HireHi для page 2+.
- 2026-04-03: исправлен section parsing для `описание/требования/условия` и повторно выполнен live-run.
- 2026-04-03: выборочная проверка 10 source pages подтвердила совпадение title/company/salary/format/location с текущим HTML.
