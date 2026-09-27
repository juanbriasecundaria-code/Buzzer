/* Palabras remains a physical game: only names/round are synchronized. */
(function(){
  const query=new URLSearchParams(location.search);
  let match=null, connected=false, started=false, enabled=false;
  const disabledByGate=new Map();
  const banner=roundHostBanner(null,'#now-playing');
  const gate=document.createElement('div');gate.id='round-entry';gate.style.cssText='padding:16px;text-align:center';banner.after(gate);
  function render(){
    roundHostBanner(match,'#now-playing');gate.replaceChildren();
    const valid=match&&match.active;
    const who=valid&&(match.players||[]).find(p=>p.name===query.get('player'));
    const visitor=query.has('match');
    const stale=visitor&&(!valid||query.get('match')!==match.id||!who);
    if(stale){
      gate.textContent='El cruce cambió. Volvé a elegir tu nombre. ';
      const a=document.createElement('a');a.href='index.html?game=palabras';a.textContent='Elegir participante';a.style.color='inherit';gate.append(a);
    }else if(who){gate.textContent='Estás jugando como '+who.name;}
    else if(valid){gate.textContent='Partida individual · '+match.players.map(p=>p.name).join(' vs. ');}
    if(!connected)gate.append(document.createTextNode(' · Sin conexión: esperando sincronización.'));
    // Old links cannot keep operating the next duel.
    enabled=!!(valid&&!stale&&connected);
    document.querySelectorAll('#main-screen button').forEach(b=>{
      if(!enabled){if(!disabledByGate.has(b))disabledByGate.set(b,b.disabled);b.disabled=true;}
      else if(disabledByGate.has(b)){b.disabled=disabledByGate.get(b);disabledByGate.delete(b);}
    });
  }
  function start(){
    if(started||!window._palabrasDb)return;started=true;
    _palabrasDb.ref('.info/connected').on('value',snap=>{connected=!!snap.val();render();});
    _palabrasDb.ref(BuzzerRounds.paths.palabras).on('value',snap=>{
      match=(snap.val()||{}).fixture||null;
      if(match&&match.active){
        let last;try{last=localStorage.getItem('palabras_fixture_match');}catch(e){}
        if(last!==match.id){
          document.querySelectorAll('.cover-overlay,.sheet-overlay,.var-overlay,.names-overlay').forEach(e=>e.classList.remove('open'));
          score={a:0,b:0};varUses={a:3,b:3};comodinUsed={a:false,b:false,shared:false};selectedCat=null;
          saveScore();saveState();
          try{localStorage.setItem('palabras_fixture_match',match.id);}catch(e){}
        }
        teamNames={a:match.names.a,b:match.names.b};saveTeamNames();syncScoreUI();syncUI();
      }
      render();
    },()=>{connected=false;match=null;render();gate.textContent='No se pudo leer la ronda. Revisá la conexión y los permisos de Firebase.';});
  }
  const oldSave=saveNames;
  saveNames=function(){if(match&&match.active){closeNameEditor();return;}return oldSave();};
  ['addPoint','revealCategory','requestVAR','varVerdict','applyComodinTeam','rerollShared'].forEach(name=>{
    const original=window[name];if(typeof original==='function')window[name]=function(...args){if(enabled)return original.apply(this,args);};
  });
  render();window.addEventListener('palabras-db-ready',start);start();
})();
