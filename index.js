function ThreadPool(){
  this.maxThreads=navigator.hardwareConcurrency||4;//Optimal Number of Workers for a given machine
  var threadpool=[];

  for(var i=0;i<this.maxThreads;i++){
    threadpool.push(makeWorker());
    threadpool[i].postMessage("Parallel: Start");
  }

  for(var i=0;i<threadpool.length;i++){
    var current=threadpool[i];
    current.onmessage=function(e){
      if(e.data!="ParallelThread: Started"){
        results[e.data.id]=e.data.value;
      }
      setTimeout(check,0);
      function check(){
        if(tasks.length>=1){
          current.postMessage(tasks.pop());
        }else{
          setTimeout(check,50);
        }
      }
    }
  }

  var tasks=[];
  var results={
  };

  this.addTask=function(fn,args){
    tasks.push({func:fn.toString(),args:args,id:new Date()});
    return new Promise(function(resolve){
        var index=tasks[tasks.length-1].id;
        setTimeout(check,0);
        function check(){
          if(results[index]!=null){
            resolve(results[index]);
          }else{
            setTimeout(check,50);
          }
        }

      });
  }

  this.kill=function(){
      for(var i=0;i<threadpool.length;i++){
        threadpool[i].terminate();
      }
  }



  function makeWorker(){
    var blobURL=URL.createObjectURL(new Blob(['(',
    function(){
      var fn=null;
      this.onmessage=function(e) {
        if(e.data!="Parallel: Start"){
          fn=eval("(function(){ return "+e.data.func+"})()");//Extract Function
          postMessage({id:e.data.id,value:fn(e.data.args)});

        }else{
          postMessage("ParallelThread: Started");
        }
      }
    }.toString(),
    ')()'],{type:'application/javascript'}));
    return new Worker(blobURL);
  }

}
