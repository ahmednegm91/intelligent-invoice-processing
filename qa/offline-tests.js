/**
 * Offline checks of the PUBLIC n8n JSON exports.
 * No API calls. This is NOT a runtime test of n8n or model accuracy.
 * Run: node qa/offline-tests.js
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const readJSON = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const main = readJSON('workflows/main-workflow.json');
const engine = readJSON('workflows/ai-extraction-engine.json');
const node = (data, name) => {
  const n = data.nodes.find(x => x.name === name);
  assert.ok(n, `missing node ${name}`);
  return n;
};
let passed = 0;
let failed = 0;
function test(title, fn) {
  try { fn(); passed++; console.log(`PASS ${title}`); }
  catch (err) { failed++; console.error(`FAIL ${title}\n  ${err.stack || err}`); }
}
function invokeCode(data, nodeName, json = {}, extras = {}) {
  const code = node(data, nodeName).parameters.jsCode;
  assert.ok(code, `No JS in ${nodeName}`);
  const context = { $json: json, ...extras };
  return vm.runInNewContext(`(function(){ ${code}\n })()`, context, {timeout:1000});
}
function fixture({items,subtotal,tax,total,supplier_name='Atlas Office Supplies',invoice_number='INV-2026-1042',currency='EGP'}) {
  return {items,subtotal,tax,total,supplier_name,invoice_number,currency,invoice_date:'2026-11-15'};
}
const valid01=fixture({
  items:[
    {description:'A4 Printer Paper / ورق طباعة',quantity:10,unit_price:185,line_total:1850},
    {description:'Black Toner / حبر أسود',quantity:2,unit_price:1450,line_total:2900},
    {description:'Notebook Set',quantity:5,unit_price:240,line_total:1200},
    {description:'Desk Organizer',quantity:3,unit_price:350,line_total:1050}
  ],subtotal:7000,tax:980,total:7980
});
const valid02=fixture({
  items:[
    {description:'فلاتر تكييف',quantity:6,unit_price:420,line_total:2520},
    {description:'لمبات LED',quantity:12,unit_price:95,line_total:1140},
    {description:'مفاتيح كهربائية',quantity:8,unit_price:75,line_total:600},
    {description:'شريط عزل كهربائي',quantity:10,unit_price:30,line_total:300}
  ],subtotal:4560,tax:638.4,total:5198.4,supplier_name:'شركة الرواد للتوريدات الفنية',invoice_number:'AR-2026-205'
});
const mismatch03=fixture({
  items:[
    {description:'Water Pump / مضخة مياه',quantity:1,unit_price:2850,line_total:2850},
    {description:'Pressure Gauge',quantity:2,unit_price:360,line_total:720},
    {description:'Seal Kit',quantity:3,unit_price:125,line_total:375}
  ],subtotal:3945,tax:552.3,total:4507.3,supplier_name:'Harbor Tech Services',invoice_number:'MIX-2026-309'
});
function validateFile(file) {
  const conditions=node(main,'ValidateFileType').parameters.conditions.conditions;
  return conditions.every(c=> {
    const expression=c.leftValue;
    assert.match(expression,/^=\{\{[\s\S]*\}\}$/);
    const inner=expression.slice(3,-2).trim();
    const result=vm.runInNewContext(`(function($binary){return (${inner});})`,{}, {timeout:1000})({invoice_file:file});
    return result===true;
  });
}
function fileMeta(fileName,mimeType,bytes){return {fileName,mimeType,bytes};}

test('workflow JSON parses and nodes have unique names and IDs', () => {
  for (const d of [main,engine]) {
    assert.equal(new Set(d.nodes.map(x=>x.name)).size,d.nodes.length);
    assert.equal(new Set(d.nodes.map(x=>x.id)).size,d.nodes.length);
    assert.equal(d.active,false);
    assert.equal(d.pinData && Object.keys(d.pinData).length,0);
  }
  assert.equal(main.nodes.length,19);assert.equal(engine.nodes.length,14);
});
test('all outgoing graph edges refer to existing nodes',()=>{
  for(const d of [main,engine]){
    const names=new Set(d.nodes.map(n=>n.name));
    for (const [name,types] of Object.entries(d.connections)) {
      assert.ok(names.has(name),`${name} is not a declared node`);
      for(const outputs of Object.values(types))for(const branch of outputs)for(const edge of branch)
        assert.ok(names.has(edge.node),`${name}->${edge.node} broken`);
    }
  }
});
test('core graph routes PDF/images/AI failures to expected nodes',()=>{
  assert.equal(engine.connections.IsPDF.main[0][0].node,'PrimaryAI');
  assert.equal(engine.connections.IsPDF.main[1][0].node,'PrimaryImageAI');
  assert.equal(engine.connections.PrimaryAI.main[1][0].node,'RestoreInvoiceBinary');
  assert.equal(engine.connections.PrimaryImageAI.main[1][0].node,'RestoreImageBinary');
  assert.equal(main.connections.CallInvoiceAI.main[0][0].node,'ValidateFinancials');
  assert.equal(main.connections.CallInvoiceAI.main[1][0].node,'AIProcessingFailed');
  assert.equal(main.connections.SavePendingInvoice.main[0][0].node,'ShowInvoiceResult');
});
test('exports omit user credential objects, instance metadata and old selection IDs',()=>{
  for(const d of [main,engine]){
    assert.equal('id' in d,false);assert.equal('versionId' in d,false);assert.equal('meta' in d,false);
    assert.equal('staticData' in d,false);
    for(const n of d.nodes){
      assert.equal('credentials' in n,false,`${n.name} exported credential reference`);
      for(const k of ['workflowId','dataTableId']){
        const locator=n.parameters?.[k];
        if(locator){assert.equal(locator.value,'');assert.equal('cachedResultUrl' in locator,false);}
      }
    }
  }
});
test('source file references are left unbound for import',()=>{
  assert.equal(node(main,'CallInvoiceAI').parameters.workflowId.value,'');
  for(const n of ['CheckNewInvoice','SavePendingInvoice']){
    assert.equal(node(main,n).parameters.dataTableId.value,'');
  }
});
test('all four AI nodes have the correct binary field',()=>{
  for(const name of ['PrimaryAI','BackupAI','PrimaryImageAI','BackupImageAI']){
    const n=node(engine,name);
    assert.equal(n.parameters.inputType,'binary',name);
    assert.equal(n.parameters.binaryPropertyName,'invoice_file',name);
    assert.match(n.parameters.modelId.value,/^models\/gemini-/);
    assert.ok(n.parameters.text.includes('Arabic and English'));
  }
});
test('PDF/JPG/JPEG/PNG allowed at 10MiB or less',()=>{
  for(const [name,mime] of [['test.pdf','application/pdf'],['TEST.JPG','image/jpeg'],['photo.jpeg','image/jpeg'],['scan.png','image/png']]){
    assert.equal(validateFile(fileMeta(name,mime,10*1024*1024)),true,name);
  }
});
test('oversized PDF and zero-sized PDF rejected',()=>{
  assert.equal(validateFile(fileMeta('test.pdf','application/pdf',10*1024*1024+1)),false);
  assert.equal(validateFile(fileMeta('test.pdf','application/pdf',0)),false);
});
test('unsupported extension and unsupported claimed MIME rejected',()=>{
  assert.equal(validateFile(fileMeta('test.txt','text/plain',100)),false);
  assert.equal(validateFile(fileMeta('test.exe','application/pdf',100)),false);
});
test('MIME/extension mismatch is rejected (regression case)',()=>{
  assert.equal(validateFile(fileMeta('test.jpg','application/pdf',100)),false);
  assert.equal(validateFile(fileMeta('test.pdf','image/png',100)),false);
});
test('unknown file size and no file rejected',()=>{
  assert.equal(validateFile(fileMeta('test.pdf','application/pdf',undefined)),false);
  assert.equal(validateFile(undefined),false);
});
test('file handler runs once per item and diagnoses invalid extension',()=>{
  assert.equal(node(main,'HandleInvalidFile').parameters.mode,'runOnceForEachItem');
  let out=invokeCode(main,'HandleInvalidFile',{},{$input:{item:{binary:{invoice_file:fileMeta('x.txt','text/plain',100)}}}});
  assert.equal(out.json.error_code,'UNSUPPORTED_FORMAT');
});
test('file handler diagnoses oversized file and absent file',()=>{
  let out=invokeCode(main,'HandleInvalidFile',{},{$input:{item:{binary:{invoice_file:fileMeta('big.pdf','application/pdf',10*1024*1024+1)}}}});
  assert.equal(out.json.error_code,'FILE_TOO_LARGE');
  out=invokeCode(main,'HandleInvalidFile',{},{$input:{item:{binary:{}}}});
  assert.equal(out.json.error_code,'FILE_MISSING');
});
test('financial validation: Invoice 01 passes with exact 7000 subtotal',()=>{
  const v=invokeCode(main,'ValidateFinancials',valid01).json.validation;
  assert.equal(v.status,'passed');assert.equal(v.calculated_subtotal,7000);assert.equal(v.calculated_total,7980);
});
test('financial validation: Arabic invoice 02 passes',()=>{
  const v=invokeCode(main,'ValidateFinancials',valid02).json.validation;
  assert.equal(v.status,'passed');assert.equal(v.calculated_total,5198.4);
});
test('financial validation: invoice 03 flags incorrect printed grand total',()=>{
  const v=invokeCode(main,'ValidateFinancials',mismatch03).json.validation;
  assert.equal(v.status,'needs_review');assert.equal(v.calculated_total,4497.3);
  assert.ok(Array.from(v.issues).includes('Total mismatch'));
});
test('financial validation: line-price mismatch triggers review',()=>{
  const bad=JSON.parse(JSON.stringify(valid01));bad.items[0].line_total=1851;
  const v=invokeCode(main,'ValidateFinancials',bad).json.validation;
  assert.equal(v.status,'needs_review');assert.ok(Array.from(v.issues).some(x=>x.includes('Item 1 total mismatch')));
});
test('financial validation: missing numeric fields trigger review',()=>{
  const bad=JSON.parse(JSON.stringify(valid01));bad.items[1].unit_price=null;
  const v=invokeCode(main,'ValidateFinancials',bad).json.validation;
  assert.equal(v.status,'needs_review');assert.ok(Array.from(v.issues).some(x=>x.includes('missing value')));
});
test('financial validation: missing items not silently passed',()=>{
  const bad={...valid01,items:[]};
  const v=invokeCode(main,'ValidateFinancials',bad).json.validation;
  assert.equal(v.status,'needs_review');assert.equal(v.calculated_subtotal,null);
});
test('key generation normalizes supplier whitespace and invoice number',()=>{
  const out=invokeCode(main,'CreateInvoiceKey',{supplier_name:'   Atlas    OFFICE  Supplies  ',invoice_number:' inv- 2026-1042 '});
  assert.equal(out.json.invoice_key,'atlas office supplies|INV-2026-1042');
});
test('key generation preserves Arabic supplier and rejects missing identity',()=>{
  assert.equal(invokeCode(main,'CreateInvoiceKey',{supplier_name:'شركة الرواد',invoice_number:'ar-2026-205'}).json.invoice_key,'شركة الرواد|AR-2026-205');
  assert.equal(invokeCode(main,'CreateInvoiceKey',{supplier_name:'',invoice_number:'INV-5'}).json.invoice_key,null);
});
test('all four parsers accept model JSON text and reject malformed JSON',()=>{
  for(const name of ['ParseInvoiceJSON','ParseBackupInvoiceJSON','ParseImageInvoiceJSON','ParseBackupImageJSON']){
    const answer={content:{parts:[{text:JSON.stringify(valid01)}]}};
    assert.equal(invokeCode(engine,name,answer).json.total,7980);
    assert.throws(()=>invokeCode(engine,name,{content:{parts:[{text:'not json'}]}}),/Invalid AI JSON/);
    assert.throws(()=>invokeCode(engine,name,{content:{parts:[]}}),/AI returned no invoice data/);
  }
});
test('both restore nodes use InvoiceInput binary data',()=>{
  for(const name of ['RestoreInvoiceBinary','RestoreImageBinary']){
    const binary={invoice_file:fileMeta('x.pdf','application/pdf',120)};
    const out=invokeCode(engine,name,{},{$:()=>({first:()=>({json:{foo:3},binary})})});
    assert.equal(out.binary.invoice_file.fileName,'x.pdf');
    assert.equal(out.json.ai_fallback_used,true);
  }
});
test('sample PDFs and all screenshots are present',()=>{
  for(const rel of [
    'samples/Invoice_01_English_Bilingual_Valid.pdf',
    'samples/Invoice_02_Arabic_Bilingual_Valid.pdf',
    'samples/Invoice_03_Mixed_Validation_Error.pdf',
    'screenshots/ai-engine.PNG','screenshots/main-workflow.PNG',
    'screenshots/financial-error.PNG','screenshots/duplicate-detection.PNG',
    'screenshots/successful-processing.PNG','screenshots/APIProcessFailed.PNG']){
      const f=path.join(ROOT,rel);
      assert.ok(fs.statSync(f).size>2000,`${rel} too small`);
      if(rel.endsWith('.pdf'))assert.equal(fs.readFileSync(f).subarray(0,4).toString(),'%PDF');
  }
});
test('local relative Markdown references point to existing files',()=>{
  const files=[];
  function scan(folder){for(const ent of fs.readdirSync(folder,{withFileTypes:true})){
    const full=path.join(folder,ent.name);
    if(ent.isDirectory())scan(full);else if(ent.name.endsWith('.md'))files.push(full);
  }}
  scan(ROOT);
  for(const f of files){
    const s=fs.readFileSync(f,'utf8');
    const link=/\]\(([^)]+)\)/g;let match;
    while((match=link.exec(s))!==null){
      const rel=match[1].split('#')[0].split('?')[0];
      if(!rel||rel.includes('://')||rel.startsWith('#')||rel.startsWith('mailto:'))continue;
      const resolved=path.resolve(path.dirname(f),decodeURIComponent(rel));
      assert.ok(fs.existsSync(resolved),`${path.relative(ROOT,f)} -> ${rel} missing`);
    }
  }
});
test('documentation avoids describing approval as implemented',()=>{
  const readme=fs.readFileSync(path.join(ROOT,'README.md'),'utf8');
  const arabic=fs.readFileSync(path.join(ROOT,'README_AR.md'),'utf8');
  assert.ok(readme.includes('pending_review'));
  assert.ok(readme.includes('No AI-only configuration') || readme.includes('near-zero error'));
  assert.ok(arabic.includes('Human Approval'));
});

console.log(`\nOFFLINE RESULT: ${passed} passed, ${failed} failed`);
if(failed)process.exit(1);
