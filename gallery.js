(function(){
  'use strict';

  const state = {
    items: [],      // array of {type:'images'|'video', title, description, medias:[{type:'image'|'video', src}]}
    current: { cardIndex: 0, mediaIndex: 0 }
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupCards();
    injectModal();
  });

  function setupCards(){
    const cards = document.querySelectorAll('.work-card');
    state.items = [];

    cards.forEach((card, idx) => {
      // Build item model
      const type = card.dataset.type; // images | video
      const title = card.querySelector('.work-meta h3')?.textContent?.trim() || '';
      const description = card.querySelector('.work-meta p')?.textContent?.trim() || '';
        const medias = Array.from(card.querySelectorAll('.work-media')).map(a => ({
          type: a.dataset.type || 'image',
          src: a.getAttribute('href'),
          caption: a.dataset.caption || ''
        }));

      state.items.push({ type, title, description, medias, el: card });

      // Hover autoplay for videos (thumbnail)
      if(type === 'video'){
        const vid = card.querySelector('video.work-video');
        if(vid){
          // On hover
          card.addEventListener('mouseenter', () => { try{ vid.play(); }catch(e){} });
          card.addEventListener('mouseleave', () => { try{ vid.pause(); vid.currentTime = 0; }catch(e){} });
          // On visibility (pause when out of view)
          if('IntersectionObserver' in window){
            const io = new IntersectionObserver((entries)=>{
              entries.forEach(entry=>{ if(!entry.isIntersecting){ try{ vid.pause(); }catch(e){} } });
            });
            io.observe(card);
          }
        }
      }

      // Click opens modal
      card.addEventListener('click', (e)=>{
        e.preventDefault();
        openModal(idx, 0);
      });
    });
  }

  // Modal creation and behavior
  function injectModal(){
    const modal = document.createElement('div');
    modal.className = 'work-modal';
    modal.innerHTML = `
      <div class="work-modal__content" role="dialog" aria-modal="true" aria-label="Просмотр работы">
        <button class="work-modal__close" aria-label="Закрыть">✕</button>
        <button class="work-modal__nav work-modal__prev" aria-label="Предыдущий">❮</button>
        <button class="work-modal__nav work-modal__next" aria-label="Следующий">❯</button>
        <div class="work-modal__media"></div>
        <div class="work-modal__caption">
          <div class="work-modal__title"></div>
          <div class="work-modal__counter"></div>
          <div class="work-modal__desc" hidden></div>
        </div>
        <div class="work-thumbs" hidden></div>
      </div>`;

    document.body.appendChild(modal);

    // Close handlers
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
    modal.querySelector('.work-modal__close').addEventListener('click', closeModal);

    // Keyboard
    document.addEventListener('keydown', (e)=>{
      if(!modal.classList.contains('active')) return;
      if(e.key === 'Escape') closeModal();
      if(e.key === 'ArrowLeft') prev();
      if(e.key === 'ArrowRight') next();
    });

    // Nav
    modal.querySelector('.work-modal__prev').addEventListener('click', prev);
    modal.querySelector('.work-modal__next').addEventListener('click', next);
  }

  function openModal(cardIndex, mediaIndex){
    const modal = document.querySelector('.work-modal');
    const content = modal.querySelector('.work-modal__media');
    const titleEl = modal.querySelector('.work-modal__title');
  const counterEl = modal.querySelector('.work-modal__counter');
  const descEl = modal.querySelector('.work-modal__desc');
    const thumbsEl = modal.querySelector('.work-thumbs');

    state.current.cardIndex = cardIndex;
    state.current.mediaIndex = mediaIndex || 0;

    const item = state.items[cardIndex];

    // Render media
    renderMedia(content, item, state.current.mediaIndex);

    // Caption
    titleEl.textContent = item.title || 'Работа';
    const total = item.medias.length || 1;
    counterEl.textContent = total > 1 ? `${state.current.mediaIndex+1} / ${total}` : '';
    const mediaObj = item.medias[state.current.mediaIndex];
    if(mediaObj && mediaObj.caption){
      descEl.textContent = mediaObj.caption;
      descEl.hidden = false;
    } else {
      descEl.hidden = true;
      descEl.textContent = '';
    }

    // Thumbs for multiple images
    if(item.type === 'images' && item.medias.length > 1){
      thumbsEl.hidden = false;
      thumbsEl.innerHTML = '';
      item.medias.forEach((m, i)=>{
        const b = document.createElement('button');
        b.innerHTML = `<img src="${m.src}" alt="thumbnail ${i+1}">`;
        if(i === state.current.mediaIndex) b.classList.add('active');
        b.addEventListener('click', ()=>{ state.current.mediaIndex = i; openModal(cardIndex, i); });
        thumbsEl.appendChild(b);
      });
    } else {
      thumbsEl.hidden = true;
      thumbsEl.innerHTML = '';
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    updateNavVisibility();
  }

  function renderMedia(container, item, mediaIndex){
    container.innerHTML = '';
    const m = item.medias[mediaIndex] || item.medias[0] || { type: item.type, src: '' };

    if(m.type === 'video' || item.type === 'video'){
      const video = document.createElement('video');
      video.src = m.src || item.medias[0]?.src || '';
      video.controls = true;
      video.autoplay = true; // autoplay in modal
      video.muted = false; // allow audio in modal
      video.playsInline = true;
      video.style.background = '#000';
      container.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = m.src;
      img.alt = item.title || 'Изображение';
      container.appendChild(img);
    }
  }

  function closeModal(){
    const modal = document.querySelector('.work-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // stop any playing video
    const v = modal.querySelector('video');
    if(v){ try{ v.pause(); }catch(e){} }
  }

  function prev(){
    const item = state.items[state.current.cardIndex];
    if(item.type === 'images' && item.medias.length > 1){
      state.current.mediaIndex = Math.max(0, state.current.mediaIndex - 1);
      reopen();
    }
  }
  function next(){
    const item = state.items[state.current.cardIndex];
    if(item.type === 'images' && item.medias.length > 1){
      state.current.mediaIndex = Math.min(item.medias.length - 1, state.current.mediaIndex + 1);
      reopen();
    }
  }

  function reopen(){
    // rerender current modal view without closing overlay
    const modal = document.querySelector('.work-modal');
    if(!modal.classList.contains('active')) return;

    const content = modal.querySelector('.work-modal__media');
    const titleEl = modal.querySelector('.work-modal__title');
  const counterEl = modal.querySelector('.work-modal__counter');
  const descEl = modal.querySelector('.work-modal__desc');
    const thumbsEl = modal.querySelector('.work-thumbs');

    const item = state.items[state.current.cardIndex];
    renderMedia(content, item, state.current.mediaIndex);

    titleEl.textContent = item.title || 'Работа';
    const total = item.medias.length || 1;
    counterEl.textContent = total > 1 ? `${state.current.mediaIndex+1} / ${total}` : '';
    const mediaObj = item.medias[state.current.mediaIndex];
    if(mediaObj && mediaObj.caption){
      descEl.textContent = mediaObj.caption;
      descEl.hidden = false;
    } else {
      descEl.hidden = true;
      descEl.textContent = '';
    }

    // update thumbs active state
    if(!thumbsEl.hidden){
      Array.from(thumbsEl.children).forEach((el, i)=>{
        el.classList.toggle('active', i === state.current.mediaIndex);
      });
    }

    updateNavVisibility();
  }

  function updateNavVisibility(){
    const modal = document.querySelector('.work-modal');
    const prevBtn = modal.querySelector('.work-modal__prev');
    const nextBtn = modal.querySelector('.work-modal__next');
    const item = state.items[state.current.cardIndex];
    const hasMultiple = item.type === 'images' && item.medias.length > 1;

    prevBtn.style.display = hasMultiple && state.current.mediaIndex > 0 ? 'grid' : 'none';
    nextBtn.style.display = hasMultiple && state.current.mediaIndex < item.medias.length - 1 ? 'grid' : 'none';
  }
})();
