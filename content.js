let teraSettings = {};

chrome.storage.sync.get('teraSettings', (data) => {
    teraSettings = data.teraSettings || {};
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.teraSettings) {
        teraSettings = changes.teraSettings.newValue || {};
    }
});

function getActivePokemonName() {
  const active = document.querySelector('.whatdo');
  if (!active) return null;

  const nameElement = active.childNodes[1];
  const nickname = nameElement.textContent?.split('-')[0].trim();

  for (const [savedNickname, actualName] of Object.entries(teraSettings)) {
    if (savedNickname === nickname) {
      return actualName;
    }
  }

  return nickname;
}

document.addEventListener('click', (e) => {
    if (e.target.classList?.contains('cmd-terastallize') ||
        e.target.getAttribute?.('name') === 'terastallize' ||
        e.target.closest?.('.choice[data-move="terastallize"]')) {
        
        const pokemonName = getActivePokemonName();
        const canTera = Object.entries(teraSettings).some(([nickname, actualName]) => 
            nickname === pokemonName || actualName === pokemonName
        );
        
        if (!pokemonName || !canTera) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
}, true);

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.value.toLowerCase().includes('/tera')) {
            const pokemonName = getActivePokemonName();
            const canTera = Object.entries(teraSettings).some(([nickname, actualName]) => 
                nickname === pokemonName || actualName === pokemonName
            );
            
            if (!pokemonName || !canTera) {
                e.target.value = '';
            }
        }
    }
}, true);