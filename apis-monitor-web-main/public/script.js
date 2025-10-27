//Elementos del DOM
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('api-container');

  async function fetchApis() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();

      container.innerHTML = ''; //limpiar lo anterior

      data.forEach(api => {
        const card = document.createElement('div');
        card.classList.add('card');

        const title = document.createElement('h2');
        title.textContent = api.name; //usamos name del server

        const status = document.createElement('p');
        status.classList.add('status');

        if (api.status === 'up') {     
          status.classList.add('status-success');
          status.textContent = 'UP';
        } else {
          status.classList.add('status-error');
          status.textContent = 'DOWN';
        }

        card.appendChild(title);
        card.appendChild(status);
        container.appendChild(card);
      });

    } catch (err) {
      console.error('Error al obtener APIs:', err);
    }
  }

  fetchApis();
  setInterval(fetchApis, 30000); // refrescar cada 30 seg
});
