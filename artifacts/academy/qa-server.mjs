import http from 'node:http';
import net from 'node:net';
const account = {id:999999,name:'Academy QA',email:'academy.qa@example.test',xp:0,streak:0,role:'user'};
const server = http.createServer((req,res) => {
  const fixtureURL = new URL(req.url, 'http://127.0.0.1:5174');
  if (fixtureURL.pathname.startsWith('/qa/at/')) {
    const positions = { question_hall:[1296,604], profile_center:[496,1148], dormitory:[2096,1148], spawn:[1296,1456], plaza:[1296,1200], pond:[592,464], behind_hall:[1296,140] };
    const position = positions[fixtureURL.pathname.split('/').at(-1)];
    if (!position) {res.writeHead(404);res.end('Unknown QA fixture');return;}
    const destination = '/academy' + (fixtureURL.search || '');
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});
    res.end('<!doctype html><title>Local QA saved-position fixture</title><script>const auth=JSON.parse(localStorage.getItem("auth")||"{}").state;if(!auth?.user){location.replace("/academy")}else{sessionStorage.setItem("academy:v1:"+auth.user.id+":"+auth.loginAt,JSON.stringify({worldId:"academy_world",sceneId:"academy_plaza",version:1,player:{x:'+position[0]+',y:'+position[1]+',facing:"up"}}));location.replace('+JSON.stringify(destination)+')}</script>');return;
  }
  if (req.url === '/qa/fail-academy' || req.url === '/qa/fail-canvas' || req.url === '/qa/reset') {
    const mode = req.url === '/qa/fail-academy' ? 'module' : req.url === '/qa/fail-canvas' ? 'canvas' : '';
    res.writeHead(302, {'Set-Cookie':`academyQaFail=${mode}; SameSite=Strict; Path=/`,Location:'/academy'});res.end();return;
  }
  const failure = req.headers.cookie || '';
  if (failure.includes('academyQaFail=module') && req.url.startsWith('/src/features/academy/')) {
    res.writeHead(503, {'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('Intentional local QA module failure');return;
  }
  if (failure.includes('academyQaFail=canvas') && req.url.startsWith('/src/features/academy/renderer.js')) {
    res.writeHead(200, {'Content-Type':'application/javascript','Cache-Control':'no-store'});res.end('export function createRenderer(){throw new Error("Intentional local QA canvas failure")}');return;
  }

  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type','application/json');
    res.setHeader('Cache-Control','no-store');
    if (req.url === '/api/auth/login' && req.method === 'POST') {res.end(JSON.stringify({user:account,token:'academy-qa-local-only'}));return;}
    if (req.url === '/api/settings') {res.end('{}');return;}
    if (req.url === '/api/profile' || req.url === '/api/auth/profile') {res.end(JSON.stringify({user:account,riwayat:[],stats:{total:0,benar:0}}));return;}
    res.statusCode=503;res.end(JSON.stringify({error:'Local Academy QA: backend endpoint not mocked'}));return;
  }
  const upstream = http.request({hostname:'127.0.0.1',port:5173,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:5173'}},r => {res.writeHead(r.statusCode,r.headers);r.pipe(res);});
  upstream.on('error',()=>{res.statusCode=502;res.end('Vite unavailable');});
  req.pipe(upstream);
});
server.on('upgrade',(req,socket,head)=>{
  const upstream=net.connect(5173,'127.0.0.1',()=>{
    const headers=Object.entries(req.headers).map(([key,value])=>`${key}: ${value}`).join('\r\n');
    upstream.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headers}\r\n\r\n`);
    if(head.length)upstream.write(head);
    socket.pipe(upstream);upstream.pipe(socket);
  });
  upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy());
});
server.listen(5174,'127.0.0.1',()=>process.stdout.write('Isolated Academy QA proxy: http://127.0.0.1:5174 (simulated login, no real backend writes)\n'));
