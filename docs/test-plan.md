# Test Plan

## Scope

Проверяется локальный research pipeline для сегментации мировых HR / recruiting / talent-tech компаний. Вне scope: продуктовый runtime, Prisma и UI.

## Validation levels

### Scaffold

- `test -d research/hr-tech`
- `test -d research/hr-tech/raw`
- `test -d research/hr-tech/normalized`
- `test -d research/hr-tech/enriched`
- `test -f research/hr-tech/README.md`
- `test -f research/hr-tech/source-registry.md`
- `test -f research/hr-tech/taxonomy.md`
- `test -f research/hr-tech/master-schema.md`
- `test -f research/hr-tech/pipeline.md`

### Research integrity

Проверить вручную:
- taxonomy не смешивает workflow, buyer и business model в одном поле;
- source registry покрывает discovery, validation и enrichment stages;
- master schema отделяет raw-stage поля от enrichment-stage полей;
- pipeline содержит batch sizes и explicit handoffs.

### Raw batch smoke

Проверить:
- есть `research/hr-tech/raw/batch-001-raw-universe.csv`;
- первая строка содержит header;
- raw batch не содержит funding / ICP / users как будто это подтвержденные факты, если stage еще raw;
- есть `research/hr-tech/raw/batch-001-notes.md`.

### Negative cases

- один и тот же вендор попадает в batch под разными доменами или названиями;
- enterprise HR vendor случайно трактуется как startup;
- source указан, но не годится для требуемого поля;
- в raw batch начинают заполняться speculative fields.

### Acceptance gates

- методологические файлы пригодны для следующего запуска без чтения чата;
- raw batch можно использовать как вход в normalize stage;
- notes явно фиксируют ограничения первого батча и что делать дальше.

## Legacy scope

## Scope

Проверяется standalone parser spike для первых 100 вакансий HireHi. Вне scope: Prisma, UI, API routes и persistence.

## Validation levels

### Static

- `npm run typecheck`

### Functional

- `npm run spike:hirehi:first-100`

Ожидается:
- получено ровно 100 уникальных вакансий;
- у каждой вакансии есть `sourceUrl`, `title`, `companyName`;
- summary содержит counts по archived / missing salary / missing seniority / missing work mode;
- parser не падает на отсутствующих секциях `требования` или `условия`.

### Manual smoke

- Сверить 10 вакансий с live HireHi:
- 4 из начала списка;
- 3 из середины;
- 3 из конца.

Проверить:
- порядок соответствует feed `date`;
- canonical `sourceUrl` открывает ожидаемую вакансию;
- `title`, `companyName`, `salaryText`, `seniority`, `workMode` совпадают с detail page или корректно отмечены как отсутствующие.

## Negative cases

- detail page без зарплаты;
- detail page без явного грейда;
- detail page без секции `условия`;
- archived vacancy;
- редирект с неконанонического slug на canonical URL.

## Acceptance gates

- script стабильно выдаёт 100 записей без дублей;
- core fields заполнены для всех 100;
- не менее чем у 90% записей `salaryText`, `seniority`, `workMode` либо распарсены, либо явно `null` из-за отсутствия поля на source page;
- итоговый чат-отчёт перечисляет все 100 вакансий в компактном виде.
