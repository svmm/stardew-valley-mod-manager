let e=document.createElement("style");e.innerHTML="",document.head.appendChild(e);import{errors as i}from"./util.d6d00686.js";const{INVALID:t,GONE:s,MISMATCH:n,MOD_ERR:o,SYNTAX:r,SECURITY:h,DISALLOWED:l}=i;class c{constructor(e){this.fileHandle=e,this.file=e.file,this.size=e.file.size,this.position=0}write(e){if("object"==typeof e)if("write"===e.type){if(Number.isInteger(e.position)&&e.position>=0){if(this.size<e.position)throw new DOMException(...t);this.position=e.position}if(!("data"in e))throw new DOMException(...r("write requires a data argument"));e=e.data}else{if("seek"===e.type){if(Number.isInteger(e.position)&&e.position>=0){if(this.size<e.position)throw new DOMException(...t);return void(this.position=e.position)}throw new DOMException(...r("seek requires a position argument"))}if("truncate"===e.type){if(Number.isInteger(e.size)&&e.size>=0){let i=this.file;return i=e.size<this.size?i.slice(0,e.size):new File([i,new Uint8Array(e.size-this.size)],i.name),this.size=i.size,this.position>i.size&&(this.position=i.size),void(this.file=i)}throw new DOMException(...r("truncate requires a size argument"))}}e=new Blob([e]);let i=this.file;const s=i.slice(0,this.position),n=i.slice(this.position+e.size);let o=this.position-s.size;o<0&&(o=0),i=new File([s,new Uint8Array(o),e,n],i.name),this.size=i.size,this.position+=e.size,this.file=i}close(){if(this.fileHandle.deleted)throw new DOMException(...s);this.fileHandle.file=this.file,this.file=this.position=this.size=null,this.fileHandle.onclose&&this.fileHandle.onclose(this.fileHandle)}}class a{constructor(e,i,t=!0){this.file=i||new File([],e),this.name=e,this.kind="file",this.deleted=!1,this.writable=t,this.readable=!0}getFile(){if(this.deleted)throw new DOMException(...s);return this.file}createWritable(e){if(!this.writable)throw new DOMException(...l);if(this.deleted)throw new DOMException(...s);return new c(this)}destroy(){this.deleted=!0,this.file=null}}class d{constructor(e,i=!0){this.name=e,this.kind="directory",this.deleted=!1,this.entries={},this.writable=i,this.readable=!0}async*getEntries(){if(this.deleted)throw new DOMException(...s);yield*Object.values(this.entries)}getDirectoryHandle(e,i={}){if(this.deleted)throw new DOMException(...s);const t=this.entries[e];if(t){if(t instanceof a)throw new DOMException(...n);return t}if(i.create)return this.entries[e]=new d(e);throw new DOMException(...s)}getFileHandle(e,i={}){const t=this.entries[e],o=t instanceof a;if(t&&o)return t;if(t&&!o)throw new DOMException(...n);if(!t&&!i.create)throw new DOMException(...s);return!t&&i.create?this.entries[e]=new a(e):void 0}removeEntry(e,i){const t=this.entries[e];if(!t)throw new DOMException(...s);t.destroy(i.recursive),delete this.entries[e]}destroy(e){for(let i of Object.values(this.entries)){if(!e)throw new DOMException(...o);i.destroy(e)}this.entries={},this.deleted=!0}}const f=new d("");export default e=>f;export{a as FileHandle,d as FolderHandle,c as Sink};
