function thread(fn){
  return function(args){
    return new Promise(function(resolve) {
        //console.log(returnToPostMessage('('+fn+')('+JSON.stringify(args)+')'));
        var worker=new Worker(URL.createObjectURL(new Blob([returnToPostMessage('('+fn+')('+JSON.stringify(args)+')')])));
        worker.postMessage(args)
        worker.onmessage = function(event){
            resolve(event.data);
        };
    });
  }

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

}
