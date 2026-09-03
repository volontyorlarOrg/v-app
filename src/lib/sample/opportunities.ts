import { tashkentInstant } from "@/lib/datetime";
import type {
  LocalizedText,
  OpportunityDetail,
  Organization,
} from "@/lib/opportunities/types";

export const SAMPLE_ORGANIZATIONS = {
  reading: {
    id: "org-reading",
    name: {
      uz: "Chilonzor kitob burchaklari",
      ru: "Книжные уголки Чиланзара",
      en: "Chilonzor Reading Corners",
    },
    verified: true,
  },
  green: {
    id: "org-green",
    name: {
      uz: "Yashil yoʻlak jamoasi",
      ru: "Группа «Зелёный коридор»",
      en: "Green Corridor Group",
    },
    verified: false,
  },
  desk: {
    id: "org-desk",
    name: {
      uz: "Volontyorlar yordam stoli",
      ru: "Стол поддержки волонтёров",
      en: "Volunteer Support Desk",
    },
    verified: true,
  },
  forum: {
    id: "org-forum",
    name: {
      uz: "Hududiy taʼlim forumi",
      ru: "Региональный образовательный форум",
      en: "Regional Education Forum",
    },
    verified: true,
  },
  centre: {
    id: "org-centre",
    name: {
      uz: "Mahalla oʻquv markazi",
      ru: "Махаллинский учебный центр",
      en: "Neighbourhood Learning Centre",
    },
    verified: true,
  },
  sport: {
    id: "org-sport",
    name: {
      uz: "Shahar sport bayrami jamoasi",
      ru: "Команда городского спортивного праздника",
      en: "City Sports Day Team",
    },
    verified: false,
  },
  aid: {
    id: "org-aid",
    name: {
      uz: "Mahalla yordam nuqtasi",
      ru: "Пункт помощи махалли",
      en: "Neighbourhood Aid Point",
    },
    verified: false,
  },
  history: {
    id: "org-history",
    name: {
      uz: "Shahar tarixi xonasi",
      ru: "Комната истории города",
      en: "City History Room",
    },
    verified: false,
  },
} as const satisfies Record<string, Organization>;

const TASHKENT: LocalizedText = { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" };
const SAMARKAND: LocalizedText = { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" };
const FERGANA: LocalizedText = { uz: "Fargʻona", ru: "Фергана", en: "Fergana" };
const BUKHARA: LocalizedText = { uz: "Buxoro", ru: "Бухара", en: "Bukhara" };
const URGENCH: LocalizedText = { uz: "Urganch", ru: "Ургенч", en: "Urgench" };

export function sampleOpportunities(now: Date = new Date()): OpportunityDetail[] {
  const at = (days: number, hour: number, minute = 0) =>
    tashkentInstant(now, days, hour, minute);

  return [
    {
      id: "smp-book-drive",
      slug: "winter-book-drive",
      title: {
        uz: "Kitob burchaklari uchun qishki kitob yigʻish",
        ru: "Зимний сбор книг для читальных уголков",
        en: "Winter book drive for reading corners",
      },
      organization: SAMPLE_ORGANIZATIONS.reading,
      region: "tashkent-city",
      city: TASHKENT,
      locationName: {
        uz: "Chilonzor, markaziy yigʻilish nuqtasi",
        ru: "Чиланзар, центральная точка сбора",
        en: "Central meeting point, Chilonzor",
      },
      format: "onsite",
      status: "open",
      startsAt: at(12, 9),
      endsAt: at(13, 17),
      applicationDeadline: at(7, 18),
      capacity: 40,
      spotsRemaining: 14,
      sourcedByTeam: true,
      description: {
        uz: "Volontyorlar shanba kuni ertalab yigʻilib, hadya qilingan kitoblarni yosh guruhlari boʻyicha saralaydi, yorliqlaydi va yetkazib berishga tayyorlaydi. Yakshanba kuni uch kishilik jamoalar qutilarni kitob burchaklariga olib boradi va javonlarni joylashtirishga yordam beradi. Tajriba shart emas: qisqa yoʻriqnoma hammasini tushuntiradi, ikki kun ham tushlik beriladi.",
        ru: "В субботу утром волонтёры сортируют подаренные книги по возрастным группам, маркируют их и упаковывают для доставки. В воскресенье команды по три человека развозят коробки по читальным уголкам и помогают расставить полки. Опыт не нужен: короткий инструктаж объяснит всё, обед в оба дня.",
        en: "Volunteers meet on Saturday morning to sort donated books by age group, label them and pack them for delivery. On Sunday teams of three deliver the boxes to reading corners and help set up the shelves. No experience is needed; a short briefing covers everything, and lunch is provided on both days.",
      },
      requirements: [
        {
          uz: "Shanba va yakshanba kunlari boʻsh boʻlish",
          ru: "Свободны в субботу и воскресенье",
          en: "Available both Saturday and Sunday",
        },
        {
          uz: "10 kg gacha qutilarni koʻtara olish",
          ru: "Можете поднимать коробки до 10 кг",
          en: "Comfortable lifting boxes up to 10 kg",
        },
        {
          uz: "16 yosh va undan katta",
          ru: "Возраст от 16 лет",
          en: "Age 16 or older",
        },
      ],
      questions: [
        {
          id: "q-motivation",
          prompt: {
            uz: "Nega bu kitob yigʻish aksiyasiga qoʻshilmoqchisiz?",
            ru: "Почему вы хотите участвовать в сборе книг?",
            en: "Why do you want to join this book drive?",
          },
          help: {
            uz: "Bir necha samimiy jumla uzun inshodan yaxshi.",
            ru: "Несколько честных предложений лучше длинного эссе.",
            en: "A few honest sentences are better than a long essay.",
          },
          type: "long_text",
          required: true,
          maxLength: 800,
        },
        {
          id: "q-availability",
          prompt: {
            uz: "Qaysi kunlari qatnasha olasiz?",
            ru: "В какие дни вы можете прийти?",
            en: "Which days can you attend?",
          },
          type: "multi_select",
          required: true,
          options: [
            {
              value: "saturday",
              label: { uz: "Shanba", ru: "Суббота", en: "Saturday" },
            },
            {
              value: "sunday",
              label: { uz: "Yakshanba", ru: "Воскресенье", en: "Sunday" },
            },
          ],
        },
      ],
    },
    {
      id: "smp-river-cleanup",
      slug: "riverbank-clean-up",
      title: {
        uz: "Daryo boʻyini tozalash va chiqindi hisobi",
        ru: "Уборка берега реки и учёт отходов",
        en: "Riverbank clean-up and waste audit",
      },
      organization: SAMPLE_ORGANIZATIONS.green,
      region: "samarkand",
      city: SAMARKAND,
      format: "onsite",
      status: "open",
      startsAt: at(5, 8),
      applicationDeadline: at(2, 18),
      capacity: 60,
      spotsRemaining: 31,
      sourcedByTeam: true,
      description: {
        uz: "Jamoalar daryo boʻyidagi belgilangan ikki kilometrlik uchastkani yurib oʻtadi, chiqindilarni yigʻadi va topilganlarni bir sahifali hisob varagʻiga yozadi. Hisoblar qoʻshimcha axlat qutilari boʻyicha taklifga asos boʻladi. Qoʻlqop, xalta va varaqlar beriladi; yopiq poyabzalda keling.",
        ru: "Команды проходят размеченный двухкилометровый участок берега, собирают мусор и записывают находки в одностраничный лист учёта. Подсчёты лягут в основу предложения о новых урнах. Перчатки, пакеты и листы выдаются; приходите в закрытой обуви.",
        en: "Teams walk a marked two-kilometre stretch of the riverbank, collect litter and record what they find on a one-page tally sheet. The counts feed a proposal for more bins. Gloves, bags and tally sheets are provided; wear closed shoes.",
      },
      requirements: [
        { uz: "Yopiq poyabzal", ru: "Закрытая обувь", en: "Closed shoes" },
        {
          uz: "14 yoshdan, vasiy roziligi bilan",
          ru: "Возраст от 14 лет с согласия опекуна",
          en: "Age 14 or older with guardian consent",
        },
      ],
      questions: [
        {
          id: "q-experience",
          prompt: {
            uz: "Ilgari tozalash aksiyasida qatnashganmisiz? Qisqacha yozing.",
            ru: "Участвовали ли вы раньше в уборках? Расскажите коротко.",
            en: "Have you taken part in a clean-up before? Tell us briefly.",
          },
          type: "short_text",
          required: false,
          maxLength: 200,
        },
      ],
    },
    {
      id: "smp-translation",
      slug: "remote-translation-support",
      title: {
        uz: "Volontyor qoʻllanmalarini masofadan tarjima qilish",
        ru: "Удалённый перевод памяток для волонтёров",
        en: "Remote translation of volunteer guides",
      },
      organization: SAMPLE_ORGANIZATIONS.desk,
      region: "tashkent-city",
      format: "remote",
      status: "open",
      startsAt: at(3, 9),
      endsAt: at(17, 18),
      applicationDeadline: at(1, 18),
      sourcedByTeam: false,
      description: {
        uz: "Yangi volontyorlar uchun bir sahifali qoʻllanmalar faqat oʻzbek tilida mavjud. Tarjimonlar bittadan qoʻllanma olib tarjima qiladi, ikkinchi volontyor esa tekshiradi. Ish asinxron: rejalashtirilgan qoʻngʻiroqlar yoʻq.",
        ru: "Одностраничные памятки для новых волонтёров существуют только на узбекском. Переводчики берут по одной памятке, переводят её, а второй волонтёр проверяет. Работа асинхронная: созвонов по расписанию нет.",
        en: "One-page guides for new volunteers exist only in Uzbek. Translators pick up one guide at a time, translate it, and a second volunteer reviews it. The work is asynchronous; there are no scheduled calls.",
      },
      requirements: [
        {
          uz: "Oʻzbek, rus va ingliz tillaridan kamida ikkitasini yaxshi bilish",
          ru: "Свободное владение минимум двумя из языков: узбекский, русский, английский",
          en: "Fluent in at least two of Uzbek, Russian and English",
        },
        {
          uz: "Ikki hafta davomida taxminan toʻrt soat",
          ru: "Около четырёх часов за две недели",
          en: "About four hours across two weeks",
        },
      ],
      questions: [
        {
          id: "q-languages",
          prompt: {
            uz: "Qaysi til juftliklari orasida tarjima qila olasiz?",
            ru: "Между какими парами языков вы можете переводить?",
            en: "Which language pairs can you translate between?",
          },
          type: "short_text",
          required: true,
          maxLength: 200,
        },
      ],
    },
    {
      id: "smp-science-fair",
      slug: "school-science-fair-mentors",
      title: {
        uz: "Maktab ilmiy koʻrgazmasi uchun mentorlar",
        ru: "Наставники для школьной научной ярмарки",
        en: "Mentors for a school science fair",
      },
      organization: SAMPLE_ORGANIZATIONS.forum,
      region: "fergana",
      city: FERGANA,
      format: "hybrid",
      status: "open",
      startsAt: at(25, 13),
      endsAt: at(26, 18),
      applicationDeadline: at(18, 18),
      capacity: 20,
      spotsRemaining: 20,
      sourcedByTeam: true,
      description: {
        uz: "Har bir mentor ikki kun tushdan keyin ikkita maktab jamoasi bilan ishlaydi va loyihasini aniq besh daqiqalik taqdimotga aylantirishga yordam beradi. Siz baholamaysiz va ilmiy tayyorgarlik shart emas. Yoʻriqnoma bir hafta oldin yuboriladi.",
        ru: "Каждый наставник два дня после обеда работает с двумя школьными командами и помогает превратить проект в понятную пятиминутную презентацию. Вы не судите, и научное образование не требуется. Материалы присылают за неделю.",
        en: "Each mentor is paired with two school teams for two afternoons and helps them turn their project into a clear five-minute presentation. You do not judge and you do not need a science background. A briefing pack is sent a week before.",
      },
      requirements: [
        {
          uz: "Ketma-ket ikki kun tushdan keyin boʻsh boʻlish",
          ru: "Свободны два дня подряд после обеда",
          en: "Available two consecutive afternoons",
        },
        {
          uz: "18 yosh va undan katta",
          ru: "Возраст от 18 лет",
          en: "Age 18 or older",
        },
      ],
      questions: [
        {
          id: "q-approach",
          prompt: {
            uz: "Jamoa loyihasini tushuntiradi, siz esa tushunmaysiz. Nima qilasiz?",
            ru: "Команда объясняет проект, а вы его не понимаете. Что вы сделаете?",
            en: "A team explains their project and you do not understand it. What do you do?",
          },
          type: "long_text",
          required: true,
          maxLength: 600,
        },
      ],
    },
    {
      id: "smp-digital-tutors",
      slug: "digital-skills-tutors",
      title: {
        uz: "Keksalar uchun raqamli koʻnikmalar oʻqituvchilari",
        ru: "Наставники цифровых навыков для пожилых людей",
        en: "Digital skills tutors for older residents",
      },
      organization: SAMPLE_ORGANIZATIONS.centre,
      region: "tashkent-city",
      city: TASHKENT,
      locationName: {
        uz: "Mahalla markazi, ikkinchi qavat",
        ru: "Махаллинский центр, второй этаж",
        en: "Community centre, second floor",
      },
      format: "onsite",
      status: "open",
      startsAt: at(20, 16),
      endsAt: at(62, 17),
      applicationDeadline: at(14, 18),
      capacity: 12,
      spotsRemaining: 5,
      sourcedByTeam: false,
      description: {
        uz: "Olti haftalik majburiyat, haftasiga bir soat, har safar bir xil bir-ikki kishi bilan: xabar yozish, video qoʻngʻiroqlar va firibgar xabarlarni aniqlash. Dars rejalari beriladi; materialni oʻzingiz tayyorlamaysiz.",
        ru: "Шесть недель, по часу в неделю, каждый раз с теми же одним-двумя людьми: сообщения, видеозвонки и распознавание мошеннических сообщений. Планы занятий выдаются; готовить материалы самим не нужно.",
        en: "A six-week commitment, one hour per week, with the same one or two people each time: messaging, video calls and spotting scam messages. Lesson outlines are provided; you do not prepare material yourself.",
      },
      requirements: [
        {
          uz: "Olti hafta ketma-ket qatnasha olish",
          ru: "Готовность к шести неделям подряд",
          en: "Able to commit six consecutive weeks",
        },
        {
          uz: "Sabrli va bir narsani ikki marta tushuntirishdan qoʻrqmaydigan",
          ru: "Терпение и готовность объяснить одно и то же дважды",
          en: "Patient, and comfortable explaining the same thing twice",
        },
      ],
      questions: [
        {
          id: "q-commitment",
          prompt: {
            uz: "Barcha olti haftaga vaqt ajrata olasizmi? Boʻlmasa, qaysi haftalar mos?",
            ru: "Сможете ли вы все шесть недель? Если нет, какие недели подходят?",
            en: "Can you commit to all six weeks? If not, which weeks work?",
          },
          type: "short_text",
          required: true,
          maxLength: 300,
        },
        {
          id: "q-teaching",
          prompt: {
            uz: "Kimgadir texnik narsani tushuntirgan holatingizni yozing.",
            ru: "Опишите случай, когда вы объясняли кому-то что-то техническое.",
            en: "Describe a time you explained something technical to someone.",
          },
          type: "long_text",
          required: true,
          maxLength: 800,
        },
      ],
    },
    {
      id: "smp-marathon",
      slug: "city-marathon-water-stations",
      title: {
        uz: "Shahar marafonida suv punktlari",
        ru: "Пункты воды на городском марафоне",
        en: "Water stations at the city marathon",
      },
      organization: SAMPLE_ORGANIZATIONS.sport,
      region: "tashkent-city",
      city: TASHKENT,
      format: "onsite",
      status: "open",
      startsAt: at(10, 7),
      endsAt: at(10, 12),
      applicationDeadline: at(4, 18),
      capacity: 80,
      spotsRemaining: 40,
      sourcedByTeam: true,
      description: {
        uz: "Oʻn kilometrlik marshrut boʻylab suv punktlarida stakanlarni toʻldirish, tarqatish va stolni tartibli saqlash uchun odamlar kerak. Smenalar uch soat; har bir punktda koordinator bor.",
        ru: "На пунктах воды вдоль десятикилометровой трассы нужны люди, чтобы наполнять стаканы, раздавать их и держать стол в порядке. Смены по три часа; на каждом пункте есть координатор.",
        en: "Water stations along the ten-kilometre route need people to fill cups, hand them out and keep the table tidy. Shifts are three hours; a coordinator is at every station.",
      },
      requirements: [
        {
          uz: "Ertalab 6:30 dan boʻsh boʻlish",
          ru: "Свободны с 6:30 утра",
          en: "Available from 6:30 in the morning",
        },
      ],
      questions: [
        {
          id: "q-shift",
          prompt: {
            uz: "Qaysi smena sizga mos?",
            ru: "Какая смена вам подходит?",
            en: "Which shift suits you?",
          },
          type: "single_select",
          required: true,
          options: [
            {
              value: "early",
              label: { uz: "06:30–09:30", ru: "06:30–09:30", en: "06:30–09:30" },
            },
            {
              value: "late",
              label: { uz: "09:30–12:30", ru: "09:30–12:30", en: "09:30–12:30" },
            },
          ],
        },
      ],
    },
    {
      id: "smp-clothing-sort",
      slug: "winter-clothing-sorting-day",
      title: {
        uz: "Qishki kiyimlarni saralash kuni",
        ru: "День сортировки зимней одежды",
        en: "Winter clothing sorting day",
      },
      organization: SAMPLE_ORGANIZATIONS.aid,
      region: "bukhara",
      city: BUKHARA,
      format: "onsite",
      status: "full",
      startsAt: at(9, 14),
      applicationDeadline: at(4, 18),
      capacity: 25,
      spotsRemaining: 0,
      sourcedByTeam: true,
      description: {
        uz: "Hadya qilingan palto, etik va trikotaj saralanmagan holda keladi. Volontyorlar holatini tekshiradi, oʻlchami boʻyicha guruhlaydi va yorliqli qutilarga joylaydi. Choy va yengil taom beriladi.",
        ru: "Подаренные пальто, обувь и трикотаж приходят неразобранными. Волонтёры проверяют состояние, группируют вещи по размеру и упаковывают в подписанные ящики. Чай и перекус предоставляются.",
        en: "Donated coats, boots and knitwear arrive unsorted. Volunteers check condition, group items by size and pack them into labelled crates. Tea and snacks are provided.",
      },
      requirements: [
        {
          uz: "15 yosh va undan katta",
          ru: "Возраст от 15 лет",
          en: "Age 15 or older",
        },
      ],
      questions: [],
    },
    {
      id: "smp-read-aloud",
      slug: "read-aloud-day",
      title: {
        uz: "Bolalar kutubxonasida ovoz chiqarib oʻqish kuni",
        ru: "День чтения вслух в детской библиотеке",
        en: "Read-aloud day at the children’s library",
      },
      organization: SAMPLE_ORGANIZATIONS.reading,
      region: "tashkent-city",
      city: TASHKENT,
      locationName: {
        uz: "Tuman kutubxonasi, oʻquv zali",
        ru: "Районная библиотека, читальный зал",
        en: "District library, reading room",
      },
      format: "onsite",
      status: "closed",
      startsAt: at(2, 10),
      endsAt: at(2, 13),
      applicationDeadline: at(-3, 18),
      capacity: 10,
      sourcedByTeam: true,
      description: {
        uz: "Tuman kutubxonasida besh-toʻqqiz yoshli bolalarga ovoz chiqarib oʻqish tongi. Volontyorlar kutubxonachilar tanlagan rasmli kitoblarni navbatma-navbat oʻqiydi; qisqa tayyorgarlik mashgʻuloti tezlik va ovozni oʻrgatadi.",
        ru: "Утро чтения вслух детям пяти–девяти лет в районной библиотеке. Волонтёры по очереди читают книжки с картинками, выбранные библиотекарями; короткая разминка учит темпу и подаче.",
        en: "A morning of reading aloud to children aged five to nine in the district library. Volunteers take turns with picture books chosen by the librarians; a short warm-up covers pacing and voice.",
      },
      requirements: [
        {
          uz: "Oʻzbek yoki rus tilida ishonch bilan oʻqiy olish",
          ru: "Уверенное чтение на узбекском или русском",
          en: "Confident reading in Uzbek or Russian",
        },
      ],
      questions: [],
    },
    {
      id: "smp-tree-planting",
      slug: "district-park-planting",
      title: {
        uz: "Tuman bogʻida koʻchat ekish",
        ru: "Посадка деревьев в районном парке",
        en: "Tree planting in the district park",
      },
      organization: SAMPLE_ORGANIZATIONS.green,
      region: "tashkent-city",
      city: TASHKENT,
      locationName: {
        uz: "Bogʻning shimoliy darvozasi",
        ru: "Северные ворота парка",
        en: "North gate of the park",
      },
      format: "onsite",
      status: "closed",
      startsAt: at(9, 8),
      endsAt: at(9, 12),
      applicationDeadline: at(-1, 18),
      capacity: 30,
      sourcedByTeam: false,
      description: {
        uz: "Tuman koʻkalamzorlashtirish jamoasi bilan bogʻning shimoliy xiyoboni boʻylab koʻchat ekish. Asbob va qoʻlqoplar beriladi; suv olib keling va loy boʻlishi mumkin boʻlgan kiyimda keling.",
        ru: "Посадка саженцев вдоль северной аллеи парка вместе с районной командой озеленения. Инструменты и перчатки выдаются; возьмите воду и наденьте одежду, которую не жалко испачкать.",
        en: "Planting saplings along the park’s north alley with the district greening team. Tools and gloves are provided; bring water and wear clothes that can get muddy.",
      },
      requirements: [
        {
          uz: "14 yosh va undan katta",
          ru: "Возраст от 14 лет",
          en: "Age 14 or older",
        },
      ],
      questions: [],
    },
    {
      id: "smp-archive",
      slug: "photo-archive-digitisation",
      title: {
        uz: "Foto arxivni raqamlashtirish",
        ru: "Оцифровка фотоархива",
        en: "Photo archive digitisation",
      },
      organization: SAMPLE_ORGANIZATIONS.history,
      region: "khorezm",
      city: URGENCH,
      format: "onsite",
      status: "closed",
      startsAt: at(-4, 10),
      applicationDeadline: at(-11, 18),
      sourcedByTeam: true,
      description: {
        uz: "Mahalliy foto arxivni skanerlash va izohlash. Bu bosqich uchun arizalar yopilgan.",
        ru: "Сканирование и подписи к местному фотоархиву. Приём заявок на этот этап закрыт.",
        en: "Scanning and captioning a local photo archive. Applications for this round have closed.",
      },
      requirements: [],
      questions: [],
    },
  ];
}

export function sampleOpportunity(
  slug: string,
  now: Date = new Date(),
): OpportunityDetail | null {
  return (
    sampleOpportunities(now).find((opportunity) => opportunity.slug === slug) ?? null
  );
}
