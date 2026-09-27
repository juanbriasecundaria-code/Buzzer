/* Digital stations publish live scores. Only the organizer freezes results. */
(function(root){
  'use strict';
  function start(options){
    const db=options.db, game=options.game;
    if(!db || !root.BuzzerRounds)return;
    let fixture=null, results=null, selected=null, connected=false, last='';
    const status=document.createElement('div');
    status.style.cssText='padding:8px;text-align:center;font:12px sans-serif;opacity:.8';
    document.body.appendChild(status);
    function choose(){
      if(!fixture || results===null)return;
      const candidates=[];
      ['f1','f2'].forEach(phase=>{
        const d=fixture[phase];
        if(!d || !Array.isArray(d.fixture))return;
        d.fixture.forEach(entry=>{
          if(BuzzerRounds.gameId((d.games||[])[entry[3]])!==game)return;
          const id=phase+'-'+entry[0]+'-'+entry[1]+'-'+entry[2];
          if(results[id])return;
          try{
            const match=BuzzerRounds.buildMatch(phase,entry,{
              players:d.players,teams:d.teams,fullNames:d.fullNames,games:d.games
            },'auto-'+id);
            candidates.push({match,id});
          }catch(e){}
        });
      });
      candidates.sort((a,b)=>a.match.round-b.match.round || a.match.phase.localeCompare(b.match.phase));
      selected=candidates[0]||null;
      status.textContent=selected ? 'Cruce asignado: '+selected.match.names.a+' vs. '+selected.match.names.b :
        'Sin cruce pendiente. Podés usar los nombres y el marcador manualmente.';
      if(selected && options.legacyPath){
        const ref=db.ref(options.legacyPath);
        // A manual activation by the organizer has priority.
        ref.transaction(cur=>{
          if(cur && cur.fixture && cur.fixture.active && !String(cur.fixture.id).startsWith('auto-'))return;
          if(cur && cur.fixture && cur.fixture.id===selected.match.id)return;
          return BuzzerRounds.initial(selected.match);
        },undefined,false).catch(e=>console.warn('No se pudo asignar el cruce',e));
      }
    }
    db.ref('.info/connected').on('value',s=>{connected=!!s.val();status.dataset.connected=String(connected);});
    db.ref('velada/fixture').on('value',s=>{fixture=s.val();choose();},()=>{status.textContent='Sin fixture: usá el modo manual del juego.';});
    db.ref('velada/resultados').on('value',s=>{results=s.val()||{};choose();},()=>{results={};status.textContent='Sin resultados remotos: cargá el resultado a mano en velada.';});
    setInterval(()=>{
      if(!connected)return;
      const match=options.getMatch() || (selected && selected.match);
      if(!match || !match.active || !match.key || !match.phase)return;
      if(results && results[match.phase+'-'+match.key])return;
      let data;
      try{data=options.getScore();}catch(e){return;}
      if(!data || !Number.isFinite(data.a) || !Number.isFinite(data.b))return;
      const id=match.phase+'-'+match.key;
      const payload={game,matchId:id,matchFixtureId:match.id,marcador:{a:data.a,b:data.b},
        bonusInfo:data.bonusInfo||{},t:Date.now()};
      const signature=JSON.stringify({id,a:data.a,b:data.b,bonusInfo:payload.bonusInfo});
      if(signature===last)return;
      last=signature;
      db.ref('velada/enVivo/'+id).set(payload).catch(()=>{last='';});
    },750);
  }
  root.BuzzerAutoLive={start};
})(window);
