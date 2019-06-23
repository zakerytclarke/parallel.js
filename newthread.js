var parallel=new Parallel();
function Parallel(){
  var threadpool={};


  this.thread=function(fn){
    var hash=hashCode(fn.toString());
    if(threadpool[hash]!=null){//Thread already exists
      for(var i=0;i<threadpool[hash].length;i++){
        if(threadpool[hash][i].busy==false){
          return function(args){
            return new Promise(function(resolve){
              threadpool[hash][0].worker.postMessage(args);//Send Message to Worker
              threadpool[hash][0].worker.onmessage=function(event){//Received Message from worker
                resolve(event.data);
                threadpool[hash][0].busy=false;
              };
            });
          }
        }
      }
      //All threads busy, make a new thread
      threadpool[hash].push({worker:makeWorker(fn),busy:true});
      return function(args){
        return new Promise(function(resolve){
          threadpool[hash][threadpool[hash].length-1].worker.postMessage(args);//Send Message to Worker
          threadpool[hash][threadpool[hash].length-1].worker.onmessage=function(event){//Received Message from worker
            resolve(event.data);
            threadpool[hash][threadpool[hash].length-1].busy=false;
          };
        });
      }
    }else{//Thread doesn't exist
    //Make new Thread
    threadpool[hash]=[];
    threadpool[hash].push({worker:makeWorker(fn),busy:true});
    return function (args){
      return new Promise(function(resolve){
        threadpool[hash][0].worker.postMessage(args);//Send Message to Worker
        threadpool[hash][0].worker.onmessage=function(event){//Received Message from worker
          resolve(event.data);
          threadpool[hash][0].busy=false;
        };
      });
    }
  }
}

function makeWorker(fn){
  var blobURL=URL.createObjectURL(new Blob(['(',
  function(){
    this.func=fn;
    this.onmessage=function(e) {
      console.log('Message received from main script');
      var args=e.data;
      postMessage(this.func(args));
    }
  }.toString(),
  ')()'],{type:'application/javascript'}));
  //URL.revokeObjectURL(blobURL);
  return new Worker(blobURL);
}

//https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hashCode(str){
  console.log(str);
  var hash=0;
  if(str.length==0){
    return hash;
  }
  for(var i=0;i<str.length;i++){
    var char=str.charCodeAt(i);
    hash=((hash<<5)-hash)+char;
    hash=hash&hash; // Convert to 32bit integer
  }
  return hash;
}
}


function thread(fn){
  return function(args){
    return new Promise(function(resolve){
      //console.log(returnToPostMessage('('+fn+')('+JSON.stringify(args)+')'));
      //var worker=new Worker(URL.createObjectURL(new Blob([returnToPostMessage('('+fn+')('+JSON.stringify(args)+')')])));
      var worker=new Worker(URL.createObjectURL(new Blob(['('+fn+')('+JSON.stringify(args)+')'])));
      worker.postMessage(args)
      worker.onmessage = function(event){
        resolve(event.data);
        worker.terminate();
      };
    });
  }
  /*
  function returnToPostMessage(orig,str){
  if(str==null){
  str=orig;
}

var i=str.indexOf("return");
if(i==-1){
return str;
}

//Check if nested function

//Count {} height before statement

var out=str.substring(0,i);
str=str.substring(i);
var ni=str.indexOf(";");
out+="postMessage("+str.substring(7,ni)+");"+str.substring(ni+1);
out=returnToPostMessage(orig,out);
return out;
}

*/
}
