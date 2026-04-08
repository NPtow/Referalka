# Batch 001 Notes

## Что это

Стартовый raw universe seed-batch для HR-tech исследования.

## Ограничения батча

- Это еще не fully validated universe.
- `source_primary=manual_seed` означает, что компания включена как seed из category knowledge и требует дальнейшей source validation.
- `linkedin_url` пока намеренно не заполнен.
- Funding, users, revenue, ICP и другие enrichment fields здесь не должны трактоваться как известные.

## Зачем такой батч полезен

- позволяет сразу начать normalize stage;
- дает первый материал для taxonomy stress-test;
- помогает увидеть, какие сегменты уже переобогащены, а какие почти пустые.

## Следующий шаг

1. Нормализовать названия и домены.
2. Проверить, какие компании не являются startup / scale-up и требуют фильтрации.
3. На enrichment stage брать только 40-60 компаний из этого батча.

## Что проверить в первую очередь

- дубликаты ATS / recruiting suites;
- смешение HR core и pure recruiting;
- overlap между `employee referrals`, `external referral marketplace`, `warm-intro recruiting`;
- overlap между `AI recruiter`, `AI sourcing`, `AI talent intelligence`.
