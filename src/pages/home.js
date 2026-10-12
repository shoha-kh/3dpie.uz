'use strict';

const { CONTACTS } = require('../site');

const UPDATED = '2026-10-12';

const MAP = `<iframe title="%TITLE%" src="${CONTACTS.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;

// Hero visual: a real work under a moving "3D-scan" line + the layer-by-layer print panel.
function heroVisual(c, layout, lang) {
  return `<div class="hero-visual">
                <figure class="scan-card">
                    <img src="/images/work-grille.webp" width="720" height="960" alt="${c.a.alt}" fetchpriority="high">
                    <span class="scanline" aria-hidden="true"></span>
                    <span class="corners" aria-hidden="true"></span>
                    <figcaption>${c.a.cap}</figcaption>
                </figure>
                ${layout.renderPrintViz(lang)}
            </div>`;
}

function servicesList(items) {
  return items.map((s, i) => `                <li><a href="${s.href}"><span class="svc-n">${String(i + 1).padStart(2, '0')}</span><span class="svc-title">${s.t}</span><span class="svc-desc">${s.d}</span><span class="arrow" aria-hidden="true">→</span></a></li>`).join('\n');
}

function materialsRows(rows) {
  return rows.map(r => `                        <tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('\n');
}

function factsList(items) {
  return items.map(f => `                <li><h3>${f[0]}</h3><p>${f[1]}</p></li>`).join('\n');
}

// ---------------------------------------------------------------- RU

const ruFaq = [
  {
    q: 'Сколько стоит 3D-печать в Ташкенте?',
    a: 'Минимальный заказ в 3DPie — 100 000 сум. Итоговая цена зависит от размера детали, пластика, сложности модели и срочности. Пришлите фото или файл в Telegram — консультация бесплатная, цену назовём до начала работы. Подробнее — <a href="/ceny/">цены на 3D-печать</a>.'
  },
  {
    q: 'Можно ли сделать деталь без чертежа и 3D-модели?',
    a: 'Да. Достаточно фото детали рядом с линейкой, обломка или старой детали. Сложные формы снимаем 3D-сканером. Строим модель, усиливаем слабое место, из-за которого оригинал сломался, и печатаем копию. Подробнее — <a href="/3d-modelirovanie/">3D-моделирование</a> и <a href="/3d-skanirovanie/">3D-сканирование</a>.'
  },
  {
    q: 'Сколько времени занимает изготовление?',
    a: 'Простая деталь готова за 1–2 дня, сложный проект со сканированием и моделированием — 3–7 дней. Серии печатаем параллельно: например, партию из 200 креплений для кабеля сделали за 2 дня.'
  },
  {
    q: 'Где вы находитесь и как получить заказ?',
    a: 'Производство — в Чирчике (Ташкентская область), ул. Амира Тимура, 62а, ориентир — 10-я автобаза. Заказ можно забрать самому, заказать курьера по Ташкенту и Ташкентской области, а в другие регионы отправляем через BTS или Яндекс Доставку (доставка платная).'
  },
  {
    q: 'Из каких материалов вы печатаете?',
    a: 'PLA, PETG, PETG-CF (с углеволокном), ABS, Nylon и гибкий TPU — из него получаются резиновые детали, которые служат дольше силиконовых. Материал подбираем под задачу. Сравнение — в статье <a href="/materialy/">какой пластик выбрать</a>.'
  },
  {
    q: 'Вы работаете с компаниями?',
    a: 'Да, делаем пластиковые и резиновые детали для частных клиентов и бизнеса: договор, документы, серийные партии. Для серий и постоянных клиентов действуют скидки.'
  },
  {
    q: 'Какая гарантия?',
    a: 'Каждую деталь проверяем перед выдачей. Если обнаружится брак — переделаем бесплатно.'
  }
];

const ruServices = [
  { href: '/3d-modelirovanie/', t: '3D-моделирование по фото и образцу', d: 'Модель по обломку, фото с линейкой или эскизу. Отдаём STL и STEP или сразу печатаем.' },
  { href: '/3d-skanirovanie/', t: '3D-сканирование и реверс-инжиниринг', d: 'Снимаем сложную форму сканером, восстанавливаем и усиливаем сломанные детали.' },
  { href: '/avtozapchasti/', t: 'Автозапчасти и детали салона', d: 'Клипсы, заглушки, дефлекторы, решётки, накладки под твитеры, рамки, декоративные элементы.' },
  { href: '/shesterni/', t: 'Шестерни и детали для техники', d: 'Шестерни для мясорубок и блендеров, втулки, ролики, ручки — когда оригинал не найти.' },
  { href: '/materialy/', t: 'Резиновые детали из TPU', d: 'Гибкие, износостойкие уплотнители, втулки и накладки — служат дольше силикона.' },
  { href: '/#work-cable-clips-batch', t: 'Серийные партии', d: 'Одинаковые детали десятками и сотнями: 200 креплений для кабеля — за 2 дня.' },
  { href: '/#gallery', t: 'Корпуса и изделия на заказ', d: 'Корпуса для электроники, короба из PETG-CF, декор для аквариума — по вашей идее.' }
];

const ruMaterials = [
  ['PLA', 'Жёсткий и точный, но размягчается примерно от 55&nbsp;°C', 'Макеты, декор, корпуса в помещении'],
  ['PETG', 'Прочный, не боится влаги, держит около 70&nbsp;°C', 'Крепления, технические детали, улица'],
  ['PETG-CF', 'PETG с углеволокном: очень жёсткий, матовая фактура', 'Жёсткие корпуса и короба'],
  ['ABS', 'Термостойкий (до ~90&nbsp;°C), хорошо шлифуется', 'Детали салона авто, корпуса приборов'],
  ['TPU', 'Гибкий, как резина, износостойкий', 'Уплотнители, втулки, демпферы, накладки'],
  ['Nylon', 'Очень прочный, низкое трение', 'Шестерни, втулки, нагруженные узлы']
];

const ruFacts = [
  ['Без чертежа', 'Хватит фото с линейкой, обломка или старой детали. Сложную форму снимем 3D-сканером.'],
  ['Консультация бесплатно', 'Спросите о любой идее. Цену называем до начала работы, без скрытых доплат.'],
  ['Своё производство', 'Печатаем в Чирчике, без посредников. Детали из пластика и резины.'],
  ['Гарантия', 'Каждую деталь проверяем перед выдачей. Брак переделываем бесплатно.'],
  ['Серии быстро', 'Партию из 200 одинаковых деталей сделали за 2 дня. Для серий — скидки.'],
  ['По всей стране', 'Курьер по Ташкенту и области, в регионы — BTS или Яндекс Доставка.']
];

function renderRu(ctx) {
  const { layout } = ctx;
  return `    <section class="hero">
        <div class="wrap hero-grid">
            <div class="hero-copy">
                <p class="kicker">3D-печать на заказ · Ташкент и Чирчик</p>
                <h1 class="hero-title">Напечатаем деталь, которую <em>больше нигде</em> не купить</h1>
                <p class="lead">Пришлите фото, размеры или привезите образец — отсканируем, смоделируем и напечатаем копию из прочного пластика или резины. Для частных клиентов и бизнеса.</p>
                ${layout.renderCtaButtons('ru')}
${layout.renderSpec([
    ['Заказ', 'от 100 000 сум'],
    ['Простая деталь', '1–2 дня'],
    ['Консультация', 'бесплатно'],
    ['Доставка', 'Ташкент и область, регионы — BTS / Яндекс']
  ], 'hero-spec')}
            </div>
            ${heroVisual({ a: { alt: 'Решётка воздухозаборника автомобиля, напечатанная на 3D-принтере под заказ', cap: 'Решётка для авто · под заказ' } }, layout, 'ru')}
        </div>
    </section>

    <section class="section section-services" id="services">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">Что мы <em>делаем</em></h2>
                <p class="section-note">Детали по фото, образцу, 3D-скану или чертежу. Нет 3D-модели — сделаем сами.</p>
            </div>
            <ul class="svc-list">
${servicesList(ruServices)}
            </ul>
        </div>
    </section>

    <section class="section section-works" id="gallery">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">Сделано <em>в 3DPie</em></h2>
                <p class="section-note">Реальные заказы — нажмите на карточку, чтобы посмотреть видео. Новые работы выкладываем в <a href="${CONTACTS.instagram}" target="_blank" rel="noopener">Instagram ${CONTACTS.instagramHandle}</a>.</p>
            </div>
            <div class="works-grid">
                <!-- GALLERY:START -->
                <!-- GALLERY:END -->
            </div>
        </div>
    </section>

${layout.renderSteps('ru', 'how')}

    <section class="price-band">
        <div class="wrap price-grid">
            <div>
                <p class="kicker">Цены</p>
                <p class="price-big"><small>от</small> 100&nbsp;000 <small>сум</small></p>
                <p>Минимальный заказ. Цена детали зависит от размера, материала, сложности модели и срочности — называем её до начала работы. Консультация бесплатная.</p>
                <a class="btn btn-paper" href="/ceny/">Как считается цена <span aria-hidden="true">→</span></a>
            </div>
${layout.renderSpec([
    ['Простая деталь', '1–2 дня'],
    ['Скан + модель + печать', '3–7 дней'],
    ['Серия', '200 деталей за 2 дня'],
    ['Серии и постоянные клиенты', 'скидки']
  ])}
        </div>
    </section>

    <section class="section section-materials" id="materials">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">Материалы <em>под задачу</em></h2>
                <p class="section-note">Подбираем материал по тому, где будет стоять деталь, какую нагрузку и температуру выдержит.</p>
            </div>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th scope="col">Материал</th><th scope="col">Свойства</th><th scope="col">Для чего</th></tr></thead>
                    <tbody>
${materialsRows(ruMaterials)}
                    </tbody>
                </table>
            </div>
            <a class="link-arrow" href="/materialy/">Подробно о каждом материале <span aria-hidden="true">→</span></a>
        </div>
    </section>

    <section class="section section-facts" id="advantages">
        <div class="wrap">
            <h2 class="h2">Почему приходят <em>к нам</em></h2>
            <ul class="facts">
${factsList(ruFacts)}
            </ul>
        </div>
    </section>

${layout.renderFaq('ru', ruFaq)}

    <section class="section section-contact" id="contact">
        <div class="wrap contact-grid">
            <div>
                <h2 class="h2">Как нас <em>найти</em></h2>
                <dl class="contact-list">
                    <div><dt>Производство</dt><dd>Ташкентская обл., г. Чирчик, ул. Амира Тимура, 62а<br>Ориентир: 10-я автобаза</dd></div>
                    <div><dt>Телефон</dt><dd><a href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a></dd></div>
                    <div><dt>Telegram</dt><dd><a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a></dd></div>
                    <div><dt>Instagram</dt><dd><a href="${CONTACTS.instagram}" target="_blank" rel="noopener">${CONTACTS.instagramHandle}</a></dd></div>
                    <div><dt>Доставка</dt><dd>Курьер по Ташкенту и Ташкентской области. В регионы — BTS или Яндекс Доставка (платно)</dd></div>
                </dl>
                ${layout.renderCtaButtons('ru')}
            </div>
            <div class="map">
                ${MAP.replace('%TITLE%', 'Карта: 3DPie, Чирчик, ул. Амира Тимура, 62а')}
            </div>
        </div>
    </section>`;
}

// ---------------------------------------------------------------- UZ

const uzFaq = [
  {
    q: 'Toshkentda 3D chop etish qancha turadi?',
    a: "3DPie'da minimal buyurtma — 100 000 so'm. Yakuniy narx detal o'lchami, plastik turi, model murakkabligi va shoshilinchlikka bog'liq. Rasm yoki faylni Telegramga yuboring — konsultatsiya bepul, narxni ish boshlanishidan oldin aytamiz. Batafsil — <a href=\"/uz/narxlar/\">3D chop etish narxlari</a>."
  },
  {
    q: 'Chizma va 3D modelsiz detal yasash mumkinmi?',
    a: "Ha. Detalning chizg'ich yonidagi rasmi, siniq bo'lagi yoki eski detal yetarli. Murakkab shakllarni 3D skaner bilan olamiz. Model yaratamiz, original sinishiga sabab bo'lgan zaif joyni mustahkamlaymiz va nusxasini chop etamiz. Batafsil — <a href=\"/uz/3d-modellashtirish/\">3D modellashtirish</a> va <a href=\"/uz/3d-skanerlash/\">3D skanerlash</a>."
  },
  {
    q: 'Tayyorlash qancha vaqt oladi?',
    a: "Oddiy detal 1–2 kunda tayyor, skanerlash va modellashtirish bilan murakkab loyiha — 3–7 kun. Seriyalarni parallel chop etamiz: masalan, 200 ta kabel mahkamlagichi partiyasini 2 kunda tayyorladik."
  },
  {
    q: 'Qayerda joylashgansiz va buyurtmani qanday olaman?',
    a: "Ishlab chiqarish Chirchiqda (Toshkent viloyati), Amir Temur ko'chasi, 62a, mo'ljal — 10-avtobaza. Buyurtmani o'zingiz olib ketishingiz yoki Toshkent va Toshkent viloyati bo'ylab kuryer orqali olishingiz mumkin, boshqa viloyatlarga BTS yoki Yandex orqali jo'natamiz (yetkazib berish pullik)."
  },
  {
    q: 'Qaysi materiallardan chop etasiz?',
    a: "PLA, PETG, PETG-CF (uglerod tolali), ABS, Nylon va egiluvchan TPU — undan silikondan uzoqroq xizmat qiladigan rezina detallar chiqadi. Materialni vazifaga qarab tanlaymiz. Taqqoslash — <a href=\"/uz/materiallar/\">qaysi plastikni tanlash kerak</a> maqolasida."
  },
  {
    q: 'Kompaniyalar bilan ishlaysizmi?',
    a: "Ha, jismoniy shaxslar va biznes uchun plastik va rezina detallar tayyorlaymiz: shartnoma, hujjatlar, seriyali partiyalar. Seriyalar va doimiy mijozlar uchun chegirmalar bor."
  },
  {
    q: 'Qanday kafolat berasiz?',
    a: "Har bir detalni topshirishdan oldin tekshiramiz. Nuqson aniqlansa — bepul qayta tayyorlaymiz."
  }
];

const uzServices = [
  { href: '/uz/3d-modellashtirish/', t: "Rasm va namuna bo'yicha 3D modellashtirish", d: "Siniq bo'lak, chizg'ichli rasm yoki eskiz bo'yicha model. STL va STEP beramiz yoki darhol chop etamiz." },
  { href: '/uz/3d-skanerlash/', t: '3D skanerlash va teskari muhandislik', d: "Murakkab shaklni skaner bilan olamiz, singan detallarni tiklaymiz va mustahkamlaymiz." },
  { href: '/uz/avtoehtiyot-qismlar/', t: 'Avtoehtiyot qismlar va salon detallari', d: "Klipsalar, tiqinlar, deflektorlar, panjaralar, tvitter nakladkalari, ramkalar, dekorativ elementlar." },
  { href: '/uz/tishli-gildiraklar/', t: "Texnika uchun tishli g'ildiraklar va detallar", d: "Go'sht qiymalagich va blender shesternyalari, vtulkalar, roliklar, dastaklar." },
  { href: '/uz/materiallar/', t: 'TPU dan rezina detallar', d: "Egiluvchan, yeyilishga chidamli zichlagichlar, vtulkalar va nakladkalar — silikondan uzoqroq xizmat qiladi." },
  { href: '/uz.html#work-cable-clips-batch', t: 'Seriyali partiyalar', d: "Bir xil detallar o'nlab va yuzlab: 200 ta kabel mahkamlagichi — 2 kunda." },
  { href: '/uz.html#gallery', t: 'Korpuslar va buyurtma asosida buyumlar', d: "Elektronika korpuslari, PETG-CF qutilar, akvarium bezaklari — sizning g'oyangiz bo'yicha." }
];

const uzMaterials = [
  ['PLA', 'Qattiq va aniq, lekin taxminan 55&nbsp;°C dan yumshaydi', 'Maketlar, dekor, xona korpuslari'],
  ['PETG', "Mustahkam, namlikdan qo'rqmaydi, ~70&nbsp;°C ga chidaydi", "Mahkamlagichlar, texnik detallar, ko'cha"],
  ['PETG-CF', 'Uglerod tolali PETG: juda qattiq, mat yuza', 'Qattiq korpuslar va qutilar'],
  ['ABS', 'Issiqqa chidamli (~90&nbsp;°C gacha), yaxshi silliqlanadi', 'Avtomobil salon detallari, asbob korpuslari'],
  ['TPU', 'Rezinadek egiluvchan, yeyilishga chidamli', 'Zichlagichlar, vtulkalar, dempferlar, nakladkalar'],
  ['Nylon', 'Juda mustahkam, ishqalanishi past', "Tishli g'ildiraklar, vtulkalar, yuklamali uzellar"]
];

const uzFacts = [
  ['Chizmasiz', "Chizg'ichli rasm, siniq bo'lak yoki eski detal yetarli. Murakkab shaklni 3D skaner bilan olamiz."],
  ['Konsultatsiya bepul', "Istalgan g'oya haqida so'rang. Narxni ish boshlanishidan oldin, yashirin to'lovlarsiz aytamiz."],
  ["O'z ishlab chiqarishimiz", 'Chirchiqda vositachilarsiz chop etamiz. Plastik va rezina detallar.'],
  ['Kafolat', 'Har bir detalni topshirishdan oldin tekshiramiz. Nuqsonli detalni bepul qayta tayyorlaymiz.'],
  ['Seriyalar tez', '200 ta bir xil detal partiyasini 2 kunda tayyorladik. Seriyalarga chegirma.'],
  ["Butun mamlakat bo'ylab", "Toshkent va viloyat bo'ylab kuryer, viloyatlarga — BTS yoki Yandex."]
];

function renderUz(ctx) {
  const { layout } = ctx;
  return `    <section class="hero">
        <div class="wrap hero-grid">
            <div class="hero-copy">
                <p class="kicker">Buyurtma asosida 3D chop etish · Toshkent va Chirchiq</p>
                <h1 class="hero-title">Boshqa joyda <em>topilmaydigan</em> detalni chop etib beramiz</h1>
                <p class="lead">Rasm, o'lcham yuboring yoki namunani olib keling — skanerlab, modellashtirib, mustahkam plastik yoki rezinadan nusxasini chop etamiz (3D pechat). Jismoniy shaxslar va biznes uchun.</p>
                ${layout.renderCtaButtons('uz')}
${layout.renderSpec([
    ['Buyurtma', "100 000 so'mdan"],
    ['Oddiy detal', '1–2 kun'],
    ['Konsultatsiya', 'bepul'],
    ['Yetkazib berish', 'Toshkent va viloyat, viloyatlarga — BTS / Yandex']
  ], 'hero-spec')}
            </div>
            ${heroVisual({ a: { alt: '3D printerda buyurtma asosida chop etilgan avtomobil havo panjarasi', cap: 'Avtomobil panjarasi · buyurtma asosida' } }, layout, 'uz')}
        </div>
    </section>

    <section class="section section-services" id="services">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">Biz nima <em>qilamiz</em></h2>
                <p class="section-note">Rasm, namuna, 3D skan yoki chizma bo'yicha detallar. 3D model bo'lmasa — o'zimiz yaratamiz.</p>
            </div>
            <ul class="svc-list">
${servicesList(uzServices)}
            </ul>
        </div>
    </section>

    <section class="section section-works" id="gallery">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">3DPie'da <em>tayyorlangan</em></h2>
                <p class="section-note">Haqiqiy buyurtmalar — videoni ko'rish uchun kartani bosing. Yangi ishlar <a href="${CONTACTS.instagram}" target="_blank" rel="noopener">Instagram ${CONTACTS.instagramHandle}</a> sahifamizda.</p>
            </div>
            <div class="works-grid">
                <!-- GALLERY:START -->
                <!-- GALLERY:END -->
            </div>
        </div>
    </section>

${layout.renderSteps('uz', 'how')}

    <section class="price-band">
        <div class="wrap price-grid">
            <div>
                <p class="kicker">Narxlar</p>
                <p class="price-big">100&nbsp;000 <small>so'mdan</small></p>
                <p>Minimal buyurtma. Detal narxi o'lcham, material, model murakkabligi va shoshilinchlikka bog'liq — ish boshlanishidan oldin aytamiz. Konsultatsiya bepul.</p>
                <a class="btn btn-paper" href="/uz/narxlar/">Narx qanday hisoblanadi <span aria-hidden="true">→</span></a>
            </div>
${layout.renderSpec([
    ['Oddiy detal', '1–2 kun'],
    ['Skan + model + chop etish', '3–7 kun'],
    ['Seriya', '2 kunda 200 detal'],
    ['Seriyalar va doimiy mijozlar', 'chegirmalar']
  ])}
        </div>
    </section>

    <section class="section section-materials" id="materials">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">Vazifaga mos <em>materiallar</em></h2>
                <p class="section-note">Materialni detal qayerda turishi, qanday yuklama va haroratga chidashiga qarab tanlaymiz.</p>
            </div>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th scope="col">Material</th><th scope="col">Xususiyatlari</th><th scope="col">Nima uchun</th></tr></thead>
                    <tbody>
${materialsRows(uzMaterials)}
                    </tbody>
                </table>
            </div>
            <a class="link-arrow" href="/uz/materiallar/">Har bir material haqida batafsil <span aria-hidden="true">→</span></a>
        </div>
    </section>

    <section class="section section-facts" id="advantages">
        <div class="wrap">
            <h2 class="h2">Nega bizga <em>murojaat qilishadi</em></h2>
            <ul class="facts">
${factsList(uzFacts)}
            </ul>
        </div>
    </section>

${layout.renderFaq('uz', uzFaq)}

    <section class="section section-contact" id="contact">
        <div class="wrap contact-grid">
            <div>
                <h2 class="h2">Bizni qanday <em>topish mumkin</em></h2>
                <dl class="contact-list">
                    <div><dt>Ishlab chiqarish</dt><dd>Toshkent viloyati, Chirchiq sh., Amir Temur ko'chasi, 62a<br>Mo'ljal: 10-avtobaza</dd></div>
                    <div><dt>Telefon</dt><dd><a href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a></dd></div>
                    <div><dt>Telegram</dt><dd><a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a></dd></div>
                    <div><dt>Instagram</dt><dd><a href="${CONTACTS.instagram}" target="_blank" rel="noopener">${CONTACTS.instagramHandle}</a></dd></div>
                    <div><dt>Yetkazib berish</dt><dd>Toshkent va Toshkent viloyati bo'ylab kuryer. Viloyatlarga — BTS yoki Yandex (pullik)</dd></div>
                </dl>
                ${layout.renderCtaButtons('uz')}
            </div>
            <div class="map">
                ${MAP.replace('%TITLE%', "Xarita: 3DPie, Chirchiq, Amir Temur ko'chasi, 62a")}
            </div>
        </div>
    </section>`;
}

module.exports = [
  {
    id: 'home',
    lang: 'ru',
    type: 'home',
    path: '/',
    updated: UPDATED,
    nav: 'home',
    title: '3D-печать в Ташкенте и Чирчике — детали на заказ, 3D-сканирование | 3DPie',
    ogTitle: '3DPie — 3D-печать на заказ в Ташкенте и Чирчике',
    description: '3D-печать, 3D-сканирование и моделирование на заказ в Ташкенте и Чирчике: автозапчасти, шестерни, корпуса, резиновые детали по фото или образцу. Заказ от 100 000 сум, простая деталь за 1–2 дня. ☎ +998 90 139 10 94',
    preloadImage: '/images/work-grille.webp',
    hasGallery: true,
    faq: ruFaq,
    sitemapImages: ['/images/og-ru.jpg', '/images/work-grille.webp', '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp'],
    render: renderRu
  },
  {
    id: 'home',
    lang: 'uz',
    type: 'home',
    path: '/uz.html',
    updated: UPDATED,
    nav: 'home',
    title: "3D chop etish Toshkent va Chirchiqda — buyurtma asosida detallar | 3DPie",
    ogTitle: '3DPie — Toshkent va Chirchiqda 3D chop etish',
    description: "Toshkent va Chirchiqda buyurtma asosida 3D chop etish (3D pechat), 3D skanerlash va modellashtirish: avtoehtiyot qismlar, tishli g'ildiraklar, korpuslar, rezina detallar. Buyurtma 100 000 so'mdan, oddiy detal 1–2 kunda. ☎ +998 90 139 10 94",
    preloadImage: '/images/work-grille.webp',
    hasGallery: true,
    faq: uzFaq,
    sitemapImages: ['/images/og-uz.jpg', '/images/work-grille.webp', '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp'],
    render: renderUz
  }
];
