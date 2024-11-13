let teraSettings = {};

// Load settings
chrome.storage.sync.get('teraSettings', (data) => {
    teraSettings = data.teraSettings || {};
    console.log('Loaded settings:', teraSettings);
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.teraSettings) {
        teraSettings = changes.teraSettings.newValue || {};
        console.log('Updated settings:', teraSettings);
    }
});

// Get active Pokemon name
function getActivePokemonName() {
    const active = document.querySelector('.battle-pokemon.active');
    if (!active) return null;

    const nameElement = active.querySelector('.pokemonicon');
    if (!nameElement || !nameElement.alt) return null;

    const name = nameElement.alt.split('-')[0].trim();
    console.log('Active Pokemon:', name);
    return name;
}

// Block unauthorized Tera attempts
document.addEventListener('click', (e) => {
    if (e.target.classList?.contains('cmd-terastallize') ||
        e.target.getAttribute?.('name') === 'terastallize' ||
        e.target.closest?.('.choice[data-move="terastallize"]')) {
        
        const pokemonName = getActivePokemonName();
        if (!pokemonName || !teraSettings[pokemonName]) {
            console.log('Blocking unauthorized Tera attempt for:', pokemonName);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
}, true);

// Block chat commands
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.value.toLowerCase().includes('/tera')) {
            const pokemonName = getActivePokemonName();
            if (!pokemonName || !teraSettings[pokemonName]) {
                e.target.value = '';
            }
        }
    }
}, true);