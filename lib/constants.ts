export interface CompanyMeta {
  name: string;
  slug: string;
  description: string;
  size: string;
  tags: string[];
  logoPath: string | null;
  website: string;
}

export const COMPANIES_META: CompanyMeta[] = [
  {
    name: "Яндекс",
    slug: "yandex",
    description: "Крупнейшая российская IT-компания: поиск, рекомендательные сервисы, такси, маркетплейс, облако и многое другое.",
    size: "20 000+ сотрудников",
    tags: ["IT", "Медиа"],
    logoPath: "/logos/yandex.svg",
    website: "https://yandex.ru",
  },
  {
    name: "Тинькофф",
    slug: "tinkoff",
    description: "Технологический банк и финансовая экосистема. Один из крупнейших работодателей в финтехе в России.",
    size: "30 000+ сотрудников",
    tags: ["IT", "Финтех"],
    logoPath: "/logos/tinkoff.svg",
    website: "https://tinkoff.ru",
  },
  {
    name: "Озон",
    slug: "ozon",
    description: "Один из крупнейших маркетплейсов России. Активно развивают логистику, финтех и облачные сервисы.",
    size: "50 000+ сотрудников",
    tags: ["IT", "E-commerce"],
    logoPath: "/logos/ozon.svg",
    website: "https://ozon.ru",
  },
  {
    name: "Авито",
    slug: "avito",
    description: "Крупнейшая платформа объявлений в России. Развивают маркетплейс, финансовые продукты и технологии.",
    size: "5 000+ сотрудников",
    tags: ["IT", "E-commerce"],
    logoPath: "/logos/avito.svg",
    website: "https://avito.ru",
  },
  {
    name: "Сбер",
    slug: "sber",
    description: "Крупнейший банк и технологическая экосистема России. Инвестируют в AI, ML и цифровые сервисы.",
    size: "300 000+ сотрудников",
    tags: ["IT", "Финтех"],
    logoPath: "/logos/sber.svg",
    website: "https://sber.ru",
  },
  {
    name: "ВКонтакте",
    slug: "vk",
    description: "Крупнейшая социальная сеть России. Развивают экосистему из мессенджеров, игр, музыки и видео.",
    size: "10 000+ сотрудников",
    tags: ["IT", "Медиа"],
    logoPath: "/logos/vk.svg",
    website: "https://vk.com",
  },
  {
    name: "Kaspersky",
    slug: "kaspersky",
    description: "Мировой лидер в сфере кибербезопасности. Разрабатывают антивирусные и корпоративные решения.",
    size: "5 000+ сотрудников",
    tags: ["IT"],
    logoPath: "/logos/kaspersky.svg",
    website: "https://kaspersky.ru",
  },
  {
    name: "2GIS",
    slug: "2gis",
    description: "Картографический сервис и городской справочник. Используется в 500+ городах мира.",
    size: "3 000+ сотрудников",
    tags: ["IT"],
    logoPath: "/logos/2gis.svg",
    website: "https://2gis.ru",
  },
  {
    name: "Lamoda",
    slug: "lamoda",
    description: "Крупнейший fashion-маркетплейс России. Продают одежду, обувь и аксессуары с быстрой доставкой.",
    size: "10 000+ сотрудников",
    tags: ["IT", "E-commerce"],
    logoPath: "/logos/lamoda.svg",
    website: "https://lamoda.ru",
  },
  {
    name: "Циан",
    slug: "cian",
    description: "Крупнейшая платформа для поиска недвижимости в России. Помогают миллионам найти дом или офис.",
    size: "1 500+ сотрудников",
    tags: ["IT"],
    logoPath: null,
    website: "https://cian.ru",
  },
  {
    name: "HeadHunter",
    slug: "hh",
    description: "Ведущая платформа для поиска работы в России. Ежедневно соединяют миллионы кандидатов и работодателей.",
    size: "2 000+ сотрудников",
    tags: ["IT"],
    logoPath: "/logos/hh.svg",
    website: "https://hh.ru",
  },
  {
    name: "Wildberries",
    slug: "wildberries",
    description: "Крупнейший маркетплейс России по обороту. Активно развивают технологическую платформу и логистику.",
    size: "100 000+ сотрудников",
    tags: ["IT", "E-commerce"],
    logoPath: "/logos/wildberries.svg",
    website: "https://wildberries.ru",
  },
  {
    name: "МТС",
    slug: "mts",
    description: "Крупнейший телеком-оператор России. Активно трансформируются в IT-компанию: финтех, облако, AI.",
    size: "70 000+ сотрудников",
    tags: ["IT", "Финтех"],
    logoPath: "/logos/mts.svg",
    website: "https://mts.ru",
  },
  {
    name: "Ростелеком",
    slug: "rostelecom",
    description: "Национальный телекоммуникационный провайдер. Развивают облачные и цифровые сервисы для бизнеса.",
    size: "130 000+ сотрудников",
    tags: ["IT"],
    logoPath: null,
    website: "https://rostelecom.ru",
  },
  {
    name: "Дзен",
    slug: "dzen",
    description: "Платформа персонализированного контента. Используют ML и рекомендательные алгоритмы для подбора материалов.",
    size: "1 000+ сотрудников",
    tags: ["IT", "Медиа"],
    logoPath: null,
    website: "https://dzen.ru",
  },
];

export const COMPANIES = [
  "Яндекс",
  "Тинькофф",
  "Озон",
  "Авито",
  "Сбер",
  "ВКонтакте",
  "Kaspersky",
  "2GIS",
  "Lamoda",
  "Циан",
  "HeadHunter",
  "Wildberries",
  "МТС",
  "Ростелеком",
  "Дзен",
];

export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "iOS Developer",
  "Android Developer",
  "Data Engineer",
  "ML Engineer",
  "DevOps / SRE",
  "QA Engineer",
  "Product Manager",
  "Designer",
];

export const FAQS = [
  {
    q: "Что такое реферал и зачем он нужен?",
    a: "Реферал — это рекомендация от действующего сотрудника компании. Кандидаты с рефералом рассматриваются в приоритете и с вероятностью до 40% чаще получают оффер.",
  },
  {
    q: "Гарантируете ли вы оффер?",
    a: "Нет. Мы гарантируем реферал — то есть твоё резюме попадёт к рекрутеру напрямую через сотрудника. Оффер зависит от тебя.",
  },
  {
    q: "Как быстро найдут реферера?",
    a: "Обычно в течение 1–3 рабочих дней. Если нужного реферера нет — сообщим честно.",
  },
  {
    q: "Кто эти рефереры и можно ли им доверять?",
    a: "Это реальные сотрудники компаний, которые зарегистрировались на платформе. Мы проверяем их вручную.",
  },
  {
    q: "Как отменить подписку?",
    a: "В любой момент через личный кабинет или написав в поддержку. Деньги за текущий период не возвращаются.",
  },
];

export const MOCK_CANDIDATES = [
  {
    id: "1",
    role: "Frontend Developer",
    stack: ["React", "TypeScript", "Next.js"],
    experience: 4,
    companies: ["Яндекс", "Авито"],
  },
  {
    id: "2",
    role: "Backend Developer",
    stack: ["Go", "PostgreSQL", "Kafka"],
    experience: 6,
    companies: ["Тинькофф", "Озон"],
  },
  {
    id: "3",
    role: "ML Engineer",
    stack: ["Python", "PyTorch", "Airflow"],
    experience: 3,
    companies: ["Яндекс", "Сбер"],
  },
  {
    id: "4",
    role: "iOS Developer",
    stack: ["Swift", "SwiftUI", "Combine"],
    experience: 5,
    companies: ["ВКонтакте", "Avito"],
  },
];
