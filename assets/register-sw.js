(function(){
  if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
  var me=document.currentScript&&document.currentScript.src;if(!me)return;
  var root=new URL('../',me).href;
  navigator.serviceWorker.register(root+'sw.js',{scope:root}).catch(function(){});
})();
