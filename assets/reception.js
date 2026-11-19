const receptionTopics = {
  community: {
    tab: "SPU 社区", title: "走进数命 SPU 社区",
    lead: "在武汉，企业可以带着一个真实问题走进社区，想学 AI 的人也可以带着这个问题开始第一份项目。",
    picture: "models/zhimin-0.webp", caption: "智民里 · A1–A5 街区模型",
    kicker: "江岸智民里 / 光谷创新天地", section: "你想以什么身份来？",
    choices: [
      ["我是学习者", "跟一张订单，学一次交付", "有交付经验的 SPU 带着学习者理解客户的需求，把任务做完，再拿结果和客户核对。这就是社区所说的“以订单养才”。能深入业务现场、推动项目落地的交付人才，社区称为 FDE。"],
      ["我有企业需求", "带着业务问题来工坊", "先说明谁在什么场景遇到困难、什么结果可以验收。社区对接人才和工具，自研的组织交付智能体 BIWEN 协助梳理需求、拆解任务和调度资源。AI 工坊负责组织订单交付，规划中的体验区则供客户动手了解智能体。"],
      ["我在创业", "一人公司也能组织协作", "社区为 OPC（一人公司）等创业者对接订单、政策、技术与协作资源。你可以带方案来路演、寻找客户，围绕具体任务组织人和 AI，再通过交付积累下一次合作。"]
    ],
    asideTitle: "武汉有哪两处空间？",
    aside: "数命科技（武汉）有限公司建设运营。江岸智民里和光谷创新天地两处布局合计近 8,000 平方米。智民里结合老城街区，规划了共享工坊、AI 展示与文旅体验。",
    source: "数命SPU社区说明", next: "spu", nextLabel: "认识这里的 SPU"
  },
  spu: {
    tab: "数命 SPU", title: "一个人怎样完成一次交付",
    lead: "SPU 是 Super Person Unit，中文叫“超级个体单元”。它描述一个人的能力：能自己作判断，借助 AI 把事情做完，并为结果负责。",
    picture: "receptionist.webp", caption: "武汉 SPU 城市 AI 接待员 · 官方形象",
    kicker: "Super Person Unit", section: "用一次武汉导览理解五项能力",
    choices: [
      ["独立判断", "先问清楚，游客最在意什么", "以这份导览为例：游客既想看江，也要赶上比赛。接待员先弄清出发点、最晚到场时间和愿意步行的距离，再决定哪些景点值得留下。"],
      ["调用 AI", "把合适的工具用在合适的地方", "导览示例中，接待员理解游客的话，路网负责计算步行和换乘。运营者选择工具并核对输出，尤其要核对日期、站名和场馆入口。"],
      ["组织任务", "把一个愿望拆成几件能做的事", "将“看江后去比赛”拆成选看江点、找换乘、安排停留和预留进场时间。先后顺序明确后，游客才能在地图上改其中一站。"],
      ["完成交付", "把建议交到游客手里", "游客拿到能点开的路线、每段换乘和预计到场时间。双击还能查看沿途资料。能按这份行程走、能自己修改，就是这个示例的验收方式。"],
      ["承担责任", "发现时间过期，就改到游客看得到的地方", "旧材料曾列出连续 48 小时赛程。导览以官网公布的调整为准，把讲解和日程一并更新，并保留来源供游客核对。"]
    ],
    asideTitle: "人的判断，AI 的放大作用",
    aside: "数命科技用 U = Pˢ 表达这一理念。U 指创造的价值，P 指人的决断力，S 指 AI 带来的外部能力。在这个表达里，判断、选择和责任都由人承担。",
    source: "数命SPU说明", next: "saig", nextLabel: "看这些能力怎样参赛"
  },
  saig: {
    tab: "SAIG 比赛", title: "到江岸，看一张订单怎样完成",
    lead: "SAIG 数命 SPU 国际 AI 大赛由数命 SPU·江岸社区发起。首届从黑客松开始，让参赛者用 AI 解决来自湖北、湖南、江西、河北、台湾五地的实际需求。",
    picture: "models/packing-0.webp", caption: "平和打包厂 · 观赛场地模型",
    kicker: "SAIG / 武汉江岸 / 2026", section: "你想了解哪一段？",
    choices: [
      ["线上预选", "独立做一位武汉城市 AI 接待员", "个人报名，提交项目简介和可观看的完整演示视频链接，产品体验链接选填。介绍武汉、介绍数命 SPU 社区、提供武汉旅游规划、介绍数命 SPU 和 SAIG 比赛，各占 25 分。线上由导师审核，具体评分不公开。"],
      ["线下接单", "用两天时间完成真实需求", "12 月 17 日签到和彩排。18、19 日每天 10:00–18:00，累计 16 小时。选手自选真实订单，完成后再选；例如为客户交付海报或短视频。20 日晚在光谷举行闭幕 AI 联欢会，凭邀请入场。"],
      ["市场检验", "交付以后，继续看真实使用效果", "后续作品进入使用场景，记录需求方和用户的反馈，持续维护改进。按官网公布的调整，市场检验到 2027 年 3 月 31 日，线下综合成绩由现场成绩 40% 与市场检验成绩 60% 组成。"]
    ],
    asideTitle: "开幕和看比赛，分别去哪？",
    aside: "智民里是主会场。官网观众指南列出的现场接单观赛地点是平和打包厂，观众入场和预约办法以开票公告为准。",
    source: "SAIG数命SPU国际AI大赛说明", next: "community", nextLabel: "了解发起赛事的社区"
  }
};

function receptionAnswer(text) {
  const q = text.toLowerCase();
  if (/biwen|组织交付智能体/.test(q)) return ["community", 1, "BIWEN 是数命科技自研的组织交付智能体，帮助梳理需求、拆解任务、调度资源和管理交付。"];
  if (/以订单养才|fde|工坊|opc|一人公司|社区.*(学|企业|创业|订单)|(学习者|企业|创业|订单).*社区/.test(q)) {
    const i = /opc|一人公司|创业/.test(q) ? 2 : /企业|工坊/.test(q) ? 1 : 0;
    return ["community", i, receptionTopics.community.choices[i][2]];
  }
  if (/(社区|智民里).*(比赛|saig).*(关系|联系)|谁.*(举办|发起)/.test(q)) return ["saig", 0, "数命 SPU·江岸社区发起 SAIG 大赛。社区平时用真实订单组织学习和交付，比赛把同一思路开放给全球参赛者，赛后再接受市场检验。"];
  if (/社区|智民里|光谷创新天地/.test(q) && !/观赛|赛场|看比赛/.test(q)) return ["community", 0, receptionTopics.community.aside + " 社区以真实订单组织交付、培养人才并支持创业。"];
  if (/市场检验|市场验证|赛后|综合成绩/.test(q)) return ["saig", 2, receptionTopics.saig.choices[2][2]];
  if (/评分|怎么打分|怎么计分/.test(q)) return ["saig", 0, "线上由导师审核。介绍武汉、介绍数命 SPU 社区、提供武汉旅游规划、介绍数命 SPU 及 SAIG 比赛，这四项各占 25 分。入围后的线下综合成绩另按现场成绩 40%、市场检验成绩 60% 合成。"];
  if (/观赛|赛场在哪|主会场|想看比赛|去看比赛|看比赛.*(哪|怎么去)|比赛.*(哪里|在哪|地点|地址)|在哪.*比赛/.test(q)) return ["saig", 1, receptionTopics.saig.aside];
  if (/线下赛|48\s*小时|16\s*小时|赛程|闭幕|比赛.*(时间|几点|哪天|多久)/.test(q)) return ["saig", 1, receptionTopics.saig.choices[1][2]];
  if (/报名|线上赛|评分|参赛.*(交|要求)|怎么参赛/.test(q)) return ["saig", 0, receptionTopics.saig.choices[0][2] + " 报名截止与入围通知请核对官网。"];
  if (/saig|介绍.*比赛|大赛.*什么/.test(q)) return ["saig", 0, receptionTopics.saig.lead + " 线上做接待员，线下接真实订单，赛后检验交付。"];
  if (/spu|超级个体|五项能力|数命是什么/.test(q)) return ["spu", 0, "SPU 是超级个体单元。五项能力是独立判断、调用 AI、组织任务、完成交付、承担责任。比如替游客规划看江和赶比赛，交付物就是一条能实际使用、还能随时改动的行程。"];
  return null;
}

function initReception(openMap,go) {
  const $ = (id) => document.getElementById(id);
  function show(key, step = 0) {
    const topic = receptionTopics[key];
    document.title = topic.tab + " · 赛事接待 · 江岸见";
    document.querySelectorAll("[data-topic]").forEach(b => b.setAttribute("aria-pressed", b.dataset.topic === key));
    $("receptionPage").dataset.topic = key;
    for (const [id, prop] of [["sectionTitle","section"],["introTitle","title"],["introLead","lead"],["introKicker","kicker"],["photoCaption","caption"],["contextTitle","asideTitle"],["contextCopy","aside"],["nextTopic","nextLabel"]]) $(id).textContent = topic[prop];
    $("topicPhoto").src = "assets/" + topic.picture;
    $("topicPhoto").alt = topic.caption;
    $("exploreModel").hidden = key === "spu";
    $("exploreModel").onclick = () => go("venue",key === "community"?"zhimin":"packing");
    $("raceGuide").hidden = key !== "saig";
    $("communityPlan").hidden = key !== "community";
    $("toVenue").hidden = key !== "saig";
    $("sourceTitle").textContent = "赛事资料包《" + topic.source + "》";
    $("scheduleSource").hidden = key !== "saig";
    const options = topic.choices.map(([label], i) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => select(i);
      return b;
    });
    function select(i) {
      const [, title, copy] = topic.choices[i];
      $("choiceTitle").textContent = title;
      document.dispatchEvent(new CustomEvent("host-cue",{detail:"一起了解"+title}));
      $("choiceCopy").textContent = copy;
      options.forEach((b,j) => b.setAttribute("aria-pressed", j === i));
      const u = new URL(location.href);
      u.searchParams.set("id",key); u.searchParams.set("leaf",String(i));
      history.replaceState(null,"",u.href);
    }
    $("choices").replaceChildren(...options);
    select(Number.isInteger(step) && step >= 0 && step < options.length ? step : 0);
    $("nextTopic").onclick = () => {show(topic.next); $("receptionPage").scrollIntoView({block:"start"});};
  }
  document.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => show(b.dataset.topic));
  $("toVenue").onclick = openMap;
  const p = new URLSearchParams(location.search);
  show(Object.hasOwn(receptionTopics,p.get("id")) ? p.get("id") : "community", Number(p.get("leaf")));
}
