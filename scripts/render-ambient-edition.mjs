import {chromium} from 'playwright';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,rename,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chapters,plateName} from '../dist/chapters.js';

const run=promisify(execFile);
const [lang,...requested]=process.argv.slice(2);
if(!['en','es'].includes(lang) || !requested.length || requested.some(id=>!chapters.some(c=>c.id===id))){
  throw Error('Usage: node scripts/render-ambient-edition.mjs en|es <chapter-id> [chapter-id ...]');
}
const origin=new URL(process.env.BOOK_PREVIEW_URL || 'http://127.0.0.1:8000/');
if(!['localhost','127.0.0.1','[::1]'].includes(origin.hostname))throw Error('Start the local preview server first.');
const art=fileURLToPath(new URL('../dist/'+(lang==='es'?'es/':'')+'art/',import.meta.url));
const imports=lang==='es'?{'/edition.js':'/es/edition.js','/assets.js':'/es/assets.js'}:{};
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({deviceScaleFactor:1,reducedMotion:'no-preference'});
  await page.route('**/print-studio',route=>route.fulfill({contentType:'text/html',body:
    '<style>*{margin:0}canvas{display:block;width:100vw;height:100vh}</style>'+
    '<script type="importmap">'+JSON.stringify({imports})+'</script><canvas></canvas>'+
    '<script type="module">import {createWorld} from "/world.js";window.book=await createWorld(document.querySelector("canvas"),{});book.pause(true);</script>'}));
  await page.goto(new URL('print-studio',origin).href);
  await page.waitForFunction(()=>window.book!==undefined);
  async function size(width,height){
    await page.setViewportSize({width,height});
    await page.waitForFunction(w=>document.querySelector('canvas').width===w,width);
  }
  async function capture(index,seconds,options,file){
    const data=await page.evaluate(([index,seconds,options])=>{
      window.book.renderPlate(index,seconds,options);
      return document.querySelector('canvas').toDataURL().split(',')[1];
    },[index,seconds,options]);
    await writeFile(file,Buffer.from(data,'base64'));
  }
  for(const id of requested){
    const index=chapters.findIndex(c=>c.id===id);
    const temp=await mkdtemp(join(tmpdir(),'salsa-frames-'));
    const outfile=join(art,'ambient-'+id+'.avif'),partial=outfile+'.'+randomUUID()+'.avif';
    try{
      if(id==='los-angeles'){
        await size(1400,788);
        const still=join(temp,'still.png');
        await capture(index,0,{strength:0},still);
        const poster=join(art,plateName(id)),pending=poster+'.'+randomUUID()+'.webp';
        try{
          await run('cwebp',['-quiet','-q','88',still,'-o',pending]);
          await rename(pending,poster);
        }finally{await rm(pending,{force:true});}
      }
      const pilot=index<2, seconds=['landfall','son'].includes(id)?16:8;
      await size(pilot?1152:1024,pilot?648:576);
      const frames=[];
      for(let i=0;i<seconds*12.5;i++){
        const file=join(temp,String(i).padStart(3,'0')+'.png');
        await capture(index,i*.08,{zoom:pilot?1:.9},file);frames.push(file);
      }
      await run('avifenc',['-j','2','-s','8','-q',id==='taino'?'68':'63','--qalpha',pilot?'76':'72','-y','420',
        '--timescale','1000','--duration','80','--repetition-count','infinite',...frames,partial]);
      await rename(partial,outfile);
      console.log(lang,id);
    }finally{await rm(temp,{recursive:true,force:true});await rm(partial,{force:true});}
  }
}finally{await browser.close();}
