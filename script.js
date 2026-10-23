// 첫 번째 프로토타입: 대화 → 조리 → 시식 → 영업 종료
const $ = (id) => document.getElementById(id);
const scenes = ['dialogueScene', 'cookingScene', 'tastingScene', 'endingScene'];
const dialogue = [
  {speaker:'사장님', text:'어서 오세요! 오늘부터 함께 일할 우리 신입 직원입니다. 허허.'},
  {speaker:'손님', text:'반가워요. 오늘은 셰프님 추천으로 부탁드릴게요.'},
  {speaker:'사장님', text:'좋습니다. 그럼 우리 신입 직원이 정성껏 준비해 드리죠.'},
  {speaker:'사장님', text:'서두를 필요 없어요. 한 접시를 제대로 완성하는 게 중요하답니다.'}
];
let dialogueIndex = 0;
let cookingStep = 0;
const cooking = [
  {button:'손질 완료 → 조리하기',hint:'칼을 좌우로 움직여 두께를 정하고 아래로 드래그해 썰어 주세요.',note:'시간제한은 없어요. 3번 이상 썰면 다음 단계로 넘어갈 수 있어요.',food:'재료',className:'food-raw'},
  {button:'조리 완료 → 플레이팅',hint:'불 세기를 선택하고 양면을 골고루 익혀 주세요.',note:'팬을 달구고 재료를 뒤집어 주세요.',food:'손질 완료',className:'food-cut'},
  {button:'플레이팅하기',hint:'알맞게 익혔어요. 접시에 담아 주세요.',note:'조리가 완료됐어요.',food:'조리 완료',className:'food-cooked'},
  {button:'손님께 내어드리기',hint:'완성된 한 접시입니다.',note:'플레이팅까지 마쳤어요!',food:'완성!',className:'food-plated'}
];
function showScene(id,label){
  scenes.forEach(scene=>$(scene).classList.toggle('hidden',scene!==id));
  $('sceneLabel').textContent=label;
}
function renderDialogue(){
  const line=dialogue[dialogueIndex];
  $('speaker').textContent=line.speaker;
  $('dialogueText').textContent=line.text;
  $('nextDialogue').textContent=dialogueIndex===dialogue.length-1?'요리 시작하기 ›':'다음 대사 ›';
}
function renderCooking(){
  const state=cooking[cookingStep];
  $('cookingHint').textContent=state.hint;
  $('worktopNote').textContent=state.note;
  $('foodLabel').textContent=state.food;
  $('food').className='food '+state.className;
  $('food').classList.toggle('hidden',cookingStep===0 || cookingStep===1);
  $('panArea').classList.toggle('hidden',cookingStep!==1);
  $('heatControls').classList.toggle('hidden',cookingStep!==1);
  if(cookingStep!==1) stopHeat();
  $('slicingArea').classList.toggle('active',cookingStep===0);
  $('sliceStats').classList.toggle('hidden',cookingStep!==0);
  $('cookButton').disabled=(cookingStep===0 && cutPoints.length<3) || (cookingStep===1 && !isCooked());
  if(cookingStep===1) renderHeat();
  if(cookingStep===0) renderSlices();
  $('cookButton').textContent=state.button;
  for(let i=0;i<3;i++){
    $('step'+i).className='step'+(i<cookingStep?' done':i===cookingStep?' active':'');
  }
}
function resetGame(){
  cutPoints=[];resetHeat();
  dialogueIndex=0;cookingStep=0;
  $('orderPanel').classList.add('hidden');
  $('orderButton').setAttribute('aria-expanded','false');
  renderDialogue();renderCooking();showScene('dialogueScene','첫 손님');
}
$('nextDialogue').addEventListener('click',()=>{
  if(dialogueIndex<dialogue.length-1){dialogueIndex++;renderDialogue();}
  else{showScene('cookingScene','조리 중');renderCooking();}
});
$('orderButton').addEventListener('click',()=>{
  const isHidden=$('orderPanel').classList.toggle('hidden');
  $('orderButton').setAttribute('aria-expanded',String(!isHidden));
});
$('cookButton').addEventListener('click',()=>{
  if(cookingStep===0 && cutPoints.length<3) return;
  if(cookingStep===1 && !isCooked()) return;
  if(cookingStep<3){if(cookingStep===1) stopHeat();cookingStep++;renderCooking();}
  else showScene('tastingScene','시식');
});
$('finishButton').addEventListener('click',()=>showScene('endingScene','영업 종료'));
$('playAgain').addEventListener('click',resetGame);
$('resetButton').addEventListener('click',resetGame);

// 재료를 가로로 썰어내는 프로토타입. 폭 100% = 140mm 가상 재료.
let cutPoints=[];
const sliceArea=$('slicingArea');
const meat=$('slicingMeat');
const MAX_MM=140;
let dragStart=null;
function meatBounds(){return meat.getBoundingClientRect();}
function localX(clientX){const r=meatBounds();return Math.max(0,Math.min(1,(clientX-r.left)/r.width));}
function renderSlices(){
  meat.replaceChildren();
  const points=[0,...cutPoints,1];
  for(let i=0;i<points.length-1;i++){
    const piece=document.createElement('div');
    piece.className='meat-piece '+(i<cutPoints.length?'cut':'remaining');
    piece.style.left=(points[i]*100)+'%';
    piece.style.width=((points[i+1]-points[i])*100)+'%';
    piece.title=Math.round((points[i+1]-points[i])*MAX_MM)+'mm';
    meat.append(piece);
  }
  $('sliceCount').textContent=cutPoints.length+'번 절단';
  const last=cutPoints.length?Math.round((cutPoints.at(-1)-(cutPoints.at(-2)??0))*MAX_MM):null;
  $('sliceThickness').textContent=last!==null?'마지막 조각: '+last+'mm · 남은 재료: '+Math.round((1-cutPoints.at(-1))*MAX_MM)+'mm':'칼을 움직여 위치를 정해 주세요.';
  $('cookButton').disabled=cutPoints.length<3;
}
function guideAt(clientX){
  const r=sliceArea.getBoundingClientRect(), x=clientX-r.left;
  sliceArea.style.setProperty('--knife-x',Math.max(0,Math.min(r.width,x))+'px');
  if(!cutPoints.length || localX(clientX)>cutPoints.at(-1)){
    const mm=Math.round((localX(clientX)-(cutPoints.at(-1)??0))*MAX_MM);
    if(!dragStart) $('sliceThickness').textContent='예상 두께: '+Math.max(0,mm)+'mm';
  }
}
// 터치 기기에서도 포인터가 영역을 벗어나더라도 제스처를 유지한다.
function clearDrag(){
  dragStart=null;
  sliceArea.classList.remove('dragging');
  sliceArea.style.setProperty('--drag-y','0px');
}
sliceArea.addEventListener('pointerdown',e=>{
  if(cookingStep!==0 || dragStart || (e.pointerType==='mouse' && e.button!==0))return;
  const last=cutPoints.at(-1)??0;
  // 재료 가장자리에서 시작해도 유효한 절단 지점으로 보정한다.
  const x=Math.max(last+.045,Math.min(.96,localX(e.clientX)));
  if(x>=.97 || last>=.915)return;
  dragStart={x,startY:e.clientY,id:e.pointerId,type:e.pointerType};
  try{sliceArea.setPointerCapture(e.pointerId);}catch(_){}
  sliceArea.classList.add('dragging');
  guideAt(e.clientX);
  sliceArea.style.setProperty('--knife-x',(meatBounds().left+meatBounds().width*x-sliceArea.getBoundingClientRect().left)+'px');
  sliceArea.style.setProperty('--drag-y','0px');
  if(e.cancelable)e.preventDefault();
});
sliceArea.addEventListener('pointermove',e=>{
  if(cookingStep!==0)return;
  if(!dragStart){guideAt(e.clientX);return;}
  if(e.pointerId!==dragStart.id)return;
  const dy=Math.max(0,Math.min(78,e.clientY-dragStart.startY));
  sliceArea.style.setProperty('--drag-y',dy+'px');
  if(e.cancelable)e.preventDefault();
});
function endSlice(e){
  if(!dragStart || e.pointerId!==dragStart.id)return;
  const dy=e.clientY-dragStart.startY;
  // 터치에서는 손가락 이동량이 작게 전달될 수 있어 임계값을 낮춘다.
  const threshold=dragStart.type==='mouse'?26:16;
  if(dy>=threshold){
    cutPoints.push(dragStart.x);
    renderSlices();
    $('worktopNote').textContent='좋아요! 칼 위치에 따라 조각 두께가 달라져요.';
  }else{
    $('worktopNote').textContent='칼을 아래로 조금 더 끌어 내려주세요.';
  }
  try{if(sliceArea.hasPointerCapture(e.pointerId))sliceArea.releasePointerCapture(e.pointerId);}catch(_){}
  clearDrag();
  if(e.cancelable)e.preventDefault();
}
sliceArea.addEventListener('pointerup',endSlice);
sliceArea.addEventListener('pointercancel',clearDrag);
sliceArea.addEventListener('lostpointercapture',clearDrag);
$('undoSlice').addEventListener('click',()=>{cutPoints.pop();renderSlices();});
$('restartSlice').addEventListener('click',()=>{cutPoints.length=0;renderSlices();});

// v0.3 팬 조리: 재료를 양면으로 나눠 익힘도를 기록한다.
const sides=[0,0];
let facing=0, heatLevel=0, heatTimer=null;
const heatNames=['꺼짐','약불','중불','강불'];
function isCooked(){return sides.every(v=>v>=65 && v<=85);}
function stopHeat(){heatLevel=0;if(heatTimer!==null){clearInterval(heatTimer);heatTimer=null;}}
function resetHeat(){stopHeat();sides[0]=0;sides[1]=0;facing=0;}
function renderHeat(){
  $('frontMeter').value=sides[0];$('backMeter').value=sides[1];
  $('frontValue').textContent=Math.round(sides[0])+'%';
  $('backValue').textContent=Math.round(sides[1])+'%';
  $('panMeatLabel').textContent=facing===0?'앞면':'뒷면';
  $('panMeat').style.setProperty('--sear',String(sides[facing]/100));
  $('panMeat').style.background=`color-mix(in srgb, #b46c69 ${Math.max(0,100-sides[facing])}%, #65351f)`;
  $('panArea').classList.toggle('heating',heatLevel>0);
  $('heatStatus').textContent=isCooked()?'양면 모두 적당히 익었어요! 불을 끄고 다음으로 넘어가세요.':
    sides.some(v=>v>85)?'너무 익은 면이 있어요. 다시 조리하려면 처음부터 시작해 주세요.':
    `현재 ${heatNames[heatLevel]} · ${facing===0?'앞면':'뒷면'} 조리 중`;
  for(const [id,n] of [['heatLow',1],['heatMedium',2],['heatHigh',3],['heatOff',0]]){
    $(id).classList.toggle('selected',heatLevel===n);
    $(id).setAttribute('aria-pressed',String(heatLevel===n));
  }
  $('cookButton').disabled=!isCooked();
}
function setHeat(level){
  if(cookingStep!==1)return;
  stopHeat();heatLevel=level;
  if(level>0){heatTimer=setInterval(()=>{
    if(cookingStep!==1){stopHeat();return;}
    sides[facing]=Math.min(100,sides[facing]+[0,0.5,1,1.8][heatLevel]);
    if(sides[facing]>=100)stopHeat();
    renderHeat();
  },150);}
  renderHeat();
}
$('heatLow').addEventListener('click',()=>setHeat(1));
$('heatMedium').addEventListener('click',()=>setHeat(2));
$('heatHigh').addEventListener('click',()=>setHeat(3));
$('heatOff').addEventListener('click',()=>setHeat(0));
$('flipMeat').addEventListener('click',()=>{if(cookingStep!==1)return;facing=1-facing;renderHeat();});
// 화면이 보이지 않을 때는 불을 자동으로 끈다.
document.addEventListener('visibilitychange',()=>{if(document.hidden && cookingStep===1){stopHeat();renderHeat();}});
resetGame();
