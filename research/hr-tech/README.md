# HR-Tech Research

Локальная исследовательская система для сегментации мировых HR / recruiting / talent-tech компаний.

## Цель

Собрать не обзор, а расширяемую базу:
- raw universe компаний;
- нормализованную taxonomy;
- source registry;
- master schema;
- batch-by-batch enrichment;
- company cards и market analysis.

## Структура

- `source-registry.md` — какие источники использовать и для каких полей
- `taxonomy.md` — сегментация рынка
- `master-schema.md` — точный список колонок и полей
- `pipeline.md` — порядок шагов и batch logic
- `raw/` — сырые universe batches
- `normalized/` — очищенные и deduped batches
- `enriched/` — batches после enrichment
- `company-cards/` — deep dives на отдельные компании
- `logs/` — рабочие заметки по итерациям

## Рабочий принцип

1. Сначала `raw universe`.
2. Потом `normalize + dedupe`.
3. Потом `enrichment`.
4. Потом `analysis`.

Не перепрыгивать сразу к deep analysis без нормализации.

## Batch logic

- `raw universe`: 100-300 компаний за проход
- `normalize`: 100-150 компаний за проход
- `enrichment`: 40-60 компаний за проход
- `deep dives`: 5-10 компаний за проход

## Правило качества

Если поле не подтверждено нормальным источником, ставить `unknown`, а не додумывать.
