const API = "https://script.google.com/macros/s/AKfycbyDsZhKPkEJN_gVusUdHVU35XFmiIGz_tnOMhXJSMbeiRgP3AoVQCTwp8p_8tisGrvg4w/exec";
const PASSWORD = "20250911";


function go(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("show"));
  document.getElementById(id).classList.add("show");
  if(id==="schedule")loadSc();
  if(id==="items")loadItems();
  if(id==="wait")loadWait();
  if(id==="preout")loadPreOut();
  if(id==="out")loadOut();
}

function login(){
  if(document.getElementById("p").value===PASSWORD){
    document.getElementById("login").style.display="none";
    document.getElementById("app").style.display="block";
    loveDay();
    go("home");
  }else{alert("密码错误")}
}

function loveDay(){
  const s=new Date("2025-09-11");
  const n=new Date();
  const d=Math.floor((n-s)/(1000*60*60*24));
  document.getElementById("day").innerText=d;
}

// ========== 日本时间格式化（核心修复） ==========
function fmt(tz) {
  if (!tz) return "";
  const date = new Date(tz);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${min}`;
}

// ----------------------
// 日程
// ----------------------
async function addSc(){
  await fetch(API+"?action=addSchedule&content="+encodeURIComponent(document.getElementById("sc").value));
  document.getElementById("sc").value="";loadSc();
}
async function loadSc(){
  const d=await(await fetch(API+"?action=getSchedule")).json();
  let h="";for(let i=d.length-1;i>=1;i--)h+=`<div class=item>${d[i][1]}<br>📅 ${fmt(d[i][2])}</div>`;
  document.getElementById("sclist").innerHTML=h;
}

// ----------------------
// 在库
// ----------------------
async function addItem(){
  const n=document.getElementById("inname").value;
  const t=document.getElementById("intime").value;
  const p=document.getElementById("inprice").value;
  const c=document.getElementById("incate").value;
  await fetch(API+`?action=addItem&name=${encodeURIComponent(n)}&inTime=${t}&price=${p}&category=${encodeURIComponent(c)}`);
  document.getElementById("inname").value="";document.getElementById("intime").value="";document.getElementById("inprice").value="";loadItems();
}
async function loadItems(){
  const d=await(await fetch(API+"?action=getItems")).json();
  let h="";for(let i=1;i<d.length;i++){
    h+=`<div class=item>${d[i][1]}<br>${fmt(d[i][2])} | ${d[i][3]}円 | ${d[i][4]}<br>📅 ${fmt(d[i][5])}
    <div class=opt><button onclick="outItem('${d[i][0]}','${d[i][1]}','${d[i][3]}','${d[i][4]}')">出库</button></div></div>`;
  }
  document.getElementById("itemlist").innerHTML=h;
}
async function outItem(id,name,p,cate){
  const addr=prompt("住所");const time=prompt("出货时间(例:2026-04-14 18:30)");
  await fetch(API+`?action=addOut&name=${encodeURIComponent(name)}&outTime=${time}&address=${encodeURIComponent(addr)}&price=${p}&category=${encodeURIComponent(cate)}`);
  await fetch(API+`?action=deleteItem&id=${id}`);loadItems();loadOut();
}

// ----------------------
// 待收货
// ----------------------
async function addWait(){
  const n=document.getElementById("wname").value;
  const t=document.getElementById("wtime").value;
  const a=document.getElementById("waddr").value;
  const p=document.getElementById("wprice").value;
  const c=document.getElementById("wcate").value;
  await fetch(API+`?action=addWait&name=${encodeURIComponent(n)}&inTime=${t}&address=${encodeURIComponent(a)}&price=${p}&category=${encodeURIComponent(c)}`);
  document.getElementById("wname").value="";document.getElementById("wtime").value="";document.getElementById("waddr").value="";document.getElementById("wprice").value="";loadWait();
}
async function loadWait(){
  const d=await(await fetch(API+"?action=getWait")).json();
  let h="";for(let i=1;i<d.length;i++){
    h+=`<div class=item>${d[i][1]}<br>${fmt(d[i][2])} | ${d[i][3]} | ${d[i][4]}円 | ${d[i][5]}<br>📅 ${fmt(d[i][6])}
    <div class=opt><button onclick="receive('${d[i][0]}','${d[i][1]}','${d[i][2]}','${d[i][4]}','${d[i][5]}')">收货</button></div></div>`;
  }
  document.getElementById("wlist").innerHTML=h;
}
async function receive(id,name,t,p,cate){
  await fetch(API+`?action=addItem&name=${encodeURIComponent(name)}&inTime=${t}&price=${p}&category=${encodeURIComponent(cate)}`);
  await fetch(API+`?action=deleteWait&id=${id}`);loadWait();loadItems();
}

// ----------------------
// 出货预定
// ----------------------
async function addPreOut(){
  const name=document.getElementById("pname").value;
  const t=document.getElementById("ptime").value;
  const a=document.getElementById("paddr").value;
  const p=document.getElementById("pprice").value;
  const r=document.getElementById("premark").value;
  await fetch(API+`?action=addPreOut&name=${encodeURIComponent(name)}&outTime=${t}&address=${encodeURIComponent(a)}&price=${p}&remark=${encodeURIComponent(r)}`);
  document.getElementById("pname").value="";document.getElementById("ptime").value="";document.getElementById("paddr").value="";document.getElementById("pprice").value="";document.getElementById("premark").value="";loadPreOut();
}
async function loadPreOut(){
  const d=await(await fetch(API+"?action=getPreOut")).json();
  let h="";for(let i=1;i<d.length;i++){
    h+=`<div class=item>${d[i][1]}<br>${fmt(d[i][2])} | ${d[i][3]} | ${d[i][4]}円<br>備考：${d[i][5]}<br>📅 ${fmt(d[i][6])}
    <div class=opt><button onclick="confirmPreOut('${d[i][0]}','${d[i][1]}','${d[i][2]}','${d[i][3]}','${d[i][4]}')">确认出货</button></div></div>`;
  }
  document.getElementById("plist").innerHTML=h;
}
async function confirmPreOut(id,name,t,a,p){
  const cate=prompt("分类(微信/QQ/小红书/メルカリ/ジモティー)");
  await fetch(API+`?action=addOut&name=${encodeURIComponent(name)}&outTime=${fmt(t)}&address=${encodeURIComponent(a)}&price=${p}&category=${encodeURIComponent(cate)}`);
  await fetch(API+`?action=deletePreOut&id=${id}`);loadPreOut();loadOut();
}

// ----------------------
// 出货记录
// ----------------------
async function loadOut(){
  const d=await(await fetch(API+"?action=getOut")).json();
  let h="";for(let i=d.length-1;i>=1;i--)h+=`<div class=item>${d[i][1]}<br>${fmt(d[i][2])} | ${d[i][3]} | ${d[i][4]}円 | ${d[i][5]}<br>📅 ${fmt(d[i][6])}</div>`;
  document.getElementById("outlist").innerHTML=h;
}
