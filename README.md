# parallel.js
Easy Concurrency using Promises and Threads



## Installation

```
<script src="https://zakerytclarke.github.io/parallel.js/thread.js"><script>
```



## Usage
Spawn a Thread
```



var test=thread(squared);

test(9).then(function(x){
  console.log(x);
});


function squared(x){
  postMessage(x*x);
}
```


Example: Make an array of all squared values from 1->100

```
var arr=[];
  for(var i=0;i<100;i++){
    arr.push(thread(squared)(i));
  }


Promise.all(arr).then(function(result){
  console.log(result);
});


function squared(x){
  postMessage(x*x);
}



```
