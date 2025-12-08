document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const opdrachtId = parseInt(params.get('id'));
    
    const titelElement = document.getElementById('opdracht-titel');
    const beschrijvingElement = document.getElementById('opdracht-beschrijving');
    const reflectieTekst = document.getElementById('reflectie-tekst');
    const opslaanBtn = document.getElementById('opslaan-btn');
    const opgeslagenReflectie = document.getElementById('opgeslagen-reflectie');
    const reflectieContent = document.getElementById('reflectie-content');
    const bewerkBtn = document.getElementById('bewerk-btn');
    const reflectieContainer = document.getElementById('reflectie-container');

    // Add edit functionality
    const editOpdrachtBtn = document.getElementById('edit-opdracht-btn');
    const opdrachtEditForm = document.getElementById('opdracht-edit-form');
    const editTitel = document.getElementById('edit-titel');
    const editBeschrijving = document.getElementById('edit-beschrijving');
    const opslaanEditBtn = document.getElementById('opslaan-edit-btn');
    const annuleerEditBtn = document.getElementById('annuleer-edit-btn');
    const opdrachtContent = document.getElementById('opdracht-content');    // Haal alle opdrachten op
    const opdrachtenVoorbeeld = [
        
    ];

    const opgeslagenOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
    const verwijderdeVoorbeelden = JSON.parse(localStorage.getItem('verwijderdeVoorbeelden')) || [];
    
    // Filter de voorbeeldopdrachten
    const zichtbareVoorbeelden = opdrachtenVoorbeeld.filter((_, index) => 
        !verwijderdeVoorbeelden.includes(index)
    );
    
    const alleOpdrachten = [...zichtbareVoorbeelden, ...opgeslagenOpdrachten];
    let opdracht = alleOpdrachten[opdrachtId];
    
    // Check of er een opgeslagen versie is van deze opdracht
    if (opdrachtId < zichtbareVoorbeelden.length) {
        const opgeslagenVersie = opgeslagenOpdrachten.find(o => 
            o.titel === opdracht.titel && o.beschrijving === opdracht.beschrijving
        );
        if (opgeslagenVersie) {
            opdracht = opgeslagenVersie;
        } else {
            opdracht = opdrachtenVoorbeeld[opdrachtId];
        }
    }

    if (!opdracht) {
        window.location.href = 'pd-opdrachten.html';
        return;
    }

    // Vul de pagina met opdracht informatie
    titelElement.textContent = opdracht.titel;
    beschrijvingElement.textContent = opdracht.beschrijving;

    // Als er al een reflectie is, laat deze zien
    if (opdracht.reflectie) {
        reflectieContent.textContent = opdracht.reflectie;
        reflectieContainer.classList.add('verborgen');
        opgeslagenReflectie.classList.remove('verborgen');
        reflectieTekst.value = opdracht.reflectie;
    }    // Opslaan van reflectie
    
    // Google Doc link elements
    const googleDocBtn = document.getElementById('google-doc-btn');
    const editDocBtn = document.getElementById('edit-doc-btn');
    const docEditor = document.getElementById('doc-editor');
    const docUrlInput = document.getElementById('doc-url-input');
    const saveDocBtn = document.getElementById('save-doc-btn');
    const cancelDocBtn = document.getElementById('cancel-doc-btn');

    // Vul de Google Doc knop met de opgeslagen link (indien aanwezig)
    function updateGoogleDocButton(url) {
        if (url) {
            googleDocBtn.href = url;
            googleDocBtn.classList.remove('disabled');
            googleDocBtn.textContent = 'Open bijhorende Google Doc';
        } else {
            googleDocBtn.href = '#';
            googleDocBtn.textContent = 'Geen Google Doc ingesteld';
        }
    }

    updateGoogleDocButton(opdracht.docUrl);
    opslaanBtn.addEventListener('click', () => {
        const nieuweReflectie = reflectieTekst.value.trim();
        if (!nieuweReflectie) return;

        const updatedOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
        
        if (opdrachtId < zichtbareVoorbeelden.length) {
            // Voor voorbeeldopdrachten
            const kopie = {
                titel: opdracht.titel,
                beschrijving: opdracht.beschrijving,
                reflectie: nieuweReflectie
            };
            
            const bestaandeIndex = updatedOpdrachten.findIndex(o => 
                o.titel === kopie.titel && o.beschrijving === kopie.beschrijving
            );
            
            if (bestaandeIndex === -1) {
                updatedOpdrachten.push(kopie);
            } else {
                updatedOpdrachten[bestaandeIndex] = kopie;
            }
        } else {
            // Voor toegevoegde opdrachten
            const index = opdrachtId - zichtbareVoorbeelden.length;
            updatedOpdrachten[index].reflectie = nieuweReflectie;
        }        // Sla de bijgewerkte opdrachten op in localStorage
        localStorage.setItem('opdrachten', JSON.stringify(updatedOpdrachten));

        // Update UI
        reflectieContent.textContent = nieuweReflectie;
        reflectieContainer.classList.add('verborgen');
        opgeslagenReflectie.classList.remove('verborgen');
        
        // Update de opdracht in het geheugen
        opdracht.reflectie = nieuweReflectie;
    });

    // Edit Google Doc link
    editDocBtn.addEventListener('click', () => {
        docUrlInput.value = opdracht.docUrl || '';
        docEditor.classList.remove('verborgen');
        reflectieContainer.classList.add('verborgen');
    });

    cancelDocBtn.addEventListener('click', () => {
        docEditor.classList.add('verborgen');
        reflectieContainer.classList.remove('verborgen');
    });

    saveDocBtn.addEventListener('click', () => {
        const newUrl = docUrlInput.value.trim();

        const updatedOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];

        if (opdrachtId < zichtbareVoorbeelden.length) {
            // Voor voorbeeldopdrachten: maak of update een opgeslagen kopie
            const kopie = {
                titel: opdracht.titel,
                beschrijving: opdracht.beschrijving,
                reflectie: opdracht.reflectie,
                docUrl: newUrl
            };

            const bestaandeIndex = updatedOpdrachten.findIndex(o => 
                o.titel === kopie.titel && o.beschrijving === kopie.beschrijving
            );

            if (bestaandeIndex === -1) {
                updatedOpdrachten.push(kopie);
            } else {
                // behoud andere velden als aanwezig
                updatedOpdrachten[bestaandeIndex] = Object.assign({}, updatedOpdrachten[bestaandeIndex], kopie);
            }
        } else {
            // Voor toegevoegde opdrachten
            const index = opdrachtId - zichtbareVoorbeelden.length;
            // Zorg dat updatedOpdrachten heeft de juiste lengte en object
            if (!updatedOpdrachten[index]) updatedOpdrachten[index] = {};
            updatedOpdrachten[index].docUrl = newUrl;
            // Zorg dat titel/beschrijving in opgeslagen versie bestaan
            updatedOpdrachten[index].titel = updatedOpdrachten[index].titel || opdracht.titel;
            updatedOpdrachten[index].beschrijving = updatedOpdrachten[index].beschrijving || opdracht.beschrijving;
            updatedOpdrachten[index].reflectie = updatedOpdrachten[index].reflectie || opdracht.reflectie;
        }

        localStorage.setItem('opdrachten', JSON.stringify(updatedOpdrachten));

        // Werk UI bij
        opdracht.docUrl = newUrl;
        updateGoogleDocButton(newUrl);
        docEditor.classList.add('verborgen');
        reflectieContainer.classList.remove('verborgen');
    });

    // Bewerk reflectie
    bewerkBtn.addEventListener('click', () => {
        reflectieContainer.classList.remove('verborgen');
        opgeslagenReflectie.classList.add('verborgen');
    });

    // Edit button click handler
    editOpdrachtBtn.addEventListener('click', () => {
        editTitel.value = opdracht.titel;
        editBeschrijving.value = opdracht.beschrijving;
        opdrachtEditForm.classList.remove('verborgen');
        opdrachtContent.classList.add('verborgen');
    });

    // Cancel edit button click handler
    annuleerEditBtn.addEventListener('click', () => {
        opdrachtEditForm.classList.add('verborgen');
        opdrachtContent.classList.remove('verborgen');
    });    // Save edit button click handler
    opslaanEditBtn.addEventListener('click', () => {
        const nieuweTitel = editTitel.value.trim();
        const nieuweBeschrijving = editBeschrijving.value.trim();
        
        if (!nieuweTitel || !nieuweBeschrijving) {
            alert('Vul beide velden in');
            return;
        }

        const updatedOpdrachten = JSON.parse(localStorage.getItem('opdrachten')) || [];
        
        if (opdrachtId < zichtbareVoorbeelden.length) {
            // Voor voorbeeldopdrachten
            const kopie = {
                titel: nieuweTitel,
                beschrijving: nieuweBeschrijving,
                reflectie: opdracht.reflectie
            };
            
            const bestaandeIndex = updatedOpdrachten.findIndex(o => 
                o.titel === opdracht.titel && o.beschrijving === opdracht.beschrijving
            );
            
            if (bestaandeIndex === -1) {
                updatedOpdrachten.push(kopie);
            } else {
                updatedOpdrachten[bestaandeIndex] = kopie;
            }
        } else {
            // Voor toegevoegde opdrachten
            const index = opdrachtId - zichtbareVoorbeelden.length;
            updatedOpdrachten[index].titel = nieuweTitel;
            updatedOpdrachten[index].beschrijving = nieuweBeschrijving;
        }        localStorage.setItem('opdrachten', JSON.stringify(updatedOpdrachten));
        
        // Update page content
        titelElement.textContent = nieuweTitel;
        beschrijvingElement.textContent = nieuweBeschrijving;
        opdracht.titel = nieuweTitel;
        opdracht.beschrijving = nieuweBeschrijving;
        
        // Hide edit form
        opdrachtEditForm.classList.add('verborgen');
        opdrachtContent.classList.remove('verborgen');
    });
});
