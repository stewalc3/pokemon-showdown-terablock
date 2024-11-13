document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('teamContainer');

  async function getCurrentTeam() {
      try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                  const pokemonInputs = document.querySelectorAll('input[name="pokemon"]');
                  return Array.from(pokemonInputs)
                      .map(el => el.value)
                      .filter(name => name && name !== 'Add Pokemon')
                      .map(name => name.split('-')[0].trim());
              }
          });

          return results[0].result || [];
      } catch (error) {
          console.error('Error getting team:', error);
          throw new Error('Please open the team builder to select Pokémon');
      }
  }

  function createTeamDisplay(team) {
      container.innerHTML = '';
      
      if (team.length === 0) {
          container.innerHTML = '<p>No team found. Please open the team builder.</p>';
          return;
      }

      // Load existing settings
      chrome.storage.sync.get('teraSettings', (data) => {
          const settings = data.teraSettings || {};
          
          team.forEach(pokemon => {
              const div = document.createElement('div');
              div.className = 'pokemon-entry';
              div.innerHTML = `
                  <input type="checkbox" id="${pokemon}" name="${pokemon}" 
                         ${settings[pokemon] ? 'checked' : ''}>
                  <label for="${pokemon}">${pokemon}</label>
              `;
              container.appendChild(div);
          });

          // Add save button
          const saveButton = document.createElement('button');
          saveButton.textContent = 'Save Settings';
          saveButton.onclick = saveSettings;
          container.appendChild(saveButton);
      });
  }

  async function saveSettings() {
      const settings = {};
      document.querySelectorAll('.pokemon-entry input').forEach(checkbox => {
          settings[checkbox.name] = checkbox.checked;
      });
      
      await chrome.storage.sync.set({ teraSettings: settings });
      console.log('Saved settings:', settings);
      
      // Show saved message
      const savedMsg = document.createElement('div');
      savedMsg.className = 'saved-message';
      savedMsg.textContent = 'Settings saved!';
      container.appendChild(savedMsg);
      setTimeout(() => savedMsg.remove(), 2000);
  }

  // Load team when popup opens
  try {
      const team = await getCurrentTeam();
      createTeamDisplay(team);
  } catch (error) {
      container.innerHTML = `<p style="color: red">${error.message}</p>`;
  }
});