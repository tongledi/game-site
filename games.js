// ========== 通用 ==========
function showGame(id){
  document.getElementById('home').style.display='none';
  document.querySelectorAll('.game-page').forEach(function(p){p.style.display='none';});
  var g=document.getElementById('game-'+id);
  if(g)g.style.display='block !important';
  if(id==='memory')initMemory();
  if(id==='tic')initTic();
  if(id==='reaction'){reactionState='idle';updateReactionDisplay();}
  if(id==='type'){typeCorrect=0;typeWrong=0;document.getElementById('type-correct').textContent=0;document.getElementById('type-wrong').textContent=0;document.getElementById('type-word').textContent='ready';document.getElementById('type-input').value='';}
  if(id==='math'){mathScore=0;mathTimer=60;document.getElementById('math-score').textContent=0;document.getElementById('math-time').textContent=60;document.getElementById('math-feedback').textContent='';document.getElementById('math-question').textContent='准备好？';clearInterval(mathInterval);}
  if(id==='rps'){document.getElementById('rps-msg').textContent='做出你的选择！';document.getElementById('rps-result-display').textContent='❓';}
  if(id==='color'){colorScore=0;document.getElementById('color-score').textContent=0;nextColor();}
  if(id==='floppy')initFloppy();
  if(id==='breakout'){breakoutRunning=false;document.getElementById('breakout-btn').textContent='开始游戏';initBreakout();}
}
function showHome(){document.getElementById('home').style.display='block';document.querySelectorAll('.game-page').forEach(function(p){p.style.display='none';});}

// ========== 猜数字 ==========
var targetNum=Math.floor(Math.random()*100)+1;
var guessCount=0;
function guessSubmit(){
  var val=parseInt(document.getElementById('guess-input').value);
  if(!val||val<1||val>100)return;
  guessCount++;
  document.getElementById('guess-count').textContent=guessCount;
  var hint=document.getElementById('guess-hint');
  if(val===targetNum){
    hint.textContent='🎉';hint.style.color='#38ef7d';
    setTimeout(function(){
      alert('恭喜！你用了 '+guessCount+' 次猜中！');
      targetNum=Math.floor(Math.random()*100)+1;
      guessCount=0;
      document.getElementById('guess-count').textContent=0;
      hint.textContent='?';hint.style.color='#fff';
      document.getElementById('guess-input').value='';
    },100);
  }else if(val<targetNum){
    hint.textContent='⬇️ 更大';hint.style.color='#feca57';
  }else{
    hint.textContent='⬆️ 更小';hint.style.color='#48dbfb';
  }
}

// ========== 记忆翻牌 ==========
var memEmojis=['🐴','🐶','🐱','🐭','🐹','🐰','🦊','🐻'];
var memCards=[],memFlipped=[],memMatched=new Set(),memMoves=0,memTimer=0,memInterval;
function initMemory(){
  clearInterval(memInterval);
  memCards=[].concat(memEmojis,memEmojis).sort(function(){return Math.random()-0.5;});
  memFlipped=[];memMatched=new Set();memMoves=0;memTimer=0;
  document.getElementById('memory-moves').textContent=0;
  document.getElementById('memory-time').textContent=0;
  memInterval=setInterval(function(){memTimer++;document.getElementById('memory-time').textContent=memTimer;},1000);
  renderMemory();
}
function renderMemory(){
  var grid=document.getElementById('memory-grid');grid.innerHTML='';
  memCards.forEach(function(emo,i){
    var card=document.createElement('div');
    var isFlipped=memFlipped.indexOf(i)>-1||memMatched.has(i);
    card.className='memory-card'+(isFlipped?' flipped':'')+(memMatched.has(i)?' matched':'');
    card.textContent=isFlipped?emo:'?';
    card.onclick=function(){flipCard(i);};
    grid.appendChild(card);
  });
}
function flipCard(i){
  if(memFlipped.length>=2||memFlipped.indexOf(i)>-1||memMatched.has(i))return;
  memFlipped.push(i);memMoves++;
  document.getElementById('memory-moves').textContent=memMoves;
  renderMemory();
  if(memFlipped.length===2){
    setTimeout(function(){
      if(memCards[memFlipped[0]]===memCards[memFlipped[1]]){
        memMatched.add(memFlipped[0]);memMatched.add(memFlipped[1]);
        if(memMatched.size>=memCards.length){
          clearInterval(memInterval);
          setTimeout(function(){alert('🎉 完成！用了 '+memMoves+' 次翻牌，'+memTimer+' 秒！');},100);
        }
      }
      memFlipped=[];renderMemory();
    },600);
  }
}

// ========== 速算 ==========
var mathScore=0,mathTimer=60,mathInterval,mathAnswer;
function nextMath(){
  var a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*20)+1;
  var op=Math.random()>0.5?'+':'-';
  if(op==='-'&&b>a){var t=a;a=b;b=t;}
  document.getElementById('math-question').textContent=a+' '+op+' '+b+' = ?';
  mathAnswer=op==='+'?a+b:a-b;
  document.getElementById('math-input').value='';
  document.getElementById('math-input').focus();
}
function startMath(){
  clearInterval(mathInterval);
  mathScore=0;mathTimer=60;
  document.getElementById('math-score').textContent=0;
  document.getElementById('math-time').textContent=60;
  nextMath();
  mathInterval=setInterval(function(){
    mathTimer--;document.getElementById('math-time').textContent=mathTimer;
    if(mathTimer<=0){
      clearInterval(mathInterval);
      document.getElementById('math-question').textContent='时间到！🎉';
      document.getElementById('math-feedback').textContent='';
      setTimeout(function(){alert('时间到！你的得分是 '+mathScore+' 分！');},100);
    }
  },1000);
}
function mathCheck(){
  var val=parseInt(document.getElementById('math-input').value);
  var fb=document.getElementById('math-feedback');
  if(val===mathAnswer){
    mathScore++;document.getElementById('math-score').textContent=mathScore;
    fb.textContent='✅ 正确';fb.style.color='#38ef7d';
  }else{
    fb.textContent='❌ 错误，答案是 '+mathAnswer;fb.style.color='#eb3349';
  }
  nextMath();
}

// ========== 打字 ==========
var typeCorrect=0,typeWrong=0;
var typeWords=['apple','banana','orange','python','javascript','function','variable','array','string','number','boolean','object','class','method','async','await','return','const','export','import','server','client','browser','window','document','element','style','background'];
var currentWord='';
function nextWord(){
  currentWord=typeWords[Math.floor(Math.random()*typeWords.length)];
  document.getElementById('type-word').textContent=currentWord;
  document.getElementById('type-input').value='';
}
function startType(){
  typeCorrect=0;typeWrong=0;
  document.getElementById('type-correct').textContent=0;document.getElementById('type-wrong').textContent=0;
  nextWord();document.getElementById('type-input').focus();
  var inp=document.getElementById('type-input');
  inp.oninput=function(){
    if(this.value===currentWord){typeCorrect++;document.getElementById('type-correct').textContent=typeCorrect;this.value='';nextWord();}
  };
}

// ========== 猜拳 ==========
var rpsYou=0,rpsComp=0;
function playRPS(you){
  var comp=Math.floor(Math.random()*3);
  var names=['✊','✌️','✋'];
  document.getElementById('rps-result-display').textContent=names[you]+' vs '+names[comp];
  var msg=document.getElementById('rps-msg');
  if(you===comp){msg.textContent='平局！';msg.className='result-text draw';}
  else if((you===0&&comp===1)||(you===1&&comp===2)||(you===2&&comp===0)){msg.textContent='你赢了！';msg.className='result-text win';rpsYou++;}
  else{msg.textContent='你输了！';msg.className='result-text lose';rpsComp++;}
  document.getElementById('rps-you').textContent=rpsYou;
  document.getElementById('rps-comp').textContent=rpsComp;
}

// ========== 井字棋 ==========
var ticBoard=Array(9).fill(''),ticTurn='X',ticYou=0,ticComp=0,ticDraw=0;
var ticWin=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function initTic(){ticBoard=Array(9).fill('');ticTurn='X';renderTic();}
function renderTic(){
  var grid=document.getElementById('tic-grid');grid.innerHTML='';
  ticBoard.forEach(function(cell,i){
    var div=document.createElement('div');div.className='tic-cell';div.textContent=cell;div.onclick=function(){ticMove(i);};grid.appendChild(div);
  });
}
function ticMove(i){
  if(ticBoard[i]||checkTicWin())return;
  ticBoard[i]=ticTurn;renderTic();
  if(checkTicWin()){setTimeout(function(){alert(ticTurn+' 胜利！');if(ticTurn==='X')ticYou++;else ticComp++;updateTic();},100);return;}
  if(ticBoard.every(function(c){return c;})){setTimeout(function(){alert('平局！');ticDraw++;updateTic();},100);return;}
  ticTurn=ticTurn==='X'?'O':'X';
  if(ticTurn==='O')setTimeout(ticAI,400);
}
function ticAI(){
  var empty=ticBoard.map(function(c,i){return c===''?i:-1;}).filter(function(i){return i>=0;});
  if(empty.length===0)return;
  ticBoard[empty[Math.floor(Math.random()*empty.length)]]='O';
  renderTic();
  if(checkTicWin()){setTimeout(function(){alert('O 胜利！');ticComp++;updateTic();},100);}
  else if(ticBoard.every(function(c){return c;})){setTimeout(function(){alert('平局！');ticDraw++;updateTic();},100);}
  else ticTurn='X';
}
function checkTicWin(){return ticWin.some(function(p){return ticBoard[p[0]]&&ticBoard[p[0]]===ticBoard[p[1]]&&ticBoard[p[1]]===ticBoard[p[2]];});}
function updateTic(){document.getElementById('tic-you').textContent=ticYou;document.getElementById('tic-comp').textContent=ticComp;document.getElementById('tic-draw').textContent=ticDraw;}

// ========== 反应力 ==========
var reactionState='idle',reactionStart=0,bestReaction=null;
function updateReactionDisplay(){
  var area=document.getElementById('reaction-area'),msg=document.getElementById('reaction-msg');
  if(reactionState==='idle'){area.className='reaction-area waiting';area.textContent='点击开始';msg.textContent='';}
  else if(reactionState==='waiting'){area.className='reaction-area waiting';area.textContent='等待...';}
  else if(reactionState==='ready'){area.className='reaction-area ready';area.textContent='立即点击！';}
}
function startReaction(){
  reactionState='waiting';updateReactionDisplay();
  var delay=Math.random()*3000+1000;
  setTimeout(function(){
    if(reactionState==='waiting'){reactionState='ready';reactionStart=Date.now();updateReactionDisplay();}
  },delay);
}
function reactionClick(){
  if(reactionState==='idle'){startReaction();}
  else if(reactionState==='ready'){
    var t=Date.now()-reactionStart;
    if(!bestReaction||t<bestReaction)bestReaction=t;
    document.getElementById('best-time').textContent=t;
    document.getElementById('reaction-msg').textContent=t+' ms';document.getElementById('reaction-msg').style.color='#48dbfb';
    reactionState='idle';updateReactionDisplay();
  }else if(reactionState==='waiting'){
    document.getElementById('reaction-msg').textContent='太早了！再试一次';document.getElementById('reaction-msg').style.color='#eb3349';
    reactionState='idle';updateReactionDisplay();
  }
}

// ========== 颜色识别 ==========
var colorScore=0;
var colorWords=[
  {text:'红色',color:'#ff0000'},{text:'绿色',color:'#00ff00'},{text:'蓝色',color:'#0000ff'},
  {text:'黄色',color:'#ffff00'},{text:'黑色',color:'#000000'},{text:'白色',color:'#ffffff'},
  {text:'粉色',color:'#ff69b4'},{text:'橙色',color:'#ff8c00'}
];
function nextColor(){
  var word=document.getElementById('color-word');
  var display=colorWords[Math.floor(Math.random()*colorWords.length)];
  var answer=colorWords[Math.floor(Math.random()*colorWords.length)];
  word.textContent=display.text;word.style.color=display.color;word.dataset.answer=answer.text;
}
function colorGuess(guess){
  var answer=document.getElementById('color-word').dataset.answer;
  var fb=document.getElementById('color-feedback');
  var guessMap={'红':'红色','绿':'绿色','蓝':'蓝色','黄':'黄色','黑':'黑色','白':'白色','粉':'粉色','橙':'橙色'};
  if(guessMap[guess]===answer){colorScore++;fb.textContent='✅ 正确';fb.style.color='#38ef7d';}
  else{fb.textContent='❌ 错误，是 '+answer;fb.style.color='#eb3349';}
  document.getElementById('color-score').textContent=colorScore;
  setTimeout(nextColor,500);
}

// ========== 打砖块 ==========
var breakoutRunning=false,breakoutInterval;
var ballX,ballY,ballDX,ballDY,paddleX,bricks=[],breakoutScore=0;
function initBreakout(){
  clearInterval(breakoutInterval);
  var area=document.getElementById('breakout-area');
  area.querySelectorAll('.brick').forEach(function(b){b.remove();});
  bricks=[];
  var colors=['#ff0000','#ff8c00','#ffff00','#00ff00','#00ffff'];
  for(var row=0;row<5;row++){
    for(var col=0;col<7;col++){
      var brick=document.createElement('div');
      brick.style.cssText='position:absolute;width:50px;height:20px;top:'+(row*25+10)+'px;left:'+(col*55+10)+'px;background:'+colors[row]+';border-radius:4px;';
      area.appendChild(brick);
      bricks.push({el:brick,x:col*55+10,y:row*25+10,w:50,h:20,alive:true});
    }
  }
  breakoutScore=0;
  document.getElementById('breakout-score').textContent=0;
  paddleX=160;ballX=194;ballY=270;ballDX=3;ballDY=-3;
  updateBall();updatePaddle();
}
function updateBall(){
  var ball=document.getElementById('breakout-ball');
  ball.style.left=ballX+'px';ball.style.top=ballY+'px';
}
function updatePaddle(){
  var paddle=document.getElementById('breakout-paddle');
  paddle.style.left=paddleX+'px';
}
function startBreakout(){
  if(breakoutRunning){
    breakoutRunning=false;clearInterval(breakoutInterval);
    document.getElementById('breakout-btn').textContent='继续';
    return;
  }
  breakoutRunning=true;document.getElementById('breakout-btn').textContent='暂停';
  if(bricks.length===0)initBreakout();
  breakoutInterval=setInterval(function(){
    if(!breakoutRunning)return;
    ballX+=ballDX;ballY+=ballDY;
    if(ballX<=0||ballX>=388)ballDX=-ballDX;
    if(ballY<=0)ballDY=-ballDY;
    if(ballY>=268&&ballY<=280&&ballX>=paddleX&&ballX<=paddleX+80)ballDY=-Math.abs(ballDY);
    bricks.forEach(function(b){
      if(!b.alive)return;
      if(ballX>=b.x&&ballX<=b.x+b.w&&ballY>=b.y&&ballY<=b.y+b.h){
        b.alive=false;b.el.style.display='none';
        ballDY=-ballDY;breakoutScore+=10;
        document.getElementById('breakout-score').textContent=breakoutScore;
      }
    });
    if(ballY>=290){
      breakoutRunning=false;clearInterval(breakoutInterval);
      setTimeout(function(){alert('游戏结束！得分: '+breakoutScore);},100);
    }
    updateBall();
  },30);
}
document.addEventListener('keydown',function(e){
  if(document.getElementById('game-breakout').style.display!=='block')return;
  if(e.key==='ArrowLeft'){paddleX=Math.max(0,paddleX-20);updatePaddle();}
  if(e.key==='ArrowRight'){paddleX=Math.min(320,paddleX+20);updatePaddle();}
});

// ========== 神经衰弱 ==========
var floppyEmojis=['🐴','🐶','🐱','🐭','🐹','🐰','🦊','🐻'];
var floppyCards=[],floppyRevealed=new Set(),floppyMatched=new Set(),floppyPairs=0,floppyPending=[];
function initFloppy(){
  floppyCards=[].concat(floppyEmojis,floppyEmojis).sort(function(){return Math.random()-0.5;});
  floppyRevealed=new Set();floppyMatched=new Set();floppyPairs=0;floppyPending=[];
  document.getElementById('floppy-pairs').textContent=0;
  renderFloppy();
}
function renderFloppy(){
  var grid=document.getElementById('floppy-grid');grid.innerHTML='';
  floppyCards.forEach(function(emo,i){
    var cell=document.createElement('div');
    var rev=floppyRevealed.has(i),mat=floppyMatched.has(i);
    cell.className='floppy-cell'+(rev?' revealed':'')+(mat?' matched':'');
    cell.textContent=(rev||mat)?emo:'?';
    cell.onclick=function(){floppyClick(i);};
    grid.appendChild(cell);
  });
}
function floppyClick(i){
  if(floppyMatched.has(i)||floppyRevealed.has(i)||floppyPending.length>=2)return;
  floppyRevealed.add(i);floppyPending.push(i);
  renderFloppy();
  if(floppyPending.length===2){
    setTimeout(function(){
      if(floppyCards[floppyPending[0]]===floppyCards[floppyPending[1]]){
        floppyMatched.add(floppyPending[0]);floppyMatched.add(floppyPending[1]);
        floppyPairs++;document.getElementById('floppy-pairs').textContent=floppyPairs;
        if(floppyPairs>=8)setTimeout(function(){alert('🎉 恭喜！你获胜了！');},100);
      }else{
        floppyRevealed.delete(floppyPending[0]);floppyRevealed.delete(floppyPending[1]);
      }
      floppyPending=[];renderFloppy();
    },700);
  }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded',function(){
  initMemory();
  initTic();
  initFloppy();
  initBreakout();
  nextColor();
  // math input enter key
  var mi=document.getElementById('math-input');
  if(mi)mi.addEventListener('keydown',function(e){if(e.key==='Enter')mathCheck();});
});
