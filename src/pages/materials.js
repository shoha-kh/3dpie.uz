'use strict';

const UPDATED = '2026-10-12';

module.exports = [
  {
    id: 'materials',
    lang: 'ru',
    type: 'article',
    path: '/materialy/',
    updated: UPDATED,
    published: UPDATED,
    nav: 'materials',
    breadcrumb: 'Какой пластик выбрать',
    navTitle: 'Какой пластик выбрать',
    title: 'PLA, PETG, ABS, TPU или Nylon: какой пластик выбрать для 3D-печати | 3DPie',
    description: 'Сравнение пластиков для 3D-печати: PLA, PETG, ABS, TPU, Nylon — прочность, термостойкость, гибкость и для каких деталей подходит каждый. Подсказки для автозапчастей, шестерён и деталей для улицы.',
    kicker: 'Статья · материалы',
    h1: 'Какой пластик выбрать для 3D-печати детали',
    lead: 'Коротко: <strong>PLA</strong> — для декора и корпусов в помещении, <strong>PETG</strong> — для прочных деталей и улицы, <strong>ABS</strong> — для салона авто и нагрева, <strong>TPU</strong> — если деталь должна гнуться, <strong>Nylon</strong> — для шестерён и трения. Ниже — подробнее.',
    spec: [
      ['Нагрев в авто', 'ABS, PETG'],
      ['Шестерни, втулки', 'Nylon'],
      ['Гибкие детали', 'TPU'],
      ['Улица и влага', 'PETG'],
      ['Декор, макеты', 'PLA'],
      ['Жёсткие корпуса', 'PETG-CF']
    ],
    sections: [
      {
        title: 'Сравнение пластиков',
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Пластик</th><th scope="col">Термостойкость*</th><th scope="col">Прочность</th><th scope="col">Гибкость</th><th scope="col">Лучше всего для</th></tr></thead>
<tbody>
<tr><th scope="row">PLA</th><td>~55&nbsp;°C</td><td>средняя, хрупкий на удар</td><td>нет</td><td>декор, макеты, корпуса в помещении</td></tr>
<tr><th scope="row">PETG</th><td>~70&nbsp;°C</td><td>высокая, ударостойкий</td><td>немного</td><td>крепления, технические детали, улица, контакт с водой</td></tr>
<tr><th scope="row">PETG-CF</th><td>~75&nbsp;°C</td><td>высокая, очень жёсткий</td><td>нет</td><td>жёсткие корпуса и короба, матовая фактура</td></tr>
<tr><th scope="row">ABS</th><td>~90&nbsp;°C</td><td>высокая</td><td>немного</td><td>детали салона авто, корпуса приборов, нагрев</td></tr>
<tr><th scope="row">TPU</th><td>~60–80&nbsp;°C</td><td>износостойкий</td><td>как резина</td><td>уплотнители, демпферы, втулки, накладки, чехлы</td></tr>
<tr><th scope="row">Nylon</th><td>~80–100&nbsp;°C</td><td>очень высокая</td><td>немного</td><td>шестерни, втулки, нагруженные и трущиеся детали</td></tr>
</tbody>
</table>
</div>
<p class="note">* Примерная температура, при которой деталь начинает размягчаться под нагрузкой. Точные значения зависят от марки пластика и настроек печати.</p>`
      },
      {
        title: 'PLA',
        html: `
<p>Самый распространённый пластик для 3D-печати. Печатается очень точно, держит мелкие детали и хорошо выглядит, поэтому мы делаем из него макеты, декор и корпуса. Минус — боится тепла: в машине на солнце или рядом с горячим прибором деталь из PLA может повести. Для таких задач выбираем PETG или ABS.</p>`
      },
      {
        title: 'PETG',
        html: `
<p>Универсальный инженерный пластик: прочнее и ударостойче PLA, не боится влаги и солнца, держит около 70&nbsp;°C. Хороший выбор для креплений, кронштейнов, деталей для улицы, ванной и кухни.</p>
<p><strong>PETG-CF</strong> — PETG с углеволокном: заметно жёстче и с красивой матовой фактурой. Из него, например, мы сделали <a href="/#work-biokamin-box">декоративный короб для биокамина</a>.</p>`
      },
      {
        title: 'ABS',
        html: `
<p>Из ABS сделана большая часть пластика в салонах автомобилей и корпусах бытовой техники. Он выдерживает нагрев, хорошо шлифуется и красится. Мы используем его для автозапчастей и деталей, которые стоят рядом с источниками тепла. Подробнее — <a href="/avtozapchasti/">автозапчасти на 3D-принтере</a>.</p>`
      },
      {
        title: 'TPU',
        html: `
<p>Гибкий пластик, похожий на резину. Детали из TPU гнутся, пружинят и не трескаются, износостойкие и часто служат дольше силиконовых. Подходит для уплотнителей, демпферов, ножек, накладок, защитных чехлов. Пример — гибкие детали в <a href="/#work-flexible-rubber-parts">наших работах</a>.</p>`
      },
      {
        title: 'Nylon',
        html: `
<p>Самый прочный и износостойкий из наших пластиков. Скользкий, поэтому хорошо работает в трущихся парах: шестерни, втулки, ролики, направляющие. Поглощает влагу из воздуха, поэтому перед печатью его сушат. Подробнее — <a href="/shesterni/">шестерни на заказ</a>.</p>`
      }
    ],
    faq: [
      { q: 'Какой пластик самый прочный?', a: 'Из тех, с которыми мы работаем, — Nylon. Для большинства технических деталей достаточно PETG или ABS.' },
      { q: 'Какой пластик выдержит жару в машине?', a: 'ABS и PETG. PLA для салона автомобиля не подходит — летом на солнце он размягчается.' },
      { q: 'Можно ли напечатать деталь, похожую на резину?', a: 'Да, из TPU. Он гибкий, как резина, и при этом износостойкий.' },
      { q: 'Безопасен ли пластик для контакта с едой?', a: 'Напечатанные детали имеют пористую поверхность, поэтому для постоянного контакта с едой мы их не рекомендуем. Для деталей кухонной техники, которые не касаются продуктов напрямую (шестерни, ручки, крышки), это не проблема.' }
    ],
    related: ['auto', 'gears', 'scanning', 'prices'],
    sitemapImages: []
  },
  {
    id: 'materials',
    lang: 'uz',
    type: 'article',
    path: '/uz/materiallar/',
    updated: UPDATED,
    published: UPDATED,
    nav: 'materials',
    breadcrumb: 'Qaysi plastikni tanlash kerak',
    navTitle: 'Qaysi plastikni tanlash kerak',
    title: 'PLA, PETG, ABS, TPU yoki Nylon: 3D chop etish uchun qaysi plastikni tanlash kerak | 3DPie',
    description: "3D chop etish plastiklarini taqqoslash: PLA, PETG, ABS, TPU, Nylon — mustahkamlik, issiqqa chidamlilik, egiluvchanlik va har biri qaysi detallar uchun mos. Avtoehtiyot qismlar, tishli g'ildiraklar va ko'cha detallari uchun maslahatlar.",
    kicker: 'Maqola · materiallar',
    h1: '3D chop etish uchun qaysi plastikni tanlash kerak',
    lead: "Qisqasi: <strong>PLA</strong> — xonadagi dekor va korpuslar uchun, <strong>PETG</strong> — mustahkam detallar va ko'cha uchun, <strong>ABS</strong> — avtomobil saloni va qizish uchun, <strong>TPU</strong> — detal egilishi kerak bo'lsa, <strong>Nylon</strong> — tishli g'ildiraklar va ishqalanish uchun. Quyida batafsil.",
    spec: [
      ['Avtomobildagi issiq', 'ABS, PETG'],
      ["Tishli g'ildiraklar, vtulkalar", 'Nylon'],
      ['Egiluvchan detallar', 'TPU'],
      ["Ko'cha va namlik", 'PETG'],
      ['Dekor, maketlar', 'PLA'],
      ['Qattiq korpuslar', 'PETG-CF']
    ],
    sections: [
      {
        title: 'Plastiklarni taqqoslash',
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Plastik</th><th scope="col">Issiqqa chidamlilik*</th><th scope="col">Mustahkamlik</th><th scope="col">Egiluvchanlik</th><th scope="col">Eng mos</th></tr></thead>
<tbody>
<tr><th scope="row">PLA</th><td>~55&nbsp;°C</td><td>o'rtacha, zarbaga mo'rt</td><td>yo'q</td><td>dekor, maketlar, xona korpuslari</td></tr>
<tr><th scope="row">PETG</th><td>~70&nbsp;°C</td><td>yuqori, zarbaga chidamli</td><td>biroz</td><td>mahkamlagichlar, texnik detallar, ko'cha, suv bilan aloqa</td></tr>
<tr><th scope="row">PETG-CF</th><td>~75&nbsp;°C</td><td>yuqori, juda qattiq</td><td>yo'q</td><td>qattiq korpuslar va qutilar, mat yuza</td></tr>
<tr><th scope="row">ABS</th><td>~90&nbsp;°C</td><td>yuqori</td><td>biroz</td><td>avtomobil salon detallari, asbob korpuslari, qizish</td></tr>
<tr><th scope="row">TPU</th><td>~60–80&nbsp;°C</td><td>yeyilishga chidamli</td><td>rezinadek</td><td>zichlagichlar, dempferlar, vtulkalar, nakladkalar, g'iloflar</td></tr>
<tr><th scope="row">Nylon</th><td>~80–100&nbsp;°C</td><td>juda yuqori</td><td>biroz</td><td>tishli g'ildiraklar, vtulkalar, yuklamali va ishqalanadigan detallar</td></tr>
</tbody>
</table>
</div>
<p class="note">* Detal yuklama ostida yumshay boshlaydigan taxminiy harorat. Aniq qiymatlar plastik markasi va chop etish sozlamalariga bog'liq.</p>`
      },
      {
        title: 'PLA',
        html: `
<p>3D chop etish uchun eng keng tarqalgan plastik. Juda aniq chop etiladi, mayda detallarni yaxshi ushlaydi va chiroyli ko'rinadi, shuning uchun undan maketlar, dekor va korpuslar yasaymiz. Kamchiligi — issiqdan qo'rqadi: quyoshdagi mashinada yoki issiq asbob yonida PLA detal qiyshayishi mumkin. Bunday vazifalar uchun PETG yoki ABS tanlaymiz.</p>`
      },
      {
        title: 'PETG',
        html: `
<p>Universal muhandislik plastigi: PLA dan mustahkamroq va zarbaga chidamliroq, namlik va quyoshdan qo'rqmaydi, taxminan 70&nbsp;°C ga chidaydi. Mahkamlagichlar, kronshteynlar, ko'cha, hammom va oshxona detallari uchun yaxshi tanlov.</p>
<p><strong>PETG-CF</strong> — uglerod tolali PETG: ancha qattiqroq va chiroyli mat yuzaga ega. Masalan, undan <a href="/uz.html#work-biokamin-box">biokamin uchun dekorativ quti</a> yasadik.</p>`
      },
      {
        title: 'ABS',
        html: `
<p>Avtomobil salonlari va maishiy texnika korpuslaridagi plastikning katta qismi ABS dan qilingan. U qizishga chidaydi, yaxshi silliqlanadi va bo'yaladi. Biz uni avtoehtiyot qismlar va issiqlik manbalari yonidagi detallar uchun ishlatamiz. Batafsil — <a href="/uz/avtoehtiyot-qismlar/">3D printerda avtoehtiyot qismlar</a>.</p>`
      },
      {
        title: 'TPU',
        html: `
<p>Rezinaga o'xshash egiluvchan plastik. TPU detallar egiladi, prujinadek qaytadi va yorilmaydi, yeyilishga chidamli va ko'pincha silikondan uzoqroq xizmat qiladi. Zichlagichlar, dempferlar, oyoqchalar, nakladkalar, himoya g'iloflari uchun mos. Misol — <a href="/uz.html#work-flexible-rubber-parts">ishlarimizdagi</a> egiluvchan detallar.</p>`
      },
      {
        title: 'Nylon',
        html: `
<p>Plastiklarimiz ichida eng mustahkam va yeyilishga chidamlisi. Sirpanchiq, shuning uchun ishqalanadigan juftliklarda yaxshi ishlaydi: tishli g'ildiraklar, vtulkalar, roliklar, yo'naltiruvchilar. Havodagi namlikni yutadi, shuning uchun chop etishdan oldin quritiladi. Batafsil — <a href="/uz/tishli-gildiraklar/">buyurtma asosida tishli g'ildiraklar</a>.</p>`
      }
    ],
    faq: [
      { q: 'Qaysi plastik eng mustahkam?', a: "Biz ishlaydiganlar ichida — Nylon. Ko'pchilik texnik detallar uchun PETG yoki ABS yetarli." },
      { q: 'Qaysi plastik mashinadagi issiqqa chidaydi?', a: 'ABS va PETG. PLA avtomobil saloni uchun mos emas — yozda quyoshda yumshaydi.' },
      { q: 'Rezinaga o\'xshash detal chop etish mumkinmi?', a: "Ha, TPU dan. U rezinadek egiluvchan va shu bilan birga yeyilishga chidamli." },
      { q: 'Plastik oziq-ovqat bilan aloqa uchun xavfsizmi?', a: "Chop etilgan detallar g'ovak sirtga ega, shuning uchun oziq-ovqat bilan doimiy aloqa uchun tavsiya etmaymiz. Mahsulotlarga bevosita tegmaydigan oshxona texnikasi detallari (shesternyalar, dastaklar, qopqoqlar) uchun bu muammo emas." }
    ],
    related: ['auto', 'gears', 'scanning', 'prices'],
    sitemapImages: []
  }
];
