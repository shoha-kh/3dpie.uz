'use strict';

const UPDATED = '2026-10-12';

module.exports = [
  {
    id: 'prices',
    lang: 'ru',
    type: 'service',
    path: '/ceny/',
    updated: UPDATED,
    nav: 'prices',
    breadcrumb: 'Цены на 3D-печать',
    navTitle: 'Цены на 3D-печать',
    title: 'Цены на 3D-печать в Ташкенте — заказ от 100 000 сум | 3DPie',
    description: 'Сколько стоит 3D-печать в Ташкенте и Чирчике: от 1 000 сум за грамм, калькулятор цены по STL-файлу, минимальный заказ 100 000 сум, сроки 1–7 дней. Точную цену назовём в Telegram.',
    kicker: 'Цены и сроки',
    h1: 'Сколько стоит 3D-печать в Ташкенте',
    lead: 'Цена считается по весу пластика: PLA, PETG и ABS — <strong>1 000 сум за грамм</strong>, минимальный заказ — <strong>100 000 сум</strong>. Загрузите STL в <a href="#calc">калькулятор</a> и узнайте примерную цену, а точную назовём в Telegram.',
    calc: true,
    spec: [
      ['PLA, PETG, ABS', '1 000 сум/г'],
      ['PETG-CF, TPU', '1 500 сум/г'],
      ['Nylon PA6', '5 000 сум/г'],
      ['Минимальный заказ', '100 000 сум'],
      ['Консультация', 'бесплатно'],
      ['Сроки', '1–7 дней']
    ],
    sections: [
      {
        title: 'От чего зависит цена',
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Фактор</th><th scope="col">Как влияет</th></tr></thead>
<tbody>
<tr><th scope="row">Вес детали</th><td>Платите за граммы пластика: чем больше деталь и плотнее заполнение, тем она тяжелее и дороже. Мелкие клипсы и заглушки — самые недорогие заказы.</td></tr>
<tr><th scope="row">Пластик</th><td>PLA, PETG и ABS — 1 000 сум за грамм, PETG-CF и TPU — 1 500 сум, Nylon PA6 — 5 000 сум.</td></tr>
<tr><th scope="row">3D-модель</th><td>Если у вас есть готовый файл STL или STEP — платите только за печать. Если модель нужно построить по образцу — добавляется моделирование.</td></tr>
<tr><th scope="row">Количество</th><td>В серии цена за штуку ниже: модель уже готова, а принтеры загружены эффективнее.</td></tr>
<tr><th scope="row">Срочность</th><td>Срочный заказ вне очереди может стоить дороже.</td></tr>
</tbody>
</table>
</div>`
      },
      {
        title: 'Как узнать цену своей детали',
        html: `
<ol>
<li>Есть файл STL — загрузите его в <a href="#calc">калькулятор</a> и посмотрите примерную цену. Нет файла — сфотографируйте деталь рядом с линейкой, сверху и сбоку.</li>
<li>Пришлите файл или фото в Telegram <a href="https://t.me/pie3d" target="_blank" rel="noopener">@pie3d</a> или позвоните <a href="tel:+998901391094">+998 90 139 10 94</a>: для чего деталь, сколько штук, к какому сроку.</li>
<li>Ответим с ценой и сроком. Консультация бесплатная — спрашивать можно о любой идее.</li>
</ol>
<p>Цену называем до начала работы, без скрытых доплат. Для юрлиц — договор и документы.</p>`
      }
    ],
    faq: [
      { q: 'Как считается цена?', a: 'По весу пластика: PLA, PETG и ABS — 1 000 сум за грамм, PETG-CF и TPU — 1 500 сум, Nylon PA6 — 5 000 сум. Калькулятор на этой странице оценивает по STL-файлу вес детали и поддержек под нависающими частями. Точную цену называем после проверки файла: учитываем поддержки, ориентацию детали и, если нужно, доработку модели.' },
      { q: 'Файл из калькулятора куда-то отправляется?', a: 'Нет. Расчёт идёт прямо в браузере: файл не загружается на сервер и не сохраняется. Чтобы заказать печать, пришлите его в Telegram <a href="https://t.me/pie3d" target="_blank" rel="noopener">@pie3d</a>.' },
      { q: 'Какой максимальный размер детали?', a: 'За один раз — до 420 × 420 × 500 мм, из композитных пластиков (PETG-CF) — до 245 × 245 × 245 мм. Если деталь больше, напишите: подскажем, как разделить модель на части.' },
      { q: 'Сколько стоит напечатать одну маленькую деталь?', a: 'Минимальный заказ — 100 000 сум. Мелкие детали выгоднее заказывать партией: например, 200 креплений для кабеля мы напечатали за 2 дня.' },
      { q: 'Есть ли скидки?', a: 'Да: на серии одинаковых деталей и для постоянных клиентов.' }
    ],
    related: ['modeling', 'scanning', 'auto', 'gears'],
    service: { name: '3D-печать на заказ', serviceType: '3D-печать', minPrice: 100000 },
    sitemapImages: []
  },
  {
    id: 'prices',
    lang: 'uz',
    type: 'service',
    path: '/uz/narxlar/',
    updated: UPDATED,
    nav: 'prices',
    breadcrumb: '3D chop etish narxlari',
    navTitle: '3D chop etish narxlari',
    title: "Toshkentda 3D chop etish narxlari — buyurtma 100 000 so'mdan | 3DPie",
    description: "Toshkent va Chirchiqda 3D chop etish (3D pechat) narxi: grammi 1 000 so'mdan, STL fayl bo'yicha narx kalkulyatori, minimal buyurtma 100 000 so'm, muddatlar 1–7 kun. Aniq narxni Telegramda aytamiz.",
    kicker: 'Narxlar va muddatlar',
    h1: 'Toshkentda 3D chop etish qancha turadi',
    lead: "Narx plastik og'irligi bo'yicha hisoblanadi: PLA, PETG va ABS — <strong>grammi 1 000 so'm</strong>, minimal buyurtma — <strong>100 000 so'm</strong>. STL faylni <a href=\"#calc\">kalkulyatorga</a> yuklang va taxminiy narxni biling, aniq narxni Telegramda aytamiz.",
    calc: true,
    spec: [
      ['PLA, PETG, ABS', "1 000 so'm/g"],
      ['PETG-CF, TPU', "1 500 so'm/g"],
      ['Nylon PA6', "5 000 so'm/g"],
      ['Minimal buyurtma', "100 000 so'm"],
      ['Konsultatsiya', 'bepul'],
      ['Muddatlar', '1–7 kun']
    ],
    sections: [
      {
        title: "Narx nimaga bog'liq",
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Omil</th><th scope="col">Qanday ta'sir qiladi</th></tr></thead>
<tbody>
<tr><th scope="row">Detal og'irligi</th><td>Plastik grammlari uchun to'laysiz: detal qancha katta va to'ldirish qancha zich bo'lsa, u shuncha og'ir va qimmat. Mayda klipsa va tiqinlar — eng arzon buyurtmalar.</td></tr>
<tr><th scope="row">Plastik</th><td>PLA, PETG va ABS — grammi 1 000 so'm, PETG-CF va TPU — 1 500 so'm, Nylon PA6 — 5 000 so'm.</td></tr>
<tr><th scope="row">3D model</th><td>Tayyor STL yoki STEP faylingiz bo'lsa — faqat chop etish uchun to'laysiz. Modelni namuna bo'yicha yaratish kerak bo'lsa — modellashtirish qo'shiladi.</td></tr>
<tr><th scope="row">Miqdor</th><td>Seriyada dona narxi arzonroq: model tayyor, printerlar samaraliroq yuklanadi.</td></tr>
<tr><th scope="row">Shoshilinchlik</th><td>Navbatdan tashqari shoshilinch buyurtma qimmatroq bo'lishi mumkin.</td></tr>
</tbody>
</table>
</div>`
      },
      {
        title: 'Detalingiz narxini qanday bilish mumkin',
        html: `
<ol>
<li>STL fayl bo'lsa — uni <a href="#calc">kalkulyatorga</a> yuklang va taxminiy narxni ko'ring. Fayl bo'lmasa — detalni chizg'ich yonida yuqoridan va yon tomondan suratga oling.</li>
<li>Fayl yoki rasmni Telegramga yuboring <a href="https://t.me/pie3d" target="_blank" rel="noopener">@pie3d</a> yoki qo'ng'iroq qiling <a href="tel:+998901391094">+998 90 139 10 94</a>: detal nima uchun, nechta kerak, qachongacha.</li>
<li>Narx va muddat bilan javob beramiz. Konsultatsiya bepul — istalgan g'oya haqida so'rashingiz mumkin.</li>
</ol>
<p>Narxni ish boshlanishidan oldin, yashirin to'lovlarsiz aytamiz. Yuridik shaxslar uchun — shartnoma va hujjatlar.</p>`
      }
    ],
    faq: [
      { q: 'Narx qanday hisoblanadi?', a: "Plastik og'irligi bo'yicha: PLA, PETG va ABS — grammi 1 000 so'm, PETG-CF va TPU — 1 500 so'm, Nylon PA6 — 5 000 so'm. Shu sahifadagi kalkulyator STL fayl bo'yicha detal va osilgan qismlar ostidagi tayanchlar og'irligini taxmin qiladi. Aniq narxni faylni tekshirgandan keyin aytamiz: tayanchlar, detal joylashuvi va kerak bo'lsa modelni tuzatish hisobga olinadi." },
      { q: 'Kalkulyatordagi fayl biror joyga yuboriladimi?', a: "Yo'q. Hisob to'g'ridan-to'g'ri brauzerda bajariladi: fayl serverga yuklanmaydi va saqlanmaydi. Chop etishga buyurtma berish uchun uni Telegramga yuboring <a href=\"https://t.me/pie3d\" target=\"_blank\" rel=\"noopener\">@pie3d</a>." },
      { q: "Detalning maksimal o'lchami qancha?", a: "Bir martada — 420 × 420 × 500 mm gacha, kompozit plastiklardan (PETG-CF) — 245 × 245 × 245 mm gacha. Detal kattaroq bo'lsa, yozing: modelni qismlarga qanday bo'lishni maslahat beramiz." },
      { q: 'Bitta kichik detalni chop etish qancha turadi?', a: "Minimal buyurtma — 100 000 so'm. Mayda detallarni partiya bilan buyurtma qilish foydaliroq: masalan, 200 ta kabel mahkamlagichini 2 kunda chop etdik." },
      { q: 'Chegirmalar bormi?', a: "Ha: bir xil detallar seriyasiga va doimiy mijozlar uchun." }
    ],
    related: ['modeling', 'scanning', 'auto', 'gears'],
    service: { name: 'Buyurtma asosida 3D chop etish', serviceType: '3D chop etish', minPrice: 100000 },
    sitemapImages: []
  }
];
