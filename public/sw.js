self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Costa Burger';
  const options = { body: data.body || 'Você tem uma atualização.', data };
  event.waitUntil(self.registration.showNotification(title, options));
});
