function createPorpoise({state,page,persist,go,setPoint,clock,schedule}){
  const $=id=>document.getElementById(id), node=(tag,cls,txt)=>{
    const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;
  };
  const desk=page==="index"&&!new URLSearchParams(location.search).has("view");
  let lastActions=[];
  let mapAgent=null, readyModel=false, busy=false, visitedContext="",lastCue="";
  const panel=node("dialog","porpoisePanel guideSheet");panel.id="birdPanel";
  panel.setAttribute("aria-labelledby","hostChatTitle");
  panel.innerHTML='<header class="hostChatHead"><img src="assets/receptionist.webp" alt=""><div><small>武汉 SPU 城市接待员</small><h2 id="hostChatTitle">小江豚</h2></div><button type="button" data-close="birdPanel" aria-label="关闭对话">×</button></header><p id="hostContext"></p><div id="conversation" role="log" aria-label="与小江豚的对话" aria-live="polite"></div><div id="quickChat" aria-label="可以接着问"></div><form id="chatForm"><input id="chatInput" aria-label="问接待员" placeholder="和我说说你的想法…" maxlength="180" required autocomplete="off"><button class="primary">发送</button></form><p id="hostStatus" role="status"></p>';
  document.body.append(panel);
  const memoryKey="jiang-an-porpoise-talk-v1";
  let history=[];
  try{const saved=JSON.parse(sessionStorage.getItem(memoryKey));if(Array.isArray(saved))history=saved.filter(v=>v&&["user","assistant"].includes(v.role)&&typeof v.text==="string").slice(-22);}catch{}
  const officialAvatar="assets/receptionist.webp";
  function button(label,fn){const b=node("button","",label);b.type="button";b.onclick=fn;return b;}
  function paintLine(text,role,actions=[]){
    const row=node("div","chatLine "+(role==="user"?"user":"bird"));
    if(role!=="user"){const portrait=new Image();portrait.src=officialAvatar;portrait.alt="";row.append(portrait);}
    const content=node("div","hostBubble");content.append(node("p","",text));
    if(actions.length){const buttons=node("div","hostActions");for(const [label,fn] of actions)buttons.append(button(label,fn));content.append(buttons);}
    row.append(content);$("conversation").append(row);
    $("conversation").scrollTop=$("conversation").scrollHeight;
  }
  function line(text,who="bird",actions=[]){
    if(who!=="user")lastActions=actions;
    paintLine(text,who==="user"?"user":"assistant",actions);
    history.push({role:who==="user"?"user":"assistant",text:text.slice(0,650)});history=history.slice(-22);
    try{sessionStorage.setItem(memoryKey,JSON.stringify(history));}catch{}
  }
  history.forEach(v=>paintLine(v.text,v.role));
  const finalId=()=>state.path[state.path.length-1],name=id=>places[id]?.n||"";
  const routeName=()=>name(state.path[0])+" → "+name(finalId());
  const pageTitles={index:desk?"接待台":"导览地图",trip:"行程",cards:"明信片",postcard:"明信片",place:"游览手记",city:"城市沙盘",collection:"打卡册",venue:"立体导览",reception:"赛事接待"};
  function localPlace(){
    if(page==="index")return mapAgent?.selection()||null;
    if(page==="postcard")return document.querySelector("main").dataset.hostPlace||null;
    if(page==="place"||page==="venue")return document.body.dataset.model||new URLSearchParams(location.search).get("id")||"tower";
    return null;
  }
  function activeFloor(){if(page!=="venue"||localPlace()!=="tower")return "";const floor=document.querySelector('#floorKeys [aria-pressed="true"]')?.textContent;return floor&&floor!=="全楼"?floor:"";}
  function liveName(){return page==="postcard"?$("landmark")?.textContent||name(localPlace()):name(localPlace());}
  function contextText(){
    if(page==="index"&&mapAgent?.step())return mapAgent.step().short;
    if(activeFloor())return "正在看 · 黄鹤楼"+activeFloor();
    if(localPlace())return "正在看 · "+liveName();
    if(page==="reception")return $("introTitle")?.textContent||"赛事接待";
    if(page==="city")return (new URLSearchParams(location.search).get("leaf")==="practice"?"自由试摆":"我的沙盘")+" · "+($("stampCount")?.textContent||"");
    if(page==="collection")return $("recordCount")?.textContent||"我的打卡册";
    if(page==="index"&&desk)return "武汉 · 今日接待";
    return page==="index"||page==="trip"?routeName():pageTitles[page];
  }
  function chips(words){
    $("quickChat").replaceChildren(...words.map(w=>button(w,()=>submit(w))));
  }
  function defaults(){
    if(page==="index"&&mapAgent?.step())return ["下一步怎么走","到终点来得及吗","沿途吃什么"];
    if(activeFloor())return ["这层讲什么","要留多久","把这里加进路线"];
    if(localPlace())return ["这里怎么看","要留多久","把这里加进路线"];
    if(page==="postcard"&&!localPlace())return ["这一页讲什么","认识武汉","帮我安排行程"];
    if(page==="reception")return ["这一页讲什么","观众去哪看","比赛怎么评分"];
    if(page==="trip")return ["帮我看看行程","到终点来得及吗","沿途吃什么"];
    if(page==="city"||page==="collection")return ["我收集了哪些地点","接下来去哪","介绍武汉"];
    return ["认识武汉","帮我安排行程","介绍 SPU 社区","SAIG 怎么比"];
  }
  function welcome(){
    if(page==="index"&&mapAgent?.step())return "我们接着走。"+mapAgent.step().detail;
    if(localPlace())return "你正在看"+liveName()+"。我可以指给你看它最值得留意的地方，也可以一起算算要留多久。";
    if(page==="reception")return "你看到的是「"+contextText()+"」。想问规则、参赛准备，还是从哪里进场？";
    if(page==="city"||page==="collection")return "我们来翻翻你的武汉足迹吧。你想看看已经收集了什么，还是让我陪你挑下一站？";
    if(page==="trip")return "我把你排的几站串起来了。要我帮你核对到达时间，还是留点时间逛逛？";
    return desk?"你好呀，我是小江豚，你在武汉的接待员。想先认识这座城，还是已经有一个想去的地方？":"我陪你看这段路。现在排的是"+routeName()+"，路上你想吃点什么、看看江，还是直接到终点？";
  }
  function open(prompt){
    const first=!panel.open;if(first)panel.showModal();
    const current=contextText();$("hostContext").textContent=current;
    if(first&&state.hostEvent&&!prompt){line("刚才说好从"+name(state.hostEvent.start)+"去"+name(state.hostEvent.target)+"。你想几点前到？");chips(["下午四点","下午五点","先不排"]);}
    else if(first&&state.hostSlot&&!prompt){const slot=state.hostSlot;if(slot.stage==="end"&&places[slot.start])from(slot.start);else planStart();}
    else if(first&&(!history.length||visitedContext!==current)&&!prompt){line(welcome());chips(defaults());}
    else if(!$("quickChat").children.length)chips(defaults());
    visitedContext=current;
    if(prompt)submit(prompt);
    requestAnimationFrame(()=>{$("conversation").scrollTop=$("conversation").scrollHeight;});
  }
  const rememberTopic=t=>{state.hostTopic=t;persist();};
  const ask=(label,q=label)=>[label,()=>submit(q)];
  function planStart(){
    state.hostSlot={stage:"start"};rememberTopic("plan");
    line("先告诉我从哪里出发。可以说一个地标，或者沿用当前起点「"+name(state.path[0])+"」。","bird",[["沿用这个起点",()=>from(state.path[0])]]);
    chips(["华科南大门","黄鹤楼","江汉路"]);
  }
  function from(id){
    state.hostSlot={stage:"end",start:id};persist();
    line("好，从"+name(id)+"出发。最后一站想去哪？看开幕可以选智民里，看现场接单可以选平和打包厂。","bird",[["沿用当前终点",()=>to(finalId())]]);
    chips(["去江汉路","去智民里","去平和打包厂"]);
  }
  function to(id){
    const start=state.hostSlot?.start;if(!places[start])return planStart();
    if(start===id){line("起点和终点是同一处，换个想去的地方吧。");return;}
    delete state.hostSlot;persist();
    planQuestion("从"+name(start)+"到"+name(id));
  }
  function planQuestion(q){
    if(mapAgent)return mapAgent.answer(q);
    state.hostRequest=q;persist();go("index");
  }
  function findPlace(q){
    const clean=t=>t.toLowerCase().replace(/[\s·]/g,""),s=clean(q);
    let best=null,len=0;
    for(const [k,p] of Object.entries(places)){
      for(const alias of [p.n,...p.n.split(" · "),...(p.aliases||"").split(/\s+/)]){
        const n=clean(alias);if(n.length<2||/^(武昌|汉口|汉阳|小吃|商业|图书馆|拍照|美食|大学|购物中心|校园|江景|过早|武汉|水景|江边|地铁|商超|运动|文化)$/.test(n))continue;
        if(n.length>len&&s.includes(n)){best=k;len=n.length;}
      }
    }return best;
  }
  function showRoute(){
    if(!["index","trip"].includes(page)){planQuestion("帮我看看行程");return;}
    const times=schedule(),end=times[times.length-1],idx=state.path.length-1;
    let text="按 "+state.departure+" 出发，"+state.path.map(name).join(" → ")+"。算上中途停留，预计 "+clock(end)+" 到"+name(state.path[idx])+"。";
    if(state.deadlineOn){const [h,m]=state.due.split(":").map(Number),remaining=h*60+m+1440*state.dueDay-end-state.buffer;
      text+="最晚 "+(state.dueDay?"次日 ":"")+state.due+" 到，预留 "+state.buffer+" 分钟后，"+(remaining>=0?"还宽裕约 "+remaining+" 分钟。":"还差约 "+(-remaining)+" 分钟。");
    }else text+="如果要赶比赛，告诉我几点前到，我再替你核对。";
    line(text,"bird",[["看分站时间",()=>go("trip")],ask("找沿途小吃","沿途吃什么")]);chips(["下一步怎么走","沿途吃什么","我想看比赛"]);
  }
  function placeReply(k,kind){
    if(!places[k])return false;
    if(!places[k].art){line(name(k)+"是自选位置。我可以把它作为行程端点，附近的地标可从地图选择。","bird",[["打开地图",()=>go("index")]]);return true;}
    state.chatPlace=k;rememberTopic("place");
    const note=typeof journal!=="undefined"?journal[k]:null;
    const leaf=page==="postcard"&&localPlace()===k?$("leafBody")?.textContent:"";
    const venueNote=page==="venue"&&localPlace()===k?$("venueStory")?.textContent:"";
    const reply=kind==="time"?("按这处资料，可以先留 "+(note?.minutes||25)+" 分钟。"+(note?.tip||"想多拍几张，可以在行程里加时间。")):
      kind==="more"?(note?.walk?.[1]||note?.tip||places[k].s):(leaf||venueNote||places[k].s);
    line(reply,"bird",[ask("加入途经","把"+name(k)+"加入途经"),["看立体模型",()=>go("venue",k)]]);chips(["要留多久","再讲一点","下一步怎么走"]);return true;
  }
  function cityIntro(q){
    rememberTopic("wuhan");
    if(/过早|早餐/.test(q))line("武汉人把吃早饭叫「过早」。一碗热干面，或一份刚出锅的豆皮，就是不少人一天的开场。想从汉口的山海关路逛，还是去武昌的户部巷？","bird",[ask("逛山海关路","介绍山海关路"),ask("逛户部巷","介绍户部巷")]);
    else if(/江|三镇/.test(q))line("长江把武昌与另外两镇隔开，汉江又把汉口和汉阳分开。想在现场看懂这张地图，我会带你到南岸嘴，看两条江在眼前会合。","bird",[ask("看看南岸嘴","介绍南岸嘴"),ask("带我规划路线","帮我安排行程")]);
    else line("欢迎来武汉！要记住这座城，可以先认两条江、三座镇。喜欢烟火气，清早去汉口过早；想看江，把武昌岸边和一程轮渡连起来。你更想听哪一个？","bird",[ask("两江和三镇","两条江怎样分三镇"),ask("武汉人怎样过早","武汉人怎样过早"),["翻城市明信片",()=>go("postcard","wuhan")]]);
    chips(["帮我安排行程","介绍 SPU 社区"]);
  }
  function eventAnswer(q){
    if (/spu.*saig.*关系/i.test(q)){
      rememberTopic("saig");line("SPU 指能独立判断、调用 AI 并对交付负责的超级个体单元。SAIG 由数命 SPU·江岸社区发起，线上先做武汉城市接待员，入围后用真实订单检验这些能力。你想以观众还是参赛者的身份了解？","bird",[ask("我去观赛","观赛去哪"),ask("我想参赛","报名要交什么")]);chips(["比赛怎么评分","什么是 SPU","介绍 SPU 社区"]);return true;
    }
    let answer=receptionAnswer(q);
    if(state.hostTopic==="community"&&/学习者|没经验|零基础|想学习|有需求|创业|企业|想参加社区/.test(q))answer=receptionAnswer("社区"+q);
    if(state.hostTopic==="saig"&&/怎么比|有几天|交什么|怎么参加|去哪看|在哪看/.test(q))answer=receptionAnswer(/交|参加/.test(q)?"报名":/看/.test(q)?"观赛":"赛程");
    if(!answer)return false;
    const [topic,i,reply]=answer;rememberTopic(topic);const actions=[["看"+receptionTopics[topic].tab,()=>go("reception",topic,String(i))]];
    if(topic==="community"){actions.push(ask("我是学习者","学习者怎么加入社区"));chips(["企业怎么进社区","什么是 SPU","SAIG 怎么比"]);}
    if(topic==="spu"){actions.push(ask("用实际订单举例","企业怎么进社区"));chips(["介绍 SPU 社区","SAIG 怎么比"]);}
    if(topic==="saig"){actions.push(["导航到观赛点",()=>{setPoint("packing","end");go("index");}]);chips(["开幕和观赛去哪","比赛怎么评分","报名要交什么"]);}
    line(reply,"bird",actions);return true;
  }
  function onSiteIntent(q){
    return /加入途经|加进路线|把这里加|设为终点|设为起点|从这出发/.test(q);
  }
  function handoff(q){if(q==="帮我看看行程"){showRoute();return;}if(q==="下一步怎么走"){navigation();return;}mapAgent.answer(q);}
  function navigation(){
    if(!mapAgent){planQuestion("下一步怎么走");return;}
    const guide=mapAgent.step(true);
    if(!guide){line("这段路还缺少可用的路网指引，我们先换个端点看看。");return;}
    line(guide.short+"。"+guide.detail,"bird",[["打开本段指引",()=>{panel.close();$("startNav").click();}],...(guide.active?[["我已完成这一步",()=>{mapAgent.advance();if(mapAgent.step())navigation();else line("这趟导览走完了。要我讲讲"+name(finalId())+"吗？","bird",[ask("讲讲终点","介绍"+name(finalId()))]);}]]:[])]);
    chips(["到终点来得及吗","沿途吃什么"]);
  }
  function stampInfo(){
    const ids=Object.keys(state.city?.stamps||{}).filter(k=>places[k]).sort((a,b)=>state.city.stamps[b]-state.city.stamps[a]);
    line(ids.length?"你打卡了 "+ids.length+" 处，最近的是"+ids.slice(0,3).map(name).join("、")+"。想回看其中一站，还是继续找下一站？":"打卡册还是空的。遇到想留下的地标，打开立体导览，点「打卡收藏」，我就能帮你记住。","bird",[["打开打卡册",()=>go("collection")],ask("挑下一站","接下来去哪")]);
  }
  async function freeReply(q){
    if(readyModel){
      busy=true;panel.setAttribute("aria-busy","true");$("hostStatus").textContent="小江豚在想怎么回答…";$("chatForm").querySelector("button").disabled=true;
      try{
        const id=findPlace(q)||localPlace()||state.chatPlace;const topic=receptionTopics[state.hostTopic];
        const ctx=[contextText(),"计划各站："+state.path.map(name).join(" → "),"出发："+state.departure,state.deadlineOn?"最晚到达："+state.due:"",mapAgent?.step()?.detail,
          activeFloor()?$("floorNote").textContent:"",places[id]?.s,topic?.lead,topic?.aside].filter(Boolean).join("\n");
        const resp=await fetch("/host/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q,history:history.slice(0,-1).slice(-6),context:ctx}),signal:AbortSignal.timeout(55000)});
        if(!resp.ok)throw Error();const result=await resp.json();if(!result.text)throw Error();line(result.text);return;
      }catch{line("本机模型暂时没接上。我们还可以按地点资料继续聊，或者先把行程安排好。","bird",[ask("认识武汉"),ask("帮我安排行程")]);return;}
      finally{busy=false;panel.removeAttribute("aria-busy");$("hostStatus").textContent="本机对话 · Qwen2.5 3B";$("chatForm").querySelector("button").disabled=false;}
    }
    if(/心情|紧张|担心|迷路|一个人|累|休息|聊天|聊两句|陪我聊/.test(q)){line("我们可以慢一点，一次只管下一站。你更想先认清怎么走，还是挑一处能坐下看江的地方？","bird",[ask("下一步怎么走"),ask("沿途看江","沿途看水景")]);return;}
    if(/好呀|谢谢|真好|好的|你好|嗨|哈喽|你是谁/.test(q)){line("我在呢。我是陪你逛武汉的小江豚。你现在最想看看这一站，还是先理清接下来的路？","bird",[ask("接下来去哪"),ask("认识武汉")]);return;}
    line("我还没弄明白你最关心哪一件。是想听一个地方的故事、问路，还是聊聊比赛？你也可以直接告诉我地名。","bird",[ask("认识武汉"),ask("帮我安排行程"),ask("SAIG 怎么比")]);
  }
  async function submit(raw){
    const q=String(raw||"").trim().slice(0,180);if(!q||busy)return;
    line(q,"user");const place=findPlace(q),present=localPlace(),recent=places[state.chatPlace]?state.chatPlace:null;
    const next=()=>planQuestion(q);
    const direct=lastActions.find(([label])=>label===q);
    if(direct && !["认识武汉","帮我安排行程","下一步怎么走","接下来去哪","SAIG 怎么比","介绍 SPU 社区"].includes(q) && /^(按这条|确认改|安排这站|去掉这一站|切换出行方式|设置最晚|打开本段|我已完成)/.test(q)){direct[1]();return;}
    if(/^(好[的呀]?|可以|确认|就这样|照这条走|就按这个安排)[。！!]?$/.test(q)){
      const confirm=lastActions.find(([label])=>/^(按这条|确认改路线|安排这站|去掉这一站|切换出行方式|设置最晚)/.test(label));
      if(confirm){confirm[1]();return;}
    }
    if(activeFloor()&&/这一层|这层|这里怎么看/.test(q)){line("我们看到"+activeFloor()+"。"+$("floorNote").textContent,"bird",[[ "看整栋楼",()=>{panel.close();document.querySelector("#floorKeys button")?.click();}]]);chips(["要留多久","把这里加进路线"]);return;}
    if(/心情|紧张|有点累|聊两句|陪我聊|想和你聊天|想跟你聊/.test(q)&&!/几点|怎么走|赶比赛/.test(q)){await freeReply(q);return;}
    if(/取消规划|先不排|重新开始/.test(q)){delete state.hostSlot;delete state.hostEvent;persist();line("好，先放下这段规划。想聊什么？");chips(defaults());return;}
    if(/^(帮我安排行程|帮我排路线|规划旅行|带我逛武汉|带我安排行程)$/.test(q)){planStart();return;}
    const eventTrip=/想去看比赛|要去看比赛|去现场观赛|去看开幕|赶开幕|赶比赛/.test(q);
    const departureOnly=q.match(/(?:[早上中下午晚傍凌晨\s]*[零一二两三四五六七八九十\d]+[点时:：](?:[零一二两三四五六七八九十\d]+分?|半|一刻|三刻)?)(?:钟|左右)?(?:从[^，。；,]{0,16})?(?:出发|动身)/);
    const timeInText=/(?:[零一二两三四五六七八九十\d]+)\s*[点时:：]/.test(q);
    if(state.hostEvent && (/再说|先不去|先不排|取消/.test(q)||!timeInText)){
      delete state.hostEvent;persist();
    }
    if(state.hostEvent&&timeInText){
      const event=state.hostEvent;delete state.hostEvent;persist();
      planQuestion("从"+name(event.start)+"出发，"+(event.departure?event.departure+"，":"")+(!/上午|下午|晚上|早上|傍晚/.test(q)?event.period:"")+q+(event.target==="zhimin"?"要去看开幕":"要去看比赛"));return;
    }
    if(eventTrip&&(!timeInText||(departureOnly&&!/[点时:：]/.test(q.replace(departureOnly[0],""))))){
      delete state.hostSlot;
      const from=q.match(/(?:从|我在)(.+?)(?:出发|去|，|,|。)/),start=(from&&findPlace(from[1]))||state.path[0];
      const target=/开幕/.test(q)?"zhimin":"packing",period=q.replace(departureOnly?.[0]||"","").match(/下午|傍晚|晚上|上午|早上/)?.[0]||"";
      state.hostEvent={start,target,period,departure:departureOnly?departureOnly[0]:""};rememberTopic("saig");
      line("从"+name(start)+"出发，"+(target==="packing"?"现场观赛去平和打包厂":"开幕去智民里")+"。你希望几点前到场？我会把路上停留的时间也算进去。","bird",[["先看看场地",()=>go("venue",target)]]);chips(["下午四点","下午五点","先不排"]);return;
    }
    if(timeInText&&(eventTrip||/平和打包厂|智民里|观赛|看比赛/.test(q))){next();return;}
    if((/加入社区|报名社区/.test(q)||state.hostTopic==="community"&&/我想加入|我怎么加入|零基础|没经验/.test(q))&&!/路线|途经/.test(q)){
      eventAnswer(/企业|创业/.test(q)?q+"社区":"学习者怎么加入社区");return;
    }
    if(state.hostSlot&&place&&!/介绍|怎么|看看|讲|从.+到/.test(q)){
      if(state.hostSlot.stage==="start")from(place);else to(place);return;
    }
    if(state.hostSlot&&/^(这里|就从这|当前位置|从这里出发)$/.test(q)&&present){if(state.hostSlot.stage==="start")from(present);else to(present);return;}
    if(state.hostSlot){delete state.hostSlot;persist();}
    if(onSiteIntent(q)&&(place||present||recent)){
      const id=place||present||recent;
      if(/加入|加进|把这里加/.test(q)){state.chatPlace=id;persist();planQuestion("加入"+name(id));return;}
      const kind=/起点|出发/.test(q)?"start":"end";line("用"+name(id)+"作"+(kind==="start"?"起点":"终点")+"，我帮你重新安排。","bird",[["确认改路线",()=>{setPoint(id,kind);go("index");}]]);return;
    }
    if(/^(帮我看看行程|接下来去哪|到终点来得及吗|我的行程|还能赶上吗|还来得及吗)$/.test(q)){showRoute();return;}
    if(/^(下一步怎么走|下一步|我走到哪一步了|我该在哪下车|下一站怎么走)$/.test(q)){navigation();return;}
    if(/收集了|打过卡|打卡了哪些|哪些地点.*打卡/.test(q)){stampInfo();return;}
    if(page==="postcard"&&/这一页讲什么|这一段/.test(q)){line($("landmark").textContent+"。"+$("leafBody").textContent);return;}
    if(page==="reception"&&/这一页讲什么|这一段/.test(q)){line($("choiceTitle").textContent+"。"+$("choiceCopy").textContent);chips(defaults());return;}
    if(/从.+(?:到|去)|[点时:：].*(看比赛|观赛|开幕)|加入|途经|移除|不去|跳过|改成步行|改走|分钟.*到|[点时：:].*(到|赶)|帮我排一条|规划路线/.test(q)){next();return;}
    if(/介绍武汉|认识武汉|第一次来武汉|武汉是什么样|初到武汉|三镇|武汉人怎样过早/.test(q)){cityIntro(q);return;}
    if(/^(再讲一点|还有呢|然后呢|举个例子)[呀吗？?]?$/.test(q)){
      if(state.hostTopic==="wuhan"){cityIntro("两江三镇");return;}
      const more={spu:"企业怎么进社区",community:"学习者怎么加入社区",saig:"赛后市场检验"};
      if(more[state.hostTopic]){eventAnswer(more[state.hostTopic]);return;}
    }
    if(eventAnswer(q))return;
    const id=place||(/它|再讲/.test(q)?recent:null)||(/这里|这个地方|这儿|这一站|它|这座|这里怎么看|多久|再讲|还有什么/.test(q)?present||recent:null);
    if(id&&/多久|多长时间|留多少/.test(q)){placeReply(id,"time");return;}
    if(id&&/介绍|故事|这里怎么看|讲|了解|特色|好玩|值得|长什么样|还有什么/.test(q)){placeReply(id,/再讲|还有什么/.test(q)?"more":"intro");return;}
    if(/沿途|顺路|换乘|地铁|路线|怎么走|推荐|拍照|想吃|停留|迟到|赶|来得及|最晚|换一个|再推荐|还有呢|下一个|别的呢|几点|几分钟/.test(q)||id){next();return;}
    await freeReply(q);
  }
  const pageLead=()=>mapAgent?.step()?.short||(localPlace()?"陪你看"+liveName():({trip:"我帮你核对时间",reception:"这一段，我来讲",city:"一起看看你的武汉",collection:"陪你翻打卡册",cards:"想先听哪一站？",index:"我陪你走这段路"})[page]||"这一站，一起看");
  function mount(){
    const main=document.querySelector("main");
    if(desk)document.querySelector('nav [data-nav="index"]')?.removeAttribute("aria-current");
    if(desk){
      document.title="小江豚接待台 · 江岸见";
      const home=node("section","hostDesk");home.setAttribute("aria-label","小江豚接待台");
      home.innerHTML='<div class="hostCopy"><p class="hostEyebrow">武汉 SPU 城市接待员</p><h1>你好呀，<br>我是小江豚。</h1><p>想沿江走走，还是要赶一场比赛？<br>告诉我，我们一起安排。</p><form class="hostAsk"><input aria-label="和小江豚说说" placeholder="我从华科出发，下午想去看比赛…" maxlength="180"><button type="submit">聊聊 ↗</button></form></div><button type="button" class="hostPortrait" aria-label="和小江豚说说话"><img src="assets/receptionist.webp" alt="微笑的蓝色江豚接待员"><span>和我说说话 ↗</span></button><div class="hostTopics"></div>';
      for(const [label,q] of [["听我讲武汉","认识武汉"],["一起排行程","帮我安排行程"],["走进 SPU 社区","介绍 SPU 社区"],["认识 SPU 与 SAIG","SPU 和 SAIG 有什么关系"]])home.querySelector(".hostTopics").append(button(label,()=>open(q)));
      home.querySelector(".hostPortrait").onclick=()=>open();
      home.querySelector("form").onsubmit=e=>{e.preventDefault();const input=home.querySelector("input");open(input.value);input.value="";};
      main.prepend(home);
    }else{
      const bar=node("section","hostBar");bar.setAttribute("aria-label","小江豚随行接待");bar.innerHTML='<img src="assets/receptionist.webp" alt=""><div><small>小江豚 · 随行接待</small><strong id="hostCue" aria-live="polite"></strong></div><button type="button">和我聊聊 ↗</button>';bar.querySelector("button").onclick=()=>open();main.prepend(bar);
      refresh();
    }
    const anchor=main.querySelector(".hostBar,.hostDesk");
    if(anchor && "IntersectionObserver" in window){
      const companion=button("问小江豚",()=>open());companion.className="hostCompanion";companion.hidden=true;
      const avatar=new Image();avatar.src=officialAvatar;avatar.alt="";companion.prepend(avatar);document.body.append(companion);
      const visible=new Set();
      const observer=new IntersectionObserver(entries=>{
        for(const item of entries){if(item.isIntersecting)visible.add(item.target);else visible.delete(item.target);}
        companion.hidden=visible.size>0;
      });
      observer.observe(anchor);if($("askBird"))observer.observe($("askBird"));
      panel.addEventListener("close",()=>{if(!companion.hidden && !document.querySelector("dialog[open]"))companion.focus({preventScroll:true});});
    }
    $("hostStatus").textContent="离线导览 · 地点与行程问答";
    document.addEventListener("host-cue",e=>cue(e.detail));
    panel.querySelector("[data-close]").onclick=()=>panel.close();
    $("chatForm").onsubmit=e=>{e.preventDefault();const input=$("chatInput");if(!busy){submit(input.value);input.value="";}};
    if($("askBird"))$("askBird").onclick=()=>open();
    $("hostContext").textContent=contextText();
    if(location.origin==="http://127.0.0.1:18769")fetch("/host/status").then(r=>r.json()).then(r=>{readyModel=r.ready===true;if(readyModel&&!busy)$("hostStatus").textContent="本机对话 · Qwen2.5 3B";}).catch(()=>{});
    if(state.hostRequest&&mapAgent){const request=state.hostRequest;delete state.hostRequest;persist();open();handoff(request);}
  }
  function refresh(){const cue=$("hostCue");if(cue){const v=pageLead();if(v!==lastCue){cue.textContent=v;lastCue=v;}}if(panel.open)$("hostContext").textContent=contextText();}
  function cue(text){if($("hostCue")){$("hostCue").textContent=text;lastCue=text;}}
  return {mount,open,line,freeReply,refresh,cue,connect(map){mapAgent=map;}};
}
