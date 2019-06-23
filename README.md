# threadpool.js
Easy Concurrency using Promises and Threads

Library Size <2 kB

## Installation

```
<script src="https://zakerytclarke.github.io/threadpool.js/index.js"><script>
```

## Usage
Spawn a Thread
```
var threadpool=new ThreadPool();


var test=threadpool.addTask(fib,35)

test.then(function(x){
  console.log(x)
});

function fib(n){
  if(n<=1){
    return 1;
  }
  return fib(n-1)+fib(n-2);
}
```

Evaluate all Squares

```
var threadpool=new ThreadPool();
var n=1000;

var arr=[];
for(var i=0;i<n;i++){
  arr.push(threadpool.addTask(squared,i));
}


Promise.all(arr).then(function(result){
  console.log(result);
});

function squared(x){
  return x*x;
}
```



## Performance

Threadpool.js uses the right amount of threads in the most efficient way to guarantee optimal performance on any machine. Below is a time Comparison between a single-threaded evaluation of the fibonacci sequence.

<iframe height="265" style="width: 100%;" scrolling="no" title="Threadpool.js" src="//codepen.io/zakerytclarke/embed/MMmOKO/?height=265&theme-id=0&default-tab=js,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/zakerytclarke/pen/MMmOKO/'>Threadpool.js</a> by Zakery Clarke
  (<a href='https://codepen.io/zakerytclarke'>@zakerytclarke</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
