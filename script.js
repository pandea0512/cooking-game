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
  {button:'재료 손질하기',hint:'재료를 준비해 주세요.',note:'손질 전 재료가 놓여 있어요.',food:'재료',className:'food-raw'},
  {button:'재료 조리하기',hint:'손질이 끝났어요. 이제 조리해 볼까요?',note:'일정한 크기로 손질된 재료예요.',food:'손질 완료',className:'food-cut'},
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
  $('cookButton').textContent=state.button;
  for(let i=0;i<3;i++){
    $('step'+i).className='step'+(i<cookingStep?' done':i===cookingStep?' active':'');
  }
}
function resetGame(){
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
  if(cookingStep<3){cookingStep++;renderCooking();}
  else showScene('tastingScene','시식');
});
$('finishButton').addEventListener('click',()=>showScene('endingScene','영업 종료'));
$('playAgain').addEventListener('click',resetGame);
$('resetButton').addEventListener('click',resetGame);
resetGame();
