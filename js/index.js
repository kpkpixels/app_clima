const container = document.querySelector(".container");
const campoBuscaInput = document.querySelector(".campo-pesquisa input");
const botaoBusca = document.querySelector(".btPesquisa");
const climaBox = document.querySelector(".clima-box");
const climaDetalhes = document.querySelector(".clima-detalhes");
const climaDias = document.querySelector(".clima-dias");
const climaDiasContainer = document.querySelector(".clima-dias-container");
const climaDia = document.querySelectorAll(".clima-dia");
const error404 = document.querySelector(".nao-encontrado");
const autocompleteCidades = document.querySelector(".autocomplete-cidades");
const carregando = document.querySelector(".carregando");
const botaoLocalizacao = document.querySelector(".btLocalizacao");
const textoTooltipNomeCidade = document.querySelector(".tooltipNomeCidade");
const botaoTema = document.querySelector(".btTema");
const tamanhoPadraoContainer = 670;

let permitidaGeolocacao = false;


//#region listeners
campoBuscaInput.addEventListener("keydown", function (e) {
  if (e.code == "Enter") {    
    validaCidade();
  }
  ajustaTamanhoTexto();
});
campoBuscaInput.addEventListener("input", function (e) {
  if (navigator.userAgentData.mobile){scrollToInput();}
  
  matchMunicipio();
});
campoBuscaInput.addEventListener("click", function(e) { 
  if (navigator.userAgentData.mobile){scrollToInput();}
});
//#endregion

async function validaCidade(){   
  scrollCentro();
  campoBuscaInput.focus();
  ajustaTamanhoTexto();

  if (navigator.userAgentData.mobile){
    campoBuscaInput.blur();
  }  
  
  let cidade = document.querySelector(".campo-pesquisa input").value.split(",")[0];
  
  if (cidade === "") {
    return;
  }
  else{
    fetchAPI(await getLatLongByEndereco(cidade));
  }
}

function fetchAPI(info){
  if (info == null){ return; }

  mostraCarregando("Buscando informações, aguarde...");

  var urlAPI = `https://api.open-meteo.com/v1/dwd-icon?latitude=${info[0]}&longitude=${info[1]}&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
  
  fetch(urlAPI)
    .then((result) => result.json())
    .then((json) => {
      console.log(json);
      montaDados(json);
    });
}

async function montaDados(dados) {
  ocultaCarregando();
  textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';

  climaDiasContainer.style = "transform: scaleY(0)";
  error404.style.display = "none";
  error404.classList.remove("fadeIn");

  let infoDescricaoImg = await getDescricaoImagem(dados.current_weather.weathercode);
  document.querySelector(".clima-box img").src = infoDescricaoImg[1];
  document.querySelector(".clima-box .descricao").innerHTML = infoDescricaoImg[0];
       
  montaInformacoesTela(dados);

  montaInfoProximosDias(dados.daily);
}

async function matchMunicipio() {
    var b,
    i,
    val = campoBuscaInput.value;
  
  climaDias.classList.add("oculta-tela");
  climaBox.classList.add("oculta-tela");
  climaDetalhes.classList.add("oculta-tela");
  error404.classList.add("oculta-tela");
  autocompleteCidades.classList.remove("oculta-tela");

  textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';
  ajustaTamanhoTexto();

  limparListaCidades();
  if (!val) {
    return false;
  }
  let cont = 0;
  let valorInput = val.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //retirando acentos e deixando uppercase

  const {listaCidades} = await getDados();

  for (i = 0; i < listaCidades.length && cont < 5; i++) {
    let nomeCidade = listaCidades[i].slice(0, val.length).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //retirando acentos e deixando uppercase
    if (nomeCidade == valorInput) {
      b = document.createElement("SPAN");
      b.setAttribute("class", "autocomplete-itens");
      b.innerHTML = "<strong>" + listaCidades[i].slice(0, val.length) + "</strong>";
      b.innerHTML += listaCidades[i].slice(val.length);
      b.innerHTML += "<input type='hidden' value='" + listaCidades[i] + "'>";
      container.style.height = "calc("+container.style.height+" + 55px)";

      b.addEventListener("click", function (e) {
        campoBuscaInput.value = this.getElementsByTagName("input")[0].value;
        
        limparListaCidades();
        validaCidade();
      });
      autocompleteCidades.appendChild(b);
      cont++;
    }
  }
}

async function getDados(){  
  return new Promise((resolve, reject) => {
    fetch('dados/data.json')
      .then(response => response.json())
      .then(data => {    
        resolve(data);
      })
      .catch(error => reject(error));
  });   
}

function getMunicipios() {
  fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
  )
    .then((result) => result.json())
    .then((json) => {
      for (let i = 0; i < json.length; i++) {
        console.log('"' + json[i].nome + ", " +json[i].microrregiao.mesorregiao.UF.sigla +'",');
      }
    });
}

function limparListaCidades() {
  var x = document.getElementsByClassName("autocomplete-itens");
  
  while (x.length > 0) {
    x[x.length - 1].parentNode.removeChild(x[x.length - 1]);
  }
  container.style.height = "105px";
}

function mostraCarregando(msgLoading){   
  autocompleteCidades.classList.add("oculta-tela");
  container.style.height = "220px"
  carregando.innerHTML = "<p>"+msgLoading+"</p>";
  carregando.style.display = "block";
}
function ocultaCarregando(){ 
  container.style.height = "105px"   
  carregando.style.display = "none";  
}
function naoEncontrada() {
  climaBox.classList.add("oculta-tela");
  climaDetalhes.classList.add("oculta-tela");
  climaDias.classList.add("oculta-tela");
  container.style.height = "430px";
  error404.classList.remove("oculta-tela");
  error404.style.display = "block";
  error404.classList.add("fadeIn");
}

function mudaTema(){
  if (document.body.className === "tema-escuro"){
    document.body.classList.remove("tema-escuro");
    botaoTema.classList.remove("fa-sun");
    botaoTema.classList.add("fa-moon");
    botaoTema.innerHTML = '<span class="tooltipTextoLeft" style="width: 91px;">Tema Escuro<i class="fa-solid fa-sort-up"></i></span>';
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  '#3E7D84');
  }
  else{
    document.body.classList.add("tema-escuro");
    botaoTema.classList.remove("fa-moon");
    botaoTema.classList.add("fa-sun");
    botaoTema.innerHTML = '<span class="tooltipTextoLeft" style="width: 91px;">Tema Claro<i class="fa-solid fa-sort-up"></i></span>';
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  '#3f3e84');
  }
}

async function getDescricaoImagem(codigoClima) {
  const { listaClima } = await getDados();

  return new Promise((resolve, reject) => {
    const clima = listaClima.find((clima) => clima.codigo == codigoClima);
    if (clima) {
      if (campoBuscaInput.value.split(",")[0] === "Abu Dhabi") {
        resolve([clima.descricao, "imagens/abudhabi.png"]); // easter egg
      }
      resolve([clima.descricao, clima.img]);
    } else {
      reject(new Error("Clima not found."));
    }
  });
}
function montaInformacoesTela(info) {
  const temperatura = document.querySelector(".clima-box .temperatura");
  const temperaturaMax = document.querySelector(".clima-box .temperaturaMax");
  const temperaturaMin = document.querySelector(".clima-box .temperaturaMin");
  const umidade = document.querySelector(".clima-detalhes .umidade span");
  const vento = document.querySelector(".clima-detalhes .vento span");

  temperatura.innerHTML = `${parseInt(info.current_weather.temperature)}<span>°C</span>`;
  temperaturaMax.innerHTML = `${parseInt(
    info.daily.temperature_2m_max[0]
  )}°C  <i class="fas fa-arrow-up"></i>`;
  temperaturaMin.innerHTML = `${parseInt(
    info.daily.temperature_2m_min[0]
  )}°C  <i class="fas fa-arrow-down"></i>`;
  umidade.innerHTML = getUmidade(info.hourly) + "%";
  vento.innerHTML = `${parseFloat(info.current_weather.windspeed)} Km/h`;

  climaBox.classList.remove("oculta-tela");
  climaDetalhes.classList.remove("oculta-tela");
  climaDias.classList.remove("oculta-tela");

  climaBox.style.display = "";
  climaDetalhes.style.display = "";
  climaBox.classList.add("fadeIn");
  climaDetalhes.classList.add("fadeIn");
  container.style.height = tamanhoPadraoContainer+"px";
}

async function montaInfoProximosDias(info){  
  let estrutura = "";
  const {diaSemana} = await getDados();

  for (let i = 1; i < info.temperature_2m_max.length; i++) {
    const data = info.time[i].split("-");
    let infoDescricaoImg = await getDescricaoImagem(info.weathercode[i]);
    const diaDeHoje = new Date().getDay();
    let dia = diaDeHoje + i > 6 ? (diaDeHoje + i) - 7 : diaDeHoje + i;

    estrutura += `<div class="clima-dia oculta-tela">` + 
    `<div class="dia">`+
    `<span>`+data[2]+`/`+data[1]+`</span>`+
    `<span>${diaSemana[dia]}</span>`+
    `</div>`+
    `<div style="max-width: 40%; text-align: center;">`+
    `<span>${infoDescricaoImg[0]}</span>`+
    `</div>`+
    `<div class="temperaturas-dia">`+
    `<img src=${infoDescricaoImg[1]} alt="">`+
    `<div>`+
    `<span class="temp-max">${info.temperature_2m_max[i]} °C<i class="fas fa-arrow-up" aria-hidden="true"></i></span>`+
    `<span class="temp-min">${info.temperature_2m_min[i]} °C<i class="fas fa-arrow-down" aria-hidden="true"></i></span>`+
    `</div>`+
    `</div>`+
    `</div>`;
  }

  climaDiasContainer.innerHTML = estrutura;

}

function showProximosDias(){
  const climaDia = document.querySelectorAll(".clima-dia");
  const botaoProx = document.querySelector(".clima-dias p i");
  climaDia.forEach(elemento => {
    if (elemento.className.split(" ")[1] === "oculta-tela"){    
      elemento.classList.remove("oculta-tela");
      container.style.height = "710px";
      botaoProx.style = "transform: rotate(180deg)";
      climaDiasContainer.style = "transform: scaleY(1)";
      climaBox.classList.add("oculta-tela");
      climaDetalhes.classList.add("oculta-tela");
    }
    else{
      climaDiasContainer.style = "transform: scaleY(0)";
      botaoProx.style = "transform: rotate(0deg)";
      setTimeout(() => {     
        climaBox.classList.remove("oculta-tela");
        climaDetalhes.classList.remove("oculta-tela");   
        elemento.classList.add("oculta-tela");
        container.style.height = tamanhoPadraoContainer+"px";
      }, 300);
      
    }
  });
  
}

//pega a localizaçao do navegador
function getGeolocation() { 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getLocalizacao);
  } else { 
    ocultaCarregando();
    alert("Geolocation não é suportada neste navegador.");
  }
}
function getLocalizacao(posicao){ 
  mostraCarregando("Buscando localização, aguarde...");
  fetchAPI([posicao.coords.latitude, posicao.coords.longitude]);
  getLocalizacaoByLatLong([posicao.coords.latitude, posicao.coords.longitude]);
}

function getLatLongByEndereco(cidade){
  return new Promise((resolve, reject) => {
    fetch(`https://geocode.maps.co/search?q={${cidade}}`)
      .then(res => res.json())
      .then(data => {
        if (data.length == 0) {
          naoEncontrada();
          return;
        }

        const dados = [data[0].lat, data[0].lon];
        getLocalizacaoByLatLong(dados);
        resolve(dados);
      })
      .catch(error => reject(error));
  });
}

function getLocalizacaoByLatLong(info) {
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${info[0]}&longitude=${info[1]}&localityLanguage=pt-BR`)
  .then(res => res.json())
  .then(data => {
    //buscaDados(data.city);
    campoBuscaInput.value = data.city + ", " + data.principalSubdivisionCode.split("-")[1] + " - " + data.principalSubdivisionCode.split("-")[0];    
    textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';
    ajustaTamanhoTexto();
  });
}

//gambiarra dus guri pra ajustar o tamanho do texto
function ajustaTamanhoTexto(){
  const TAMANHO_PADRAO = 24;

  if (campoBuscaInput.value.length > 19 && campoBuscaInput.value.length < 26){
    campoBuscaInput.style.fontSize = ((TAMANHO_PADRAO + 18) - campoBuscaInput.value.length)  + "px";
  }
  else if (campoBuscaInput.value.length >= 26){
    campoBuscaInput.style.fontSize = TAMANHO_PADRAO - 7 + "px";
  }
  else if (campoBuscaInput.value.length <= 19){
    campoBuscaInput.style.fontSize = TAMANHO_PADRAO + "px";
  }
  else{
    campoBuscaInput.style.fontSize = TAMANHO_PADRAO + "px";
  }
}
function setaTemaByHour(){
  const hora = new Date().getHours();
  
  if (hora < 18 && hora > 5){
    document.body.classList.add("tema-escuro"); //gambiarra pra enganar a funçao
    mudaTema();
  }
  else{
    mudaTema();
  }
}

function getUmidade(listaUmidade){
  for (let i = 0; i < listaUmidade.time.length; i++) {
    const umidade = listaUmidade.time[i];

    let dataUmidade = new Date(umidade);
    let diaIgual = dataUmidade.getDay() == new Date().getDay() ? true : false;
    let horaIgual = dataUmidade.getHours() == new Date().getHours() ? true : false;

    if (diaIgual && horaIgual){
      return listaUmidade.relativehumidity_2m[i];
    }
  }

  return "";
}

function scrollCentro(){  
  var windowHeight = window.innerHeight;
  var contentHeight = document.body.offsetHeight;
  var scrollPosition = contentHeight / 2 - windowHeight / 2;
  window.scrollTo(0, scrollPosition);
}

function scrollToInput(){
  campoBuscaInput.scrollIntoView({ behavior: 'smooth' });
}

//comentando pq atrapalha quando vai buscar por localizaçao automatica após ja ter pesquisado
/*
document.addEventListener("DOMContentLoaded", function() {
  navigator.geolocation.watchPosition(function() {
    if (!permitidaGeolocacao) {
      permitidaGeolocacao = true;
      mostraCarregando("Buscando localização, aguarde...");
    }
  }, function(error) {
    if (error.code == error.PERMISSION_DENIED)
      ocultaCarregando();
  });
});
*/

//carregou a pagina, ele chama essa funçao
window.onload = function() {
  campoBuscaInput.focus();
  getGeolocation();
  setaTemaByHour();  
  scrollCentro();
};
