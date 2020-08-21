var sw=20,//小方块的宽度
    sh=20,//高
    tr=30,//行
    th=30;//列

var snake=null,
    food=null,
    game=null;
// 方块的构造函数
function Square(x,y,className){
    this.x=x*sw;
    this.y=y*sh;
    this.class=className;

    this.viewContent=document.createElement('div');	//方块对应的DOM元素
    this.viewContent.className=this.class;
    this.parent=document.getElementById('snakeWrap');//方块的父级

}
Square.prototype.create=function () {
    this.viewContent.style.position='absolute';
    this.viewContent.style.width=sw+'px';
    this.viewContent.style.height=sh+'px';
    this.viewContent.style.left=this.x+'px';
    this.viewContent.style.top=this.y+'px';
    this.parent.appendChild(this.viewContent);


};

Square.prototype.remove=function () {
    this.parent.removeChild(this.viewContent);
};

// 蛇构造函数
function Snake() {
    this.head=null;
    this.tail=null;
    this.pos=[];
    this.direction=null;
    this.directionNum={
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        done:{
            x:0,
            y:1,
            rotate:90
        },
    };


}
Snake.prototype.init=function () {
    // 初始化蛇的头部
    var snakeHead = new Square(2, 0, "snakeHead");
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);
    // 初始化蛇的身体1
    var snakeBody1 = new Square(1, 0, "snakeBody");
    snakeBody1.create();
    this.pos.push([1, 0]);
// 初始化蛇的身体2
    var snakeBody2 = new Square(0, 0, "snakeBody");
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);

    // 链表化
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 默认走向
    this.direction = this.directionNum.right;
}
// 给蛇的原型又添加一个静态方法对于蛇头的下一个元素的应对策略
Snake.prototype.getNextPos=function () {
    var nextPos=[
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y]
    var selfCollied=false;
    this.pos.forEach(function (value) {
        // console.log(value)
        if(value[0]==nextPos[0] && value[1]==nextPos[1]){
            selfCollied=true;
        }
    })
    if (selfCollied){
        this.strategies.die.call(this);
        return;
    }
    if (nextPos[0]<0||nextPos[1]<0||nextPos[0]>tr-1||nextPos[1]>th-1){
        this.strategies.die.call(this);
        return;
    }
    if (food&&food.pos[0]==nextPos[0]&&food.pos[1]==nextPos[1]){
        // console.log('撞到食物了！');
        this.strategies.eat.call(this);
        return;
    }
    this.strategies.move.call(this);

}
// 移动处理
Snake.prototype.strategies={
    move:function(format){
        var newBody=new Square(this.head.x/sw,this.head.y/sh,"snakeBody");//添加新身体

        newBody.create();
        newBody.last=null;
        newBody.next=this.head.next;
        this.head.next.last=newBody;

        this.head.remove();//移除旧head
        var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,"snakeHead");//添加新身体
        newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';
        newHead.create();
        newBody.last=newHead;
        newHead.last=null;
        newHead.next=newBody;
        // 更新变量
       this.head=newHead;
       this.pos.splice(0,0,[this.head.x/sw,this.head.y/sh]);
       if (!format){
           this.tail=this.tail.last;
           this.tail.next.remove();
           this.tail.next=null;
           this.pos.pop();
       }



    },
    eat:function(){
        this.strategies.move.call(this,true);
        createFood();
        game.score++;
    },
    die:function () {
        game.over();
    }
}

// 食物函数
function createFood() {
    var x=null,
        y=null;
    var include=true;
    while (include){
        x=Math.round(Math.random()*(tr-1));
        y=Math.round(Math.random()*(th-1));
        snake.pos.forEach(function (value) {
            if(!(value[0]==x && value[1]==y)){
               include=false;
            }
        })
    }
    food=new Square(x,y,"food");
    food.pos=[x,y];
    var foodDom=document.querySelector('.food');
    if(foodDom){
        foodDom.style.left=x*sw+'px';
        foodDom.style.top=y*sh+'px';
    }else{
        food.create();

    }
}
// 游戏构造函数
function Game(){
    startButton.style.display="block";
    this.score=0;
    snake=new Snake();
}
Game.prototype.init=function(){

    snake.init();
    createFood();

    document.onkeydown=function(ev){
        if (ev.which==37&&snake.direction!=snake.directionNum.right){
            snake.direction=snake.directionNum.left;
        }
        if (ev.which==38 && snake.direction!=snake.directionNum.done){
            snake.direction=snake.directionNum.up;
        }
        if (ev.which==39 && snake.direction!=snake.directionNum.left){
            snake.direction=snake.directionNum.right;

        }
        if (ev.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction=snake.directionNum.done;
        }
        // snake.getNextPos();

    }
    this.start();

};
Game.prototype.start=function(){
    this.timer=setInterval(function () {
        snake.getNextPos();
    },200);
};
Game.prototype.pause=function(){
    clearInterval(this.timer);

};

// 游戏结束
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert("游戏over，你的得分是："+game.score);

    snakeWrap.innerHTML="";
    game=new Game();


};
// 开启游戏
var startButton=document.querySelector('.start button');
startButton.onclick=function (){
    game=new Game();
    game.init();
    startButton.style.display="none";
}
// 暂停游戏
var snakeWrap=document.getElementById('snakeWrap');
var pauseBtn=document.querySelector('.pose button');
snakeWrap.onclick=function(){
    game.pause();
    pauseBtn.parentNode.style.display='block';
}
// 游戏继续
pauseBtn.onclick=function () {
    game.start();
    pauseBtn.parentNode.style.display='none';
}