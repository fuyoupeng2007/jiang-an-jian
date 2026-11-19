/* Each spread belongs to a place or to an explicitly named neighbourhood walk. */
const bookGroups = [
  ["喻家山校园手册", "forest", ["hustgate", "hust", "youth", "zuiwan", "wutong"]],
  ["珞珈山校园手册", "forest", ["whu", "yingroad", "castle", "oldlib", "lawn", "lingbo"]],
  ["蛇山黄鹤楼手册", "forest", ["tower", "whitecloud", "goose", "poem", "yuefei"]],
  ["汉阳门江边手册", "river", ["hym", "bridgehym", "hymboat", "folksong", "zhpier"]],
  ["光谷广场手册", "city", ["optic", "starlight", "opticstreet", "opticentry", "spain", "duomo", "france"]],
  [
    "江汉路与江汉关",
    "city",
    ["jh", "bankfront", "siming", "custom", "customporch", "clockriver", "whpier", "watertower"],
  ],
  ["汉口江滩手册", "river", ["riverpark", "jianghanmen", "flood", "yuehan", "reeds"]],
  ["武昌过早散步", "city", ["dacheng", "mianwo", "fishsoup", "hubu", "cailin", "reganmian"]],
  ["汉口里份与过早", "city", ["jiqing", "doupi", "shaomai", "xianan", "packing", "bagong", "lhp", "shanhai"]],
  ["万松园街区", "city", ["xuesong", "gardendao", "xibei"]],
  ["黄鹤楼下的老武昌", "city", ["red", "desheng", "tan", "grain"]],
  ["首义文化街区", "city", ["shouyi", "redhouse"]],
  ["东湖听涛手册", "lake", ["tingtao", "changtian", "fishpool", "cangbai", "xingyin", "greenway", "jiunv"]],
  ["东湖西岸场馆", "lake", ["museum", "hbart"]],
  ["东湖磨山手册", "lake", ["chutian", "wheel", "sakura", "plum", "botanic"]],
  ["东湖湖山漫步", "lake", ["luoyan", "forest", "balloon"]],
  ["月湖与琴台", "lake", ["qintai", "opera", "qintaiart", "moonlake"]],
  ["龟山脚下的江岸", "river", ["qc", "tie", "guishan", "hybank"]],
  ["青山江滩与街区", "river", ["qsbank", "qspark", "enshi"]],
  ["武汉桥边漫步", "river", ["bridge", "nanan", "parrot", "yangsi"]],
  ["汉口滨江街区", "city", ["tiandi", "gude", "liberation"]],
  ["武昌江岸散步", "river", ["wuchangbank", "jiyu", "simetang"]],
  ["汉正街与江汉朝宗", "river", ["hanzheng", "longwang"]],
  ["循礼门与汉口市区", "city", ["xhb", "zsp", "hankouart"]],
  ["汉阳街巷手册", "city", ["guiyuan", "hanyangzao"]],
  ["沙湖与楚河", "lake", ["sha", "hanstreet", "library"]],
];
const sceneNotes = {
  opticentry: [
    "现代风情街入口",
    "opticstreet",
    "从光谷广场一侧进入步行街，先在入口广场认清回地铁的方向。向里走可以依次找拱廊、尖塔和不同街区的小店。",
    "opticstreet",
    "到步行街入口",
  ],
  changtian: [
    "长天楼",
    "tingtao",
    "沿听涛景区湖岸寻找长天楼。先隔一小段水面看楼与树冠的轮廓，再沿岸靠近，远望和近看会得到两种完全不同的层次。",
    "tingtao",
    "到听涛景区",
  ],
  fishpool: [
    "碧潭观鱼",
    "tingtao",
    "从开阔的东湖转到园内的碧潭，低头看鱼从树影里游出来。把手机稍稍侧过去，水面反光会轻一点。",
    "tingtao",
    "到听涛景区",
  ],
  cangbai: [
    "苍柏园",
    "tingtao",
    "到苍柏园，把步子放慢，读一读纪念周苍柏的园内介绍。眼前的树荫与远处的湖面，正适合把听涛的故事连起来。",
    "tingtao",
    "到听涛景区",
  ],
  jiunv: [
    "九女墩湖岸",
    "greenway",
    "从梨园方向进入绿道，沿湖走时留意九女墩一带的水面与小岛。长焦能压近两岸，广角则适合把风吹过的树一起拍下。",
    "greenway",
    "到梨园绿道入口",
  ],
  spain: [
    "西班牙风情街",
    "opticstreet",
    "穿过红砖拱廊，先留意拱券重复的节奏。转过街角再回拍，让一排透光的开口带着视线向远处走。",
    "opticstreet",
    "到光谷步行街",
  ],
  duomo: [
    "多莫广场",
    "opticstreet",
    "从西班牙风情街接向意大利风情街，找广场前的尖拱与塔尖。天色还带蓝时，亮起的建筑细部比全黑后更容易看清。",
    "opticstreet",
    "到光谷步行街",
  ],
  france: [
    "法式街角",
    "opticstreet",
    "把镜头移到街角露台和小店窗边。走累了可以在这里坐一会儿，再回光谷广场换乘，记得把步行折返的时间算进去。",
    "opticstreet",
    "到光谷步行街",
  ],
  bridgehym: [
    "桥下望江",
    "hym",
    "汉阳门在武昌岸。沿开放的上层步道向大桥望去，用近处的枝叶框住桥桁架，江上的船会慢慢驶进画面。",
    "hym",
    "到汉阳门花园",
  ],
  clockriver: [
    "沿江望钟楼",
    "custom",
    "绕到沿江大道一侧，让钟楼从路旁建筑的边线里露出来。若还想看码头，沿人行横道过街，再沿江边向前走。",
    "custom",
    "到江汉关",
  ],
  customporch: [
    "江汉关的柱廊",
    "custom",
    "看过钟楼，再把视线放低。靠近临街一侧，比较石柱、柱头和柱间阴影；在街边看外观，也能读出这栋建筑的比例。",
    "custom",
    "到江汉关",
  ],
  bankrail: [
    "沿堤看船",
    "riverpark",
    "在江滩上层平台找一处开阔视线，先看对岸，再等船划过。江水高低会改变能走的岸线，听从当天的封闭提示。",
    "riverpark",
    "到汉口江滩",
  ],
  reganmian: [
    "热干面",
    "cailin",
    "等面刚拌好，趁热把芝麻酱、萝卜丁和碱水面翻匀。想继续尝别的小吃，可以两个人分着点，留一点胃口给下一站。",
    "cailin",
    "到户部巷一带",
  ],
  mianwo: [
    "面窝",
    "dacheng",
    "刚出锅的面窝，厚边松软，薄处酥脆。看摊主把米浆倒进特制的勺里，往往比站在队尾看招牌更有意思。",
    "dacheng",
    "到大成路",
  ],
  fishsoup: [
    "鲜鱼糊汤粉",
    "dacheng",
    "在早点街找一碗带胡椒味的糊汤粉，配根油条分着蘸。摊位、售卖时间会变，这页记的是武汉人的吃法。",
    "dacheng",
    "到大成路",
  ],
  shaomai: [
    "重油烧梅",
    "jiqing",
    "揭开蒸笼看薄皮托着糯米，趁热吃能闻出胡椒的香气。若还要走几家过早铺，先点小份慢慢尝。",
    "jiqing",
    "到吉庆街区",
  ],
  youth: [
    "青年园水岸",
    "hust",
    "树色落进青年园的水里。沿着岸边走半圈，倒影里的亭子会先于真亭出现。",
    "zuiwan",
    "到醉晚亭附近",
  ],
  wutong: [
    "梧桐语问学中心",
    "hust",
    "先看树下的建筑如何围合出交流空间，再绕到绿荫里坐一会儿。这页留给华科校园的新面貌。",
    "hustgate",
    "到华科南大门",
  ],
  hymboat: [
    "汉阳门望轮渡",
    "hym",
    "停在武昌岸上，观察轮渡缓缓改变角度。用对岸的楼群作背景，一艘过江船就成了画面的主角。",
    "hym",
    "到汉阳门花园",
  ],
  folksong: [
    "江边听一首歌",
    "hym",
    "把桥和水面留在视野里。如果恰好听到有人唱歌，可以多坐一会儿；没有音乐，轮船和江风也是这一页的声音。",
    "hym",
    "到汉阳门花园",
  ],
  starlight: [
    "星河入夜",
    "optic",
    "天光将暗时，找个开阔位置看“星河”的曲线。顺着光带看一圈，再转身看看周围街区渐次亮起的灯。",
    "optic",
    "到光谷广场",
  ],
  bankfront: [
    "街角的老银行",
    "jh",
    "在步行街抬头找弧形窗、柱头与转角。选一扇窗作中心，比把整条街装进镜头更容易留下建筑的细节。",
    "jh",
    "到江汉路步行街",
  ],
  reeds: [
    "江滩芦花季",
    "riverpark",
    "秋风起时，沿开放栈道找一段逆光的芦苇。江滩绵延很长，赏芦需从自己的入口再走一段，花期和开放岸线随水情变化。",
    "riverpark",
    "到汉口江滩",
  ],
  doupi: [
    "灶台边的三鲜豆皮",
    "jiqing",
    "从摊前看铁锅翻面，薄薄的表皮包住糯米和馅。刚出锅的一小块，和走累后的慢慢坐下，都很武汉。",
    "jiqing",
    "到吉庆街",
  ],
};
const foodIds = new Set("hubu cailin dacheng grain shanhai xuesong jiqing enshi opticstreet".split(" "));
const waterIds = new Set(
  "hym riverpark zhpier whpier flood yuehan qsbank lingbo greenway tingtao luoyan xibei longwang moonlake yangsi hybank wuchangbank jiyu".split(
    " ",
  ),
);
const photoIds = new Set(
  "custom jh red tower whitecloud poem castle yingroad lawn zuiwan optic qintaiart bridge qintai guishan lingbo hym riverpark flood yuehan qc greenway balloon xianan packing bagong tiandi whu hustgate oldlib watertower opera".split(
    " ",
  ),
);
const demoPath = ["hustgate", "optic", "hym", "jh", "riverpark"];
const placeHints = {
  hustgate: "从校园南门出发",
  optic: "抬头看星河",
  hym: "坐在桥边等一艘轮渡",
  jh: "沿街看老银行的窗",
  riverpark: "在江边结束今天的散步",
  dacheng: "吃一份武昌早点",
  red: "从红墙取景黄鹤楼",
  custom: "看钟楼，与江汉路连逛",
  zhpier: "岸上看船进出",
  shanhai: "面窝和一碗热干面",
  lingbo: "东湖岸边的开阔远景",
};
function bookFor(id) {
  if (id === "wuhan") return { title: "初到武汉 · 两江三镇", theme: "river", ids: Object.keys(citySpreads) };
  const g = bookGroups.find((group) => group[2].includes(id));
  if (g) return { title: g[0], theme: g[1], ids: g[2] };
  const theme = waterIds.has(id) ? "lake" : /公园|校园|大学|动物园/.test(places[id].n) ? "forest" : "city";
  return { title: places[id].n, theme, ids: [id] };
}
function leafData(key) {
  if (citySpreads[key]) {
    const [n, body, target, art] = citySpreads[key];
    return { n, body, target, art, parent: target, title: n, action: "去" + places[target].n };
  }
  if (sceneNotes[key]) {
    const [n, parent, body, target, action] = sceneNotes[key];
    return { n, parent, body, target, action, art: "assets/scenes/" + key + ".webp", title: n };
  }
  const p = places[key];
  return {
    n: p.n,
    parent: key,
    body: p.s,
    target: key,
    action: "去这里",
    art: p.art,
    title: journal[key].title,
  };
}

for (const promoted of ["wutong", "changtian", "bankrail"]) delete sceneNotes[promoted];
waterIds.add("jianghanmen");
waterIds.add("changtian");
for (const id of ["siming", "jianghanmen", "wutong", "changtian"]) photoIds.add(id);

const fieldNotes = {
  tower: [
    "黄鹤楼立在武昌蛇山上。主楼外观五层，翘檐一层层收起；在白云阁一侧远望，楼、山和江岸更容易同时入眼。",
    "先看完整楼身，再走近看飞檐。主楼附近适合取局部；想让建筑在城市天际线里显出比例，可去白云阁一侧回望。",
  ],
  whitecloud: [
    "白云阁所在的位置让人能换个方向看黄鹤楼。把两处排在同一趟园内游里，能看到前后两种尺度。",
    "把主楼放在画面三分之一处，给树冠和远方江面留出空间。",
  ],
  goose: [
    "蛇山公园的印象除了主楼与江风，还有池塘与园林。鹅池是一处可放慢节奏的园内停留。",
    "用水岸曲线做前景，等水面平静后再拍倒影。",
  ],
  poem: [
    "崔颢的《黄鹤楼》让许多人在到武汉之前就认识了这座楼。园内诗壁与搁笔亭适合在登楼前后对照着看。",
    "拍诗壁时正对墙面，侧光容易显出刻痕。再换个角度，把亭檐纳入第二张。",
  ],
  yuefei: [
    "岳飞广场、功德坊和铜像组成园内另一条观看线。地图落在功德坊附近，再按园内指示看雕像。",
    "用低一些的角度看人物衣甲，留出上方天空，避免从游客队列里举手机。",
  ],
  hustgate: [
    "华科主校区在喻家山一带。南大门是校外交通与校园慢步之间的切换点，校名墙、南一楼和青年园适合依次看。",
    "在人行道上退远几步，用两侧树冠围住校名墙，门内外的氛围会更清楚。",
  ],
  hust: [
    "南一楼前的广场给了老教学楼足够的观看距离。往青年园和醉晚亭走，可以从整齐的建筑轴线走入水边树荫。",
    "站在允许通行的广场边缘，先用正面构图看对称，再沿树荫取侧光。",
  ],
  zuiwan: [
    "醉晚亭在华科校园青年园的水岸附近。华科人的校园回忆里，这里常与南一楼、梧桐树一道被提起。",
    "隔水看亭更容易留下亭檐的完整轮廓。风小时等倒影，起风时拍树叶与碎光。",
  ],
  wutong: [
    "梧桐语问学中心把交流、学习和校园生活放在同一片空间里。明义楼是可辨认的现场参照。",
    "从庭院看树与建筑的关系，保留窗和檐下的阴影；室内有活动时只取外景。",
  ],
  whu: [
    "武汉大学依珞珈山、临东湖。樱园旧建筑借山势展开，走百步梯能直接感受到校园的高差。",
    "想拍校园建筑不必等花期。用石阶、一段围墙或草坪边线引向屋顶，花季可把枝条当作前景。",
  ],
  castle: [
    "“樱花城堡”是游客对樱园老建筑的称呼。老斋舍顺坡布置，百步梯把林荫大道与较高的台地联系起来。",
    "从坡下保留台阶的起点，镜头稍向上让阶梯收拢；别在通行通道中间久停。",
  ],
  yingroad: [
    "樱花大道把花季和校园的老建筑连在一起。盛花期很短，校园的树干与屋檐在其他季节也值得看。",
    "离树枝留一点距离，找能透过去看见绿色屋顶的角度；不攀树、不入封闭草坪。",
  ],
  oldlib: [
    "老图书馆与樱园建筑共同构成武大的经典天际线。看它之前走过山坡和石阶，楼的高度就有了参照。",
    "在开放平台横向移动几步，让屋脊从近处树冠之间露出来。",
  ],
  lingbo: [
    "凌波门在东湖岸边。它与樱园并非紧挨着的两个机位，校园与湖岸之间还需留步行时间。",
    "沿岸上的开放步道看天光映在湖面。无需进入低处栈道，就能拍到水天之间的层次。",
  ],
  hym: [
    "汉阳门花园在武昌江岸，可以从这里看长江大桥、船和对岸。想听歌可以在岸上多坐一会儿，演出与人物出现均随缘。",
    "先让桥身把画面分成上下两层，再等一艘船进入桥侧的空处。退到上层步道，视野比挤在栏杆前更完整。",
  ],
  jh: [
    "江汉路把老汉口的商铺、银行旧址和沿江街区串在一起。沿步行街向江边走，立面的窗列、石材和尺度会逐渐变化。",
    "在步行街另一侧找一个退距够大的位置。四明银行适合拍垂直线条，江汉关适合用街角留出整座钟楼。",
  ],
  siming: [
    "四明银行汉口分行旧址位于江汉路45号。石墙上通顶的竖线、规则窗格和略高的中央部分，是辨认其立面的线索。",
    "正面拍上部的竖向节奏，走近再拍门框。照片里同时放进一点街边树影，会比只拍一面墙更生动。",
  ],
  custom: [
    "江汉关大楼矗立在江汉路与沿江大道相接处。走到街角，钟楼、柱廊和面江的一侧会同时进入视野。",
    "从街口隔一段距离拍钟楼和整排柱廊，再靠近拍石柱细部。过街用斑马线。",
  ],
  riverpark: [
    "汉口江滩是一条很长的滨江公共空间。江汉门、防汛纪念碑和芦苇观赏区是不同的点，看江一刻钟和走完整段的用时相差很大。",
    "逆光适合拍水面的亮带。拍芦花要在花期和开放的栈道上，靠临江大道的上层步道也能取到宽阔江面。",
  ],
  jianghanmen: [
    "江汉门是汉口江滩在沿江大道上的入口之一。从江汉路走向江滩，可以先看江汉关，再将这里设为下一站。",
    "从入口进入后先观察堤岸高差。留一段栏杆作近景，水面作留白，江上的船就有了尺度。",
  ],
  optic: [
    "光谷广场的城市雕塑“星河”以连续的弧线辨识度最高。广场、地下交通空间和光谷步行街需要分开定位。",
    "从开放的外圈人行区域看曲线的重叠，傍晚在天空仍有亮度时拍，金属结构与灯光能同时保住细节。",
  ],
  opticstreet: [
    "光谷步行街里有西班牙、意大利等不同主题的街段。想拍拱廊与多莫广场，可以给步行街单独留一站。",
    "砖拱适合斜着拍重复轮廓；多莫广场适合先退远收全塔尖，天刚暗时再拍有灯光的一张。",
  ],
  greenway: [
    "东湖绿道由多条游线组成。梨园是一个明确的入口，听涛、磨山和落雁分别适合不同长度的游程。",
    "沿湖找一段有开阔前景的岸线，用树影或低矮栏杆做边框。先选一小段走，再决定是否继续。",
  ],
  tingtao: [
    "听涛景区里有长天楼、碧潭观鱼、苍柏园和行吟阁。把它们串成湖边慢步，比一天横跨几个东湖片区轻松。",
    "先拍一个带楼阁的远景，再找近处水中倒影，画面有疏有密。",
  ],
  changtian: [
    "长天楼在东湖听涛景区。它和行吟阁都是认方向的好参照，游览时可按岸边开放步道连起来。",
    "绕到湖岸稍偏的位置回望，别让近处树干正好遮住楼身。",
  ],
  dacheng: [
    "武昌大成路的看点是不同早点摊之间的距离很近。面窝、豆皮、热干面和糊汤粉适合分着尝，营业看各家当天安排。",
    "站在摊位侧后方拍刚出锅的食物，把手和热气留在画面里，给排队取餐的人留通道。",
  ],
  shanhai: [
    "山海关路的过早往往还包括附近的小街。沿街找出锅的东西，这顿早餐本身就是一次老汉口街区散步。",
    "拍食物时靠近自然光，再退到街口拍一张街面，看得出这一餐从哪里来。",
  ],
  qc: [
    "晴川阁景区在汉阳龟山东麓，面向长江。晴川阁、禹稷行宫和铁门关是辨认这组建筑的三处线索。",
    "先在开放岸线看阁与江的关系，再转入廊下，用柱列框出远处的水面。",
  ],
  flood: [
    "防汛纪念碑记录了武汉人与江水相处的历史。基座下的防汛陈列展在临沿江大道一侧，室内开放另看公告。",
    "先从堤岸的步道看碑与开阔水面的比例，走近再拍基座细部。",
  ],
};
const citySpreads = {
  overview: [
    "两江在这里相会",
    "长江和汉江在武汉交汇，江水把城市分出武昌、汉口、汉阳三镇。从蛇山上看看江和桥，再到江边走，方向就容易记住了。",
    "tower",
    "assets/scenes/wuhan-wide.webp",
  ],
  oldhankou: [
    "沿着钟声逛汉口",
    "从江汉路走向江汉关，窗列、柱廊和钟楼一路把人带到水边。想坐一会儿，沿江汉门进入江滩，逛到哪里都能再改路线。",
    "custom",
    "assets/art/custom.webp",
  ],
  guihan: [
    "从汉阳望武昌",
    "到汉阳龟山脚下，从晴川阁一带望向对岸。换一边岸看同一条江，桥、楼和船的前后关系都变了。",
    "qc",
    "assets/art/qc.webp",
  ],
  lakeside: [
    "向东，走进湖和校园",
    "从江面换到东湖，节奏也可以慢下来。梨园入口适合找一段绿道；珞珈山、喻家山附近的学校，各自值得单独留出一册时间。",
    "greenway",
    "assets/scenes/bg-lake.webp",
  ],
  breakfast: [
    "早晨，从一碗面开始",
    "武汉把吃早餐叫“过早”。热干面、面窝、糊汤粉和豆皮不必一次吃齐。选一条早点街，吃完直接接上附近的步行路线。",
    "dacheng",
    "assets/scenes/reganmian.webp",
  ],
};
