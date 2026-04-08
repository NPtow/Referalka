# Source Registry

| Source | Type | Зачем нужен | Какие поля покрывает | Reliability | Когда использовать |
|---|---|---|---|---|---|
| LinkedIn company pages | identity spine | базовая идентичность компании | company name, website, HQ, employee count, followers, specialties, jobs | high | сразу после raw discovery |
| Crunchbase | funding database | funding и ownership signal | total funding, rounds, investors, acquisitions | high | enrichment |
| Wellfound | startup directory | ранние startup-профили и hiring signal | startup description, jobs, stage hints | medium | raw discovery + enrichment |
| YC companies / jobs ecosystem | startup directory | поиск YC-компаний в hiring / recruiting | company name, description, YC status | medium | raw discovery |
| Product Hunt | launch directory | новые recruiting / HR продукты | launch signal, description, positioning | medium | raw discovery |
| G2 | review / category platform | category validation и review density | category, review count, buyer size hints | high | enrichment |
| Capterra | review / category platform | вторая валидация категории | category, review count, pricing hints | high | enrichment |
| Official company website | source of truth | what they do, ICP, pricing, customers | description, ICP, pricing, business model, case studies | very high | enrichment |
| Company blog / press / TechCrunch | press layer | traction, rounds, launches, customers | funding events, users, customer count, notable launches | medium-high | enrichment |
| Dealroom | market intelligence | funding and ecosystem comparisons | rounds, stage, HQ, growth signal | high | enrichment if available |
| Tracxn | market intelligence | sector discovery and startup mapping | sector placement, stage, comparables | medium-high | enrichment if available |
| PitchBook | market intelligence | deep private market data | ownership, rounds, M&A, estimates | high | enrichment if available |

## Использование по стадиям

### Raw discovery
- LinkedIn
- Crunchbase hubs
- Wellfound
- YC
- Product Hunt
- G2
- Capterra

### Normalize
- LinkedIn
- official website

### Enrichment
- official website
- Crunchbase / Dealroom / PitchBook
- G2 / Capterra
- press / company blog

## Source priority by field

- `company_description`: website > LinkedIn > Crunchbase
- `funding_total`: Crunchbase / Dealroom / PitchBook > press
- `ICP`: website > case studies > reviews
- `employee_count`: LinkedIn only
- `category`: taxonomy first, G2/Capterra second
- `users/customers/revenue`: official website / official press only
