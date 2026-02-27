import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const vacancies = [
  // Яндекс
  { companySlug: "yandex", title: "Frontend Developer", level: "middle", type: "remote", tags: ["React", "TypeScript", "Next.js"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "yandex", title: "Backend Developer", level: "senior", type: "hybrid", tags: ["Python", "Go", "PostgreSQL"], salary: "280 000 — 420 000 ₽" },
  { companySlug: "yandex", title: "ML Engineer", level: "senior", type: "remote", tags: ["Python", "PyTorch", "TensorFlow"], salary: "320 000 — 480 000 ₽" },
  { companySlug: "yandex", title: "Product Manager", level: "middle", type: "office", tags: ["Аналитика", "A/B тесты", "SQL"], salary: "230 000 — 340 000 ₽" },
  { companySlug: "yandex", title: "iOS Developer", level: "middle", type: "hybrid", tags: ["Swift", "SwiftUI", "Combine"], salary: "200 000 — 290 000 ₽" },

  // Тинькофф
  { companySlug: "tinkoff", title: "Backend Developer", level: "middle", type: "office", tags: ["Java", "Kotlin", "Spring"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "tinkoff", title: "Frontend Developer", level: "senior", type: "hybrid", tags: ["React", "TypeScript", "MobX"], salary: "250 000 — 370 000 ₽" },
  { companySlug: "tinkoff", title: "iOS Developer", level: "middle", type: "office", tags: ["Swift", "SwiftUI", "RxSwift"], salary: "200 000 — 290 000 ₽" },
  { companySlug: "tinkoff", title: "Android Developer", level: "middle", type: "office", tags: ["Kotlin", "Jetpack Compose", "Coroutines"], salary: "200 000 — 290 000 ₽" },
  { companySlug: "tinkoff", title: "Data Engineer", level: "senior", type: "hybrid", tags: ["Python", "Spark", "ClickHouse"], salary: "280 000 — 400 000 ₽" },

  // Озон
  { companySlug: "ozon", title: "Backend Developer", level: "senior", type: "hybrid", tags: ["Go", "Kafka", "PostgreSQL"], salary: "280 000 — 420 000 ₽" },
  { companySlug: "ozon", title: "Frontend Developer", level: "middle", type: "hybrid", tags: ["React", "TypeScript", "Redux"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "ozon", title: "Data Engineer", level: "middle", type: "remote", tags: ["Python", "Spark", "Airflow"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "ozon", title: "DevOps / SRE", level: "senior", type: "office", tags: ["Kubernetes", "Docker", "Terraform"], salary: "280 000 — 400 000 ₽" },
  { companySlug: "ozon", title: "Product Manager", level: "middle", type: "hybrid", tags: ["Маркетплейс", "Аналитика", "SQL"], salary: "220 000 — 320 000 ₽" },

  // Авито
  { companySlug: "avito", title: "Backend Developer", level: "middle", type: "remote", tags: ["Go", "MySQL", "Redis"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "avito", title: "iOS Developer", level: "senior", type: "hybrid", tags: ["Swift", "Objective-C", "VIPER"], salary: "260 000 — 380 000 ₽" },
  { companySlug: "avito", title: "Android Developer", level: "senior", type: "hybrid", tags: ["Kotlin", "Java", "MVVM"], salary: "260 000 — 380 000 ₽" },
  { companySlug: "avito", title: "Product Manager", level: "senior", type: "office", tags: ["Marketplace", "SQL", "Метрики"], salary: "280 000 — 420 000 ₽" },
  { companySlug: "avito", title: "QA Engineer", level: "middle", type: "remote", tags: ["Python", "Selenium", "Pytest"], salary: "160 000 — 230 000 ₽" },

  // Сбер
  { companySlug: "sber", title: "ML Engineer", level: "senior", type: "office", tags: ["Python", "PyTorch", "LLM"], salary: "300 000 — 500 000 ₽" },
  { companySlug: "sber", title: "Backend Developer", level: "middle", type: "hybrid", tags: ["Java", "Spring", "Kafka"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "sber", title: "Data Engineer", level: "senior", type: "hybrid", tags: ["Python", "Spark", "Hadoop"], salary: "280 000 — 400 000 ₽" },
  { companySlug: "sber", title: "DevOps / SRE", level: "middle", type: "office", tags: ["Kubernetes", "Helm", "GitLab CI"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "sber", title: "Frontend Developer", level: "middle", type: "hybrid", tags: ["React", "TypeScript", "MobX"], salary: "180 000 — 270 000 ₽" },

  // ВКонтакте
  { companySlug: "vk", title: "Backend Developer", level: "senior", type: "hybrid", tags: ["PHP", "C++", "Kafka"], salary: "280 000 — 420 000 ₽" },
  { companySlug: "vk", title: "iOS Developer", level: "middle", type: "office", tags: ["Swift", "Objective-C", "UIKit"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "vk", title: "Android Developer", level: "middle", type: "office", tags: ["Kotlin", "Java", "RxJava"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "vk", title: "Frontend Developer", level: "senior", type: "hybrid", tags: ["React", "TypeScript", "VKUI"], salary: "250 000 — 380 000 ₽" },
  { companySlug: "vk", title: "Product Manager", level: "middle", type: "office", tags: ["Социальные сети", "Retention", "A/B"], salary: "220 000 — 330 000 ₽" },

  // Kaspersky
  { companySlug: "kaspersky", title: "Backend Developer", level: "senior", type: "hybrid", tags: ["C++", "Python", "Linux"], salary: "270 000 — 400 000 ₽" },
  { companySlug: "kaspersky", title: "DevOps / SRE", level: "middle", type: "office", tags: ["Kubernetes", "Ansible", "GitLab"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "kaspersky", title: "QA Engineer", level: "middle", type: "hybrid", tags: ["Python", "C++", "Автоматизация"], salary: "160 000 — 230 000 ₽" },
  { companySlug: "kaspersky", title: "ML Engineer", level: "senior", type: "remote", tags: ["Python", "Антифрод", "ML"], salary: "280 000 — 420 000 ₽" },

  // 2GIS
  { companySlug: "2gis", title: "Frontend Developer", level: "middle", type: "remote", tags: ["React", "TypeScript", "Leaflet"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "2gis", title: "Backend Developer", level: "middle", type: "hybrid", tags: ["Kotlin", "PostgreSQL", "gRPC"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "2gis", title: "iOS Developer", level: "middle", type: "remote", tags: ["Swift", "MapKit", "CoreData"], salary: "190 000 — 280 000 ₽" },
  { companySlug: "2gis", title: "Android Developer", level: "middle", type: "remote", tags: ["Kotlin", "Maps SDK", "Room"], salary: "190 000 — 280 000 ₽" },

  // Lamoda
  { companySlug: "lamoda", title: "Backend Developer", level: "middle", type: "hybrid", tags: ["PHP", "Go", "MySQL"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "lamoda", title: "Frontend Developer", level: "middle", type: "hybrid", tags: ["React", "TypeScript", "Next.js"], salary: "170 000 — 250 000 ₽" },
  { companySlug: "lamoda", title: "Data Engineer", level: "middle", type: "remote", tags: ["Python", "Spark", "ClickHouse"], salary: "190 000 — 280 000 ₽" },
  { companySlug: "lamoda", title: "Product Manager", level: "middle", type: "office", tags: ["E-commerce", "Аналитика", "Retention"], salary: "200 000 — 290 000 ₽" },

  // HeadHunter
  { companySlug: "hh", title: "Backend Developer", level: "senior", type: "hybrid", tags: ["Python", "Django", "PostgreSQL"], salary: "270 000 — 400 000 ₽" },
  { companySlug: "hh", title: "Frontend Developer", level: "middle", type: "remote", tags: ["React", "TypeScript", "GraphQL"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "hh", title: "ML Engineer", level: "middle", type: "hybrid", tags: ["Python", "NLP", "Рекомендательные системы"], salary: "220 000 — 330 000 ₽" },
  { companySlug: "hh", title: "Product Manager", level: "senior", type: "hybrid", tags: ["HR-tech", "SQL", "Метрики"], salary: "270 000 — 400 000 ₽" },

  // Wildberries
  { companySlug: "wildberries", title: "Backend Developer", level: "senior", type: "office", tags: ["Go", "C#", "Kafka"], salary: "280 000 — 420 000 ₽" },
  { companySlug: "wildberries", title: "Frontend Developer", level: "middle", type: "office", tags: ["React", "TypeScript", "Redux"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "wildberries", title: "Android Developer", level: "middle", type: "office", tags: ["Kotlin", "Jetpack Compose"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "wildberries", title: "iOS Developer", level: "middle", type: "office", tags: ["Swift", "SwiftUI", "UIKit"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "wildberries", title: "DevOps / SRE", level: "senior", type: "office", tags: ["Kubernetes", "Docker", "CI/CD"], salary: "280 000 — 420 000 ₽" },

  // МТС
  { companySlug: "mts", title: "Backend Developer", level: "middle", type: "hybrid", tags: ["Java", "Spring", "Kafka"], salary: "190 000 — 280 000 ₽" },
  { companySlug: "mts", title: "DevOps / SRE", level: "senior", type: "hybrid", tags: ["Kubernetes", "Terraform", "OpenShift"], salary: "270 000 — 400 000 ₽" },
  { companySlug: "mts", title: "ML Engineer", level: "middle", type: "remote", tags: ["Python", "TensorFlow", "BigData"], salary: "210 000 — 320 000 ₽" },
  { companySlug: "mts", title: "Frontend Developer", level: "middle", type: "hybrid", tags: ["React", "TypeScript", "MUI"], salary: "170 000 — 250 000 ₽" },

  // Циан
  { companySlug: "cian", title: "Backend Developer", level: "middle", type: "remote", tags: ["Python", "Django", "PostgreSQL"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "cian", title: "Frontend Developer", level: "middle", type: "remote", tags: ["React", "TypeScript", "Next.js"], salary: "170 000 — 250 000 ₽" },
  { companySlug: "cian", title: "iOS Developer", level: "junior", type: "remote", tags: ["Swift", "SwiftUI", "CoreLocation"], salary: "120 000 — 180 000 ₽" },
  { companySlug: "cian", title: "Product Manager", level: "middle", type: "hybrid", tags: ["Недвижимость", "UX", "A/B тесты"], salary: "190 000 — 280 000 ₽" },

  // Ростелеком
  { companySlug: "rostelecom", title: "Backend Developer", level: "middle", type: "office", tags: ["Java", "Spring", "Oracle"], salary: "160 000 — 240 000 ₽" },
  { companySlug: "rostelecom", title: "DevOps / SRE", level: "senior", type: "hybrid", tags: ["Linux", "Ansible", "Docker"], salary: "230 000 — 350 000 ₽" },
  { companySlug: "rostelecom", title: "Frontend Developer", level: "junior", type: "office", tags: ["React", "JavaScript", "CSS"], salary: "100 000 — 160 000 ₽" },

  // Дзен
  { companySlug: "dzen", title: "ML Engineer", level: "senior", type: "hybrid", tags: ["Python", "Рекомендательные системы", "Ранжирование"], salary: "300 000 — 450 000 ₽" },
  { companySlug: "dzen", title: "Backend Developer", level: "middle", type: "hybrid", tags: ["Go", "Python", "Kafka"], salary: "200 000 — 300 000 ₽" },
  { companySlug: "dzen", title: "Frontend Developer", level: "middle", type: "remote", tags: ["React", "TypeScript", "SSR"], salary: "180 000 — 270 000 ₽" },
  { companySlug: "dzen", title: "Data Engineer", level: "senior", type: "hybrid", tags: ["Python", "Spark", "ClickHouse"], salary: "260 000 — 380 000 ₽" },
];

async function main() {
  console.log("Seeding vacancies...");
  await prisma.vacancy.deleteMany();
  await prisma.vacancy.createMany({ data: vacancies });
  console.log(`Created ${vacancies.length} vacancies`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
