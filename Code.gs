/**
 * Mágica Dulzura D’LISSI — backend para Google Sheets
 * 1) Pega este archivo en Apps Script.
 * 2) Ejecuta setup() una vez y autoriza los permisos.
 * 3) En Configuración del proyecto > Propiedades del script, agrega:
 *    ADMIN_PIN = una clave larga elegida por ti
 * 4) Implementa como aplicación web: ejecutar como tú; acceso según la opción
 *    disponible para tu caso. El catálogo público se puede leer sin clave.
 */
const SHEET_NAME = "Productos";
const HEADERS = ["id","name","category","price","description","images","active"];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Abre Apps Script desde una hoja de cálculo de Google.");
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    const samples = [
      ["flan-napolitano","Flan napolitano","Flanes",95,"Flan cremoso con caramelo. Precio de ejemplo.","https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=78",true],
      ["cheesecake-fresa","Cheesecake de fresa","Pasteles y cheesecake",75,"Cheesecake con cubierta de fresa. Precio de ejemplo.","https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=78",true],
      ["gelatina-familiar","Gelatina de molde familiar","Gelatinas",160,"Gelatina familiar de molde. Confirma tamaño y sabores.","https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=78",true],
      ["arroz-con-leche","Vasito de arroz con leche","Postres individuales",35,"Arroz con leche con canela. Precio de ejemplo.","https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=78",true],
      ["flan-mini","Flan individual","Flanes",38,"Porción individual. Precio de ejemplo.","https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=78",true],
      ["postre-especial","Postre de temporada","Especiales",60,"Producto de ejemplo reemplazable.","https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=78",true]
    ];
    sh.getRange(2,1,samples.length,HEADERS.length).setValues(samples);
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, HEADERS.length);
  }
  return "Listo. Hoja Productos preparada.";
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "list";
  let result;
  try {
    if (action !== "list") throw new Error("Acción no permitida por GET.");
    result = {ok:true, products:readProducts_()};
  } catch(err) { result = {ok:false,error:String(err.message || err)}; }
  const callback = e && e.parameter && e.parameter.callback;
  const body = callback
    ? callback + "(" + JSON.stringify(result).replace(/</g,"\\u003c") + ");"
    : JSON.stringify(result);
  return ContentService.createTextOutput(body).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;
  try {
    const payload = e && e.parameter && e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
    if (payload.action !== "save") throw new Error("Acción no válida.");
    const expected = PropertiesService.getScriptProperties().getProperty("ADMIN_PIN");
    if (!expected) throw new Error("Falta configurar ADMIN_PIN en las propiedades del script.");
    if (!payload.pin || !constantTimeEquals_(String(payload.pin), String(expected))) throw new Error("Clave de administración incorrecta.");
    if (!Array.isArray(payload.products)) throw new Error("No se recibió una lista de productos.");
    if (payload.products.length > 250) throw new Error("Máximo 250 productos por guardado.");
    saveProducts_(payload.products);
    result = {ok:true,message:"Catálogo guardado."};
  } catch(err) { result = {ok:false,error:String(err.message || err)}; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function readProducts_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss && ss.getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getRange(1,1,sh.getLastRow(),HEADERS.length).getValues();
  const headers = values.shift().map(String);
  return values.map(row => {
    const o = {};
    headers.forEach((h,i) => o[h] = row[i]);
    return o;
  }).filter(p => p.active === true || String(p.active).toLowerCase() === "true" || p.active === "" || p.active === undefined)
    .map(p => ({
      id:String(p.id || ""),
      name:String(p.name || ""),
      category:String(p.category || "Otros"),
      price:Number(p.price) || 0,
      description:String(p.description || ""),
      images:String(p.images || "").split(",").map(s=>s.trim()).filter(Boolean)
    }));
}

function saveProducts_(products) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No se encontró la hoja vinculada.");
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); }
  const clean = products.map(p => {
    const id = String(p.id || "").trim();
    const name = String(p.name || "").trim();
    const price = Number(p.price);
    if (!id || !name) throw new Error("ID y nombre son obligatorios.");
    if (!Number.isFinite(price) || price < 0) throw new Error("Precio no válido para " + name);
    const images = Array.isArray(p.images) ? p.images.join(",") : String(p.images || "");
    return [id,name,String(p.category || "Otros"),price,String(p.description || ""),images,true];
  });
  const ids = clean.map(r=>r[0]);
  if (new Set(ids).size !== ids.length) throw new Error("Hay IDs duplicados.");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sh.clearContents();
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    if (clean.length) sh.getRange(2,1,clean.length,HEADERS.length).setValues(clean);
    sh.setFrozenRows(1);
  } finally { lock.releaseLock(); }
}

function constantTimeEquals_(a,b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}