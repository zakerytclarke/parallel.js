var parallel=new Parallel();

function Parallel(){
  this.maxThreads=navigator.hardwareConcurrency||4;//Optimal Number of Workers for a given machine
  var threadcount=0;
  var threadQueue=[];

  var threadpool={};

  this.thread=function(fn){
    var stringy=fn.toString();
    if(threadpool[stringy]!=null){//Function already on thread
      for(var i=0;i<threadpool[stringy].length;i++){
        if(threadpool[stringy][i].busy==false){
          //Use available thread
          var current=threadpool[stringy][i];
          return function(args){
            return new Promise(function(resolve){
              current.worker.onmessage=function(e){
                if(e.data=="Parallel: Thread Activated"){
                  //console.log(e.data);
                }else{
                  current.busy=false;
                  resolve(e.data);
                }
              }
              current.worker.postMessage(args);
            });
          }
        }
      }
      //No threads available, make new thread
      threadpool[stringy]=[];
      threadpool[stringy].push({worker:makeWorker(),busy:true});
      threadcount++;
      current=threadpool[stringy][threadpool[stringy].length-1];
      current.worker.postMessage(stringy);
      return function(args){
        return new Promise(function(resolve){
          current.worker.onmessage=function(e){
            if(e.data=="Parallel: Thread Activated"){
              //console.log(e.data);
            }else{
              current.busy=false;
              resolve(e.data);
            }
          }
          current.worker.postMessage(args);
        });
      }

    }else{//Make new Thread
      threadpool[stringy]=[];
      threadpool[stringy].push({worker:makeWorker(),busy:true});
      threadcount++;
      current=threadpool[stringy][0];
      current.worker.postMessage(stringy);
      return function(args){
        return new Promise(function(resolve){
          current.worker.onmessage=function(e){
            if(e.data=="Parallel: Thread Activated"){
              //console.log(e.data);
            }else{
              current.busy=false;
              resolve(e.data);
            }
          }
          current.worker.postMessage(args);
        });
      }

    }



  }
  /**
   * Free up resources by removing all workers associated
   * with a specific function
   */
  this.delete=function(fn){
    for(var i=0;i<threadpool[fn].length;i++){
      threadpool[fn][i].worker.terminate();
    }
    delete threadpool[fn];
  }

  this.kill=function(){
    for(var key in threadpool){
      this.delete(key)
    }
  }


  function makeWorker(){
    var blobURL=URL.createObjectURL(new Blob(['(',
    function(){
      var fn=null;
      this.onmessage=function(e) {
        if(fn==null){
          fn=eval("(function(){ return "+e.data+"})()");//Extract Function
          postMessage("Parallel: Thread Activated");
        }else{
          postMessage(fn(e.data));
        }
      }
    }.toString(),
    ')()'],{type:'application/javascript'}));
    return new Worker(blobURL);
  }

}
