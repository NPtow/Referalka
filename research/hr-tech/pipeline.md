# Pipeline

## Step 1. Universe Collection

### Goal
Собрать максимально широкий список компаний без глубокого анализа.

### Input
- LinkedIn
- Crunchbase hubs
- Wellfound
- YC
- Product Hunt
- G2
- Capterra

### Output
- `raw/batch-xxx-raw-universe.csv`
- `raw/batch-xxx-notes.md`

### Batch size
- 100-300 компаний

### Done when
- есть usable raw batch с header;
- понятно, какие источники дали лучший yield.

## Step 2. Normalize + Dedupe

### Goal
Очистить universe и привести компании к одному каноническому виду.

### Input
- raw batch

### Output
- `normalized/batch-xxx-normalized.csv`

### Batch size
- 100-150 компаний

### Done when
- основные дубликаты устранены;
- website и company name нормализованы.

## Step 3. Enrichment

### Goal
Подтянуть category, ICP, business model, funding и traction.

### Input
- normalized batch
- official websites
- Crunchbase / Dealroom / PitchBook
- G2 / Capterra
- press / blog

### Output
- `enriched/batch-xxx-enriched.csv`
- `enriched/batch-xxx-summary.md`

### Batch size
- 40-60 компаний

### Done when
- для каждой компании понятны минимум product, segment, buyer и model.

## Step 4. Taxonomy Assignment

### Goal
Присвоить каждой компании `primary_segment` и `secondary_segment`.

### Input
- enriched batch

### Output
- обновленный enriched batch

### Done when
- каждая компания размечена без явной путаницы workflow и business model.

## Step 5. Strategic Analysis

### Goal
Сделать выводы по сегментам, winners и whitespace.

### Output
- market map
- top companies by segment
- comparative notes

## Step 6. Deep Dives

### Goal
Подготовить короткие company cards на самые важные компании.

### Batch size
- 5-10 компаний
