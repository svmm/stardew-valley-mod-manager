let e=document.createElement("style");e.innerHTML="",document.head.appendChild(e);import{errors as i}from"./util.d6d00686.js";const{DISALLOWED:t}=i;class r{constructor(e,i){this.writer=e,this.someklass=i}write(e){if("object"==typeof e)if("write"===e.type){if(Number.isInteger(e.position)&&e.position>=0&&(this.writer.seek(e.position),this.writer.position!==e.position))throw new DOMException("seeking position failed","InvalidStateError");if(!("data"in e))throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. write requires a data argument","SyntaxError");e=e.data}else{if("seek"===e.type){if(Number.isInteger(e.position)&&e.position>=0){if(this.writer.seek(e.position),this.writer.position!==e.position)throw new DOMException("seeking position failed","InvalidStateError");return}throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. seek requires a position argument","SyntaxError")}if("truncate"===e.type)return new Promise(i=>{if(!(Number.isInteger(e.size)&&e.size>=0))throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. truncate requires a size argument","SyntaxError");this.writer.onwriteend=e=>i(),this.writer.truncate(e.size)})}return new Promise((i,t)=>{this.writer.onwriteend=e=>i(),this.writer.write(new Blob([e]))})}close(){return new Promise((e,i)=>{this.someklass.file(e,i)})}}class n{constructor(e,i=!0){this.file=e,this.kind="file",this.writable=i,this.readable=!0}get name(){return this.file.name}getFile(){return new Promise((e,i)=>this.file.file(e,i))}createWritable(e){if(!this.writable)throw new DOMException(...t);return new Promise((i,t)=>this.file.createWriter(t=>{!1===e.keepExistingData?(t.onwriteend=e=>i(new r(t,this.file)),t.truncate(0)):i(new r(t,this.file))},t))}}class s{constructor(e,i=!0){this.dir=e,this.writable=i,this.readable=!0,this.kind="directory",this.name=e.name}async*getEntries(){const e=await new Promise((e,i)=>this.dir.createReader().readEntries(e,i));for(let i of e)yield i.isFile?new n(i,this.writable):new s(i,this.writable)}getDirectoryHandle(e,i={}){return new Promise((t,r)=>{this.dir.getDirectory(e,i,e=>{t(new s(e))},r)})}getFileHandle(e,i={}){return new Promise((t,r)=>this.dir.getFile(e,i,e=>t(new n(e)),r))}removeEntry(e,i){return new Promise(async(t,r)=>{const n=await this.getDirectoryHandle(e).catch(i=>"TypeMismatchError"===i.name?this.getFileHandle(e):i);n instanceof Error&&r(n),"directory"===n.kind?i.recursive?n.dir.removeRecursively(t,r):n.dir.remove(t,r):n.file&&n.file.remove(t,r)})}}export default(e={})=>new Promise((i,t)=>globalThis.webkitRequestFileSystem(!!e._persistent,0,e=>i(new s(e.root)),t));export{n as FileHandle,s as FolderHandle};
