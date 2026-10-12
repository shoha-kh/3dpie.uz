'use strict';

const UPDATED = '2026-10-12';
const WORKS = ['broken-part-restore', 'ev-charger-adapter', 'microchip-cases'];

module.exports = [
  {
    id: 'modeling',
    lang: 'ru',
    type: 'service',
    path: '/3d-modelirovanie/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: '3D-моделирование',
    navTitle: '3D-моделирование по образцу',
    title: '3D-моделирование на заказ в Ташкенте — модель по фото и образцу | 3DPie',
    description: '3D-моделирование на заказ в Ташкенте и Чирчике: построим 3D-модель детали по фото с линейкой, обломку или эскизу и напечатаем её. 3D-сканирование сложных форм, файлы STL и STEP. Консультация бесплатная.',
    kicker: 'Услуга · 3D-моделирование',
    h1: '3D-моделирование деталей по фото, образцу и эскизу',
    lead: 'Нет чертежа — не проблема. Снимем размеры с образца или обломка, построим точную 3D-модель и напечатаем деталь. Модель можно забрать файлом STL или STEP.',
    heroImage: { src: '/gallery/microchip-cases/microchip-cases-poster.webp', w: 800, h: 800, alt: 'Корпус для электроники, смоделированный по запросу клиента и напечатанный на 3D-принтере', caption: '<span>пример</span> Корпус под плату — модель с нуля по размерам клиента' },
    spec: [
      ['Исходные данные', 'фото с линейкой, образец, обломок, эскиз, 3D-скан'],
      ['Результат', 'STL, STEP или готовая деталь'],
      ['Срок', '3–7 дней вместе с печатью'],
      ['Цена', 'считаем по фото, до начала работы']
    ],
    sections: [
      {
        title: 'Что моделируем',
        html: `
<ul>
<li><strong>Копии сломанных деталей</strong> — по обломку или изношенному образцу. Восстанавливаем геометрию, а слабое место, из-за которого деталь сломалась, делаем толще.</li>
<li><strong>Детали по эскизу</strong> — крепления, кронштейны, переходники, держатели под конкретную задачу.</li>
<li><strong>Корпуса для электроники</strong> — под плату, датчик или аккумулятор, с отверстиями под разъёмы и кнопки.</li>
<li><strong>Доработку чужих моделей</strong> — исправим файл STL, подгоним размеры, добавим крепёж.</li>
</ul>`
      },
      {
        title: 'Как снять фото, чтобы мы смогли посчитать',
        html: `
<ol>
<li>Положите деталь на ровный светлый фон рядом с линейкой или рулеткой.</li>
<li>Сфотографируйте сверху, сбоку и с торца — без перспективы, камера параллельно детали.</li>
<li>Если деталь сломана — снимите все обломки и место, куда она ставится.</li>
<li>Напишите, для чего деталь, какую нагрузку держит и будет ли нагреваться.</li>
</ol>
<p>Для сложных деталей точнее работать с образцом: его можно привезти в Чирчик или передать курьером.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Сколько стоит 3D-моделирование?', a: 'Зависит от сложности детали: простую втулку или заглушку смоделировать быстро, корпус с креплениями — дольше. Пришлите фото в Telegram — назовём цену моделирования и печати до начала работы. Минимальный заказ — 100 000 сум.' },
      { q: 'Можно ли получить только файл, без печати?', a: 'Да. Отдадим модель в STL (для печати) или STEP (для доработки в CAD). Печать можно заказать у нас позже.' },
      { q: 'Насколько точной получится копия?', a: 'Посадочные размеры снимаем с образца штангенциркулем. Для деталей, которые должны встать на место, сначала можем напечатать пробный образец и проверить посадку.' }
    ],
    related: ['scanning', 'auto', 'gears', 'prices'],
    service: { name: '3D-моделирование деталей на заказ', serviceType: '3D-моделирование', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/microchip-cases/microchip-cases-poster.webp']
  },
  {
    id: 'modeling',
    lang: 'uz',
    type: 'service',
    path: '/uz/3d-modellashtirish/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: '3D modellashtirish',
    navTitle: "Namuna bo'yicha 3D modellashtirish",
    title: "Toshkentda buyurtma asosida 3D modellashtirish — rasm va namuna bo'yicha model | 3DPie",
    description: "Toshkent va Chirchiqda buyurtma asosida 3D modellashtirish: chizg'ichli rasm, siniq bo'lak yoki eskiz bo'yicha detalning 3D modelini yaratamiz va chop etamiz. Murakkab shakllarni 3D skanerlash, STL va STEP fayllar. Konsultatsiya bepul.",
    kicker: 'Xizmat · 3D modellashtirish',
    h1: "Rasm, namuna va eskiz bo'yicha detallarni 3D modellashtirish",
    lead: "Chizma yo'qmi — muammo emas. Namuna yoki siniq bo'lakdan o'lchamlarni olamiz, aniq 3D model yaratamiz va detalni chop etamiz. Modelni STL yoki STEP fayl sifatida olishingiz mumkin.",
    heroImage: { src: '/gallery/microchip-cases/microchip-cases-poster.webp', w: 800, h: 800, alt: "Mijoz so'rovi bo'yicha modellashtirilgan va 3D printerda chop etilgan elektronika korpusi", caption: "<span>misol</span> Plata uchun korpus — mijoz o'lchamlari bo'yicha noldan model" },
    spec: [
      ["Boshlang'ich ma'lumot", "chizg'ichli rasm, namuna, siniq bo'lak, eskiz, 3D skan"],
      ['Natija', 'STL, STEP yoki tayyor detal'],
      ['Muddat', 'chop etish bilan birga 3–7 kun'],
      ['Narx', "rasm bo'yicha, ish boshlanishidan oldin"]
    ],
    sections: [
      {
        title: 'Nimalarni modellashtiramiz',
        html: `
<ul>
<li><strong>Singan detallar nusxasi</strong> — siniq bo'lak yoki yeyilgan namuna bo'yicha. Geometriyani tiklaymiz, detal sinishiga sabab bo'lgan zaif joyni qalinroq qilamiz.</li>
<li><strong>Eskiz bo'yicha detallar</strong> — aniq vazifa uchun mahkamlagichlar, kronshteynlar, o'tkazgichlar, ushlagichlar.</li>
<li><strong>Elektronika korpuslari</strong> — plata, datchik yoki akkumulyator uchun, razyom va tugmalar teshiklari bilan.</li>
<li><strong>Tayyor modellarni tuzatish</strong> — STL faylni to'g'rilaymiz, o'lchamlarni moslashtiramiz, mahkamlagich qo'shamiz.</li>
</ul>`
      },
      {
        title: 'Narxni hisoblashimiz uchun qanday suratga olish kerak',
        html: `
<ol>
<li>Detalni tekis och rangli fonga chizg'ich yoki ruletka yoniga qo'ying.</li>
<li>Yuqoridan, yon tomondan va uchidan suratga oling — kamera detalga parallel bo'lsin.</li>
<li>Detal singan bo'lsa — barcha bo'laklarni va u o'rnatiladigan joyni suratga oling.</li>
<li>Detal nima uchun kerakligini, qanday yuklamani ko'tarishini va qizib ketish-ketmasligini yozing.</li>
</ol>
<p>Murakkab detallar uchun namuna bilan ishlash aniqroq: uni Chirchiqqa olib kelishingiz yoki kuryer orqali yuborishingiz mumkin.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: '3D modellashtirish qancha turadi?', a: "Detal murakkabligiga bog'liq: oddiy vtulka yoki tiqinni tez modellashtiramiz, mahkamlagichli korpus ko'proq vaqt oladi. Rasmni Telegramga yuboring — modellashtirish va chop etish narxini ish boshlanishidan oldin aytamiz. Minimal buyurtma — 100 000 so'm." },
      { q: 'Faqat faylni olish mumkinmi, chop etmasdan?', a: "Ha. Modelni STL (chop etish uchun) yoki STEP (CAD'da tahrirlash uchun) formatida beramiz. Chop etishni keyinroq bizdan buyurtma qilishingiz mumkin." },
      { q: 'Nusxa qanchalik aniq chiqadi?', a: "O'rnatish o'lchamlarini namunadan shtangensirkul bilan olamiz. Joyiga tushishi kerak bo'lgan detallar uchun avval sinov namunasini chop etib, mosligini tekshirishimiz mumkin." }
    ],
    related: ['scanning', 'auto', 'gears', 'prices'],
    service: { name: 'Buyurtma asosida detallarni 3D modellashtirish', serviceType: '3D modellashtirish', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/microchip-cases/microchip-cases-poster.webp']
  }
];
