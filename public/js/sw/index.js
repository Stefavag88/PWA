self.addEventListener('fetch', function (event) {

  console.log(event.request);
  const { url } = event.request;
  console.log(url.endsWith('.jpg'));
  if (url.endsWith('.jpg')) {
    event.respondWith(evilResponse());
  }

  event.respondWith(

    fetch(event.request)
      .then(response => {

        if (response.status === 404) {
          
          return fetch('imgs/dr-evil.gif');
      
        }
        console.log(response.status);
        return response;
      })
      .catch(err => {
        return new Response(`Failure!! ${err.message}`);
      })
  );
});


function testResponse() {

  const responseText = '<b class="a-winner-is-me">Whos da winna ? ? </b> <span>MEEEE</span>';
  const headers = { 'Content-Type': 'text/html' };

  return new Response(responseText, { headers });
}

function evilResponse() {

  return fetch('imgs/dr-evil.gif');
}