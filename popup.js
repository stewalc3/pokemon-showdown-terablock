document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('teamContainer');

  async function getCurrentTeam() {
      try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                  const pokemonInputs = document.querySelectorAll('input[name="pokemon"]');
                  const nicknameInputs = document.querySelectorAll('input[name="nickname"]');
                  
                  return Array.from(pokemonInputs).map((el, index) => {
                      const nickname = nicknameInputs[index]?.value || '';
                      return {
                          nickname: nickname,
                          actualName: 'Pokemon'
                      };
                  }).filter(pokemon => pokemon.actualName && pokemon.actualName !== 'Add Pokemon');
              }
          });

          return results[0].result || [];
      } catch (error) {
          throw new Error('Please open the team builder to select Pokémon');
      }
  }

  function createTeamDisplay(team) {
      container.innerHTML = '';
      
      if (team.length === 0) {
          container.innerHTML = '<p>No team found. Please open the team builder.</p>';
          return;
      }

      chrome.storage.sync.get('teraSettings', (data) => {
          const settings = data.teraSettings || {};
          
          team.forEach(pokemon => {
              const div = document.createElement('div');
              div.className = 'pokemon-entry';
              const displayName = pokemon.nickname ? 
                  `${pokemon.nickname} (${pokemon.actualName})` : 
                  pokemon.actualName;
              
              div.innerHTML = `
                  <input type="checkbox" id="${pokemon.actualName}" 
                         name="${pokemon.nickname || pokemon.actualName}" 
                         data-actual="${pokemon.actualName}"
                         ${settings[pokemon.nickname || pokemon.actualName] ? 'checked' : ''}>
                  <label for="${pokemon.actualName}">${displayName}</label>
              `;
              container.appendChild(div);
          });

          const saveButton = document.createElement('button');
          saveButton.textContent = 'Save Settings';
          saveButton.onclick = saveSettings;
          container.appendChild(saveButton);
      });
  }

  async function saveSettings() {
      const settings = {};
      document.querySelectorAll('.pokemon-entry input').forEach(checkbox => {
          if (checkbox.checked) {
              const nickname = checkbox.name;
              const actualName = checkbox.getAttribute('data-actual');
              settings[nickname] = actualName;
          }
      });
      
      await chrome.storage.sync.set({ teraSettings: settings });
      
      const savedMsg = document.createElement('div');
      savedMsg.className = 'saved-message';
      savedMsg.textContent = 'Settings saved!';
      container.appendChild(savedMsg);
      setTimeout(() => savedMsg.remove(), 2000);
  }

  try {
      const team = await getCurrentTeam();
      createTeamDisplay(team);
  } catch (error) {
      container.innerHTML = `<p style="color: red">${error.message}</p>`;
  }
});