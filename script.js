// --- Interactieve Personal Development Portfolio ---

const opdrachtenVoorbeeld = [
  {
    titel: 'PD1 Motivatie en Drijfveren',
    beschrijving: 'Wat motiveert jou in je studie? Wat zijn jouw belangrijkste drijfveren? Reflecteer hierop.'
  },
  {
    titel: 'PD1 Feedback en reflectie',
    beschrijving: 'Reflecteer op de feedback die je hebt ontvangen van medestudenten en docenten. Wat heb je geleerd?'
  }
];

const opdrachtenContainer = document.getElementById('opdrachten-container');
const nieuweOpdrachtBtn = document.getElementById('nieuwe-opdracht-btn');
const nieuweOpdrachtForm = document.getElementById('nieuwe-opdracht-form');
const annuleerBtn = document.getElementById('annuleer-btn');

function renderOpdrachten() {
  opdrachtenContainer.innerHTML = '';
  let opgeslagenOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
  const verwijderdeVoorbeelden = JSON.parse(localStorage.getItem('verwijderdeVoorbeelden')) || [];
  
  // Filter de voorbeeldopdrachten op basis van verwijderde items
  const zichtbareVoorbeelden = opdrachtenVoorbeeld.filter((_, index) => 
    !verwijderdeVoorbeelden.includes(index)
  );
  
  window.alleOpdrachten = [...zichtbareVoorbeelden, ...opgeslagenOpdrachten];

  alleOpdrachten.forEach((opdracht, idx) => {
    const card = document.createElement('div');
    card.className = 'opdracht-card';
    card.setAttribute('data-index', idx);
    // markeer of dit een voorbeeld of een opgeslagen opdracht is, en bewaar originele index
    if (idx < zichtbareVoorbeelden.length) {
      // find original index in the full voorbeelden list (not position in the filtered visible list)
      const origIndex = opdrachtenVoorbeeld.findIndex(v => v.titel === opdracht.titel && v.beschrijving === opdracht.beschrijving);
      card.dataset.type = 'voorbeeld';
      card.dataset.origIndex = origIndex;
    } else {
      card.dataset.type = 'opgeslagen';
      card.dataset.savedIndex = idx - zichtbareVoorbeelden.length;
    }

    card.innerHTML = `
      <div class="titel">${opdracht.titel}</div>
      <div class="beschrijving">${opdracht.beschrijving}</div>
      ${opdracht.reflectie ? '<div class="reflectie-indicator">✓ Reflectie toegevoegd</div>' : ''}      <div class="opdracht-buttons">
        <button class='edit-btn' title='Bewerk deze opdracht'>✎</button>
      </div>
    `;
    addEventListeners(card, idx);
    opdrachtenContainer.appendChild(card);
  });
}

function addEventListeners(card, idx) {
  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    bewerkOpdracht(idx);
  });
    card.addEventListener('click', (e) => {
    const isEditButton = e.target.classList.contains('edit-btn');
    const isEditForm = e.target.closest('.edit-form');
    if (!isEditButton && !isEditForm) {
      openReflectieModal(alleOpdrachten[idx], idx);
    }
  });
}

function verwijderOpdracht(idx) {
  const opgeslagenOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
  const verwijderdeVoorbeelden = JSON.parse(localStorage.getItem('verwijderdeVoorbeelden')) || [];

  const card = document.querySelector(`[data-index="${idx}"]`);
  if (!card) return;

  const type = card.dataset.type;

  if (type === 'voorbeeld') {
    const origIndex = parseInt(card.dataset.origIndex, 10);
    if (!verwijderdeVoorbeelden.includes(origIndex)) {
      verwijderdeVoorbeelden.push(origIndex);
      localStorage.setItem('verwijderdeVoorbeelden', JSON.stringify(verwijderdeVoorbeelden));
    }

    // Verwijder ook eventuele opgeslagen versie van deze voorbeeldopdracht
    const opdracht = opdrachtenVoorbeeld[origIndex];
    const index = opgeslagenOpdrachten.findIndex(o => 
      o.titel === opdracht.titel && o.beschrijving === opdracht.beschrijving
    );
    if (index !== -1) {
      opgeslagenOpdrachten.splice(index, 1);
      localStorage.setItem('opdrachten', JSON.stringify(opgeslagenOpdrachten));
    }
  } else {
    // Voor opgeslagen opdrachten: verwijder op basis van savedIndex
    const savedIndex = parseInt(card.dataset.savedIndex, 10);
    if (!isNaN(savedIndex) && opgeslagenOpdrachten[savedIndex]) {
      opgeslagenOpdrachten.splice(savedIndex, 1);
      localStorage.setItem('opdrachten', JSON.stringify(opgeslagenOpdrachten));
    }
  }

  renderOpdrachten();
}

function openReflectieModal(opdracht, idx) {
  window.location.href = `opdracht.html?id=${idx}`;
}

function bewerkOpdracht(idx) {
  const opgeslagenOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
  const verwijderdeVoorbeelden = JSON.parse(localStorage.getItem('verwijderdeVoorbeelden')) || [];
  const zichtbareVoorbeelden = opdrachtenVoorbeeld.filter((_, index) => !verwijderdeVoorbeelden.includes(index));
  const alleOpdrachten = [...zichtbareVoorbeelden, ...opgeslagenOpdrachten];
  const opdracht = alleOpdrachten[idx];
  
  const form = document.createElement('div');
  form.className = 'edit-form';  form.innerHTML = `
    <input type="text" class="edit-titel" value="${opdracht.titel}" placeholder="Titel">
    <textarea class="edit-beschrijving" placeholder="Beschrijving">${opdracht.beschrijving}</textarea>    <div class="edit-buttons">
      <button class="opslaan-btn">Opslaan</button>
      <button class="annuleer-edit-btn">Annuleren</button>
      <button class="verwijder-in-edit-btn danger" title="Verwijder deze opdracht">Verwijderen</button>
    </div>
  `;
  
  const card = document.querySelector(`[data-index="${idx}"]`);
  const originalContent = card.innerHTML;
  card.innerHTML = '';
  card.appendChild(form);
  
  const opslaanBtn = form.querySelector('.opslaan-btn');
  const annuleerBtn = form.querySelector('.annuleer-edit-btn');
  const verwijderBtn = form.querySelector('.verwijder-in-edit-btn');
  
  opslaanBtn.addEventListener('click', () => {
    const nieuweTitel = form.querySelector('.edit-titel').value.trim();
    const nieuweBeschrijving = form.querySelector('.edit-beschrijving').value.trim();
    
    if (!nieuweTitel || !nieuweBeschrijving) {
      alert('Vul beide velden in');
      return;
    }
    
    const card = document.querySelector(`[data-index="${idx}"]`);
    const type = card ? card.dataset.type : (idx < opdrachtenVoorbeeld.length ? 'voorbeeld' : 'opgeslagen');

    if (type === 'voorbeeld') {
      const origIndex = parseInt(card.dataset.origIndex, 10);
      // Maak of update een opgeslagen kopie in localStorage
      const updatedOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
      const origineleOpdracht = opdrachtenVoorbeeld[origIndex];
      const bestaandeIndex = updatedOpdrachten.findIndex(o => o.titel === origineleOpdracht.titel && o.beschrijving === origineleOpdracht.beschrijving);

      const kopie = {
        titel: nieuweTitel,
        beschrijving: nieuweBeschrijving,
        reflectie: opdracht.reflectie || ''
      };

      if (bestaandeIndex === -1) {
        updatedOpdrachten.push(kopie);
      } else {
        updatedOpdrachten[bestaandeIndex] = Object.assign({}, updatedOpdrachten[bestaandeIndex], kopie);
      }

      localStorage.setItem('opdrachten', JSON.stringify(updatedOpdrachten));
    } else {
      // Update opgeslagen opdracht
      const savedIndex = parseInt(card.dataset.savedIndex, 10);
      const opgeslagen = JSON.parse(localStorage.getItem('opdrachten')) || [];
      if (!isNaN(savedIndex) && opgeslagen[savedIndex]) {
        opgeslagen[savedIndex].titel = nieuweTitel;
        opgeslagen[savedIndex].beschrijving = nieuweBeschrijving;
        localStorage.setItem('opdrachten', JSON.stringify(opgeslagen));
      }
    }
    
    renderOpdrachten();
  });
  
  annuleerBtn.addEventListener('click', () => {
    card.innerHTML = originalContent;
    addEventListeners(card, idx);
  });
  
  verwijderBtn.addEventListener('click', () => {
    if (confirm('Weet je zeker dat je deze opdracht wilt verwijderen?')) {
      verwijderOpdracht(idx);
    }
  });
}

nieuweOpdrachtBtn.addEventListener('click', () => {
  nieuweOpdrachtForm.classList.remove('verborgen');
  nieuweOpdrachtBtn.style.display = 'none';
});

annuleerBtn.addEventListener('click', () => {
  nieuweOpdrachtForm.classList.add('verborgen');
  nieuweOpdrachtBtn.style.display = '';
  nieuweOpdrachtForm.reset();
});

nieuweOpdrachtForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const titel = document.getElementById('titel').value.trim();
  const beschrijving = document.getElementById('beschrijving').value.trim();
  if (!titel || !beschrijving) return;
  const opdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
  opdrachten.push({ titel, beschrijving });
  localStorage.setItem('opdrachten', JSON.stringify(opdrachten));
  renderOpdrachten();
  nieuweOpdrachtForm.classList.add('verborgen');
  nieuweOpdrachtBtn.style.display = '';
  nieuweOpdrachtForm.reset();
});

window.addEventListener('DOMContentLoaded', renderOpdrachten);
