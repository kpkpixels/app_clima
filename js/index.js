const container = document.querySelector(".container");
const campoBuscaInput = document.querySelector(".campo-pesquisa input");
const campoBusca = document.querySelector(".btPesquisa");
const climaBox = document.querySelector(".clima-box");
const climaDetalhes = document.querySelector(".clima-detalhes");
const error404 = document.querySelector(".nao-encontrado");
const autocompleteCidades = document.querySelector(".autocomplete-cidades");
const carregando = document.querySelector(".carregando");
const botaoLocalizacao = document.querySelector(".btLocalizacao");
const textoTooltipNomeCidade = document.querySelector(".tooltipNomeCidade");
const botaoTema = document.querySelector(".btTema");

//#region listeners
botaoLocalizacao.addEventListener("click", () => {
  getGeolocation();
});
campoBusca.addEventListener("click", () => {
  validaCidade();
});
campoBuscaInput.addEventListener("keydown", function (e) {
  if (e.code == "Enter") {
    validaCidade();
  }
  ajustaTamanhoTexto();
});
campoBuscaInput.addEventListener("input", function (e) {
    matchMunicipio();
});
botaoTema.addEventListener("click", () => {
  mudaTema();
});
//#endregion

async function validaCidade(){    
  campoBuscaInput.focus();
  ajustaTamanhoTexto();

  let cidade = document.querySelector(".campo-pesquisa input").value.split(",")[0];
  //let cidade = document.querySelector(".campo-pesquisa input").value.split(",")[0].normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //tira acentos e deixa minusculo
  //cidade = cidade.replace(/[\W_]+/g, " "); 
  
  if (cidade === "") {
    return;
  }
  else{
    //buscaDados(cidade);
    fetchAPI(await getLatLongByEndereço(cidade));
  }
}

function fetchAPI(info){
  if (info == null){ return; }

  mostraCarregando("Buscando informações, aguarde...");

  var urlAPI = `https://api.open-meteo.com/v1/dwd-icon?latitude=${info[0]}&longitude=${info[0]}&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
  
  fetch(urlAPI)
    .then((result) => result.json())
    .then((json) => {
      console.log(json);
      montaDados(json);
    });
}

function montaDados(dados) {
  mostraCarregando("Buscando informações, aguarde...");

  ocultaCarregando();
  textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';

  error404.style.display = "none";
  error404.classList.remove("fadeIn");

  montaImagens(dados.current_weather.weathercode);

  montaInformacoesTela(dados);
}

function matchMunicipio() {
    var b,
    i,
    val = campoBuscaInput.value;

  climaBox.classList.add("oculta-tela");
  climaDetalhes.classList.add("oculta-tela");
  error404.classList.add("oculta-tela");
  autocompleteCidades.classList.remove("oculta-tela");

  limparListaCidades();
  if (!val) {
    return false;
  }
  let cont = 0;
  let valorInput = val.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //retirando acentos e deixando uppercase

  for (i = 0; i < cidades.nomeCidades.length && cont < 5; i++) {
    let nomeCidade = cidades.nomeCidades[i].slice(0, val.length).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //retirando acentos e deixando uppercase
    if (nomeCidade == valorInput) {
      b = document.createElement("SPAN");
      b.setAttribute("class", "autocomplete-itens");
      b.innerHTML = "<strong>" + cidades.nomeCidades[i].slice(0, val.length) + "</strong>";
      b.innerHTML += cidades.nomeCidades[i].slice(val.length);
      b.innerHTML += "<input type='hidden' value='" + cidades.nomeCidades[i] + "'>";
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
function naoEncontrada(){
  climaBox.classList.add("oculta-tela");
          climaDetalhes.classList.add("oculta-tela");
          container.style.height = "430px"
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

function montaImagens(codigoClima){
  const image = document.querySelector(".clima-box img");

      //easter egg
      if (campoBuscaInput.value.split(",")[0] === "abu dhabi") { image.src = "imagens/abudhabi.png"; }
      
      switch (codigoClima) {
        case 0: {
          image.src = "imagens/limpo.png";
          break;
        }
        case 1: {
          image.src = "imagens/limpo.png";
          break;
        }
        case 2: {
          image.src = "imagens/nuvens.png";
          break;
        }
        case 3: {
          image.src = "imagens/nuvens.png";
          break;
        }
        case 45: {
          image.src = "imagens/nublado.png";
          break;
        }
        case 48: {
          image.src = "imagens/nublado.png";
          break;
        }
        case 53: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 55: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 51: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 61: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 63: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 65: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 66: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 67: {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case 71: {
          image.src = "imagens/neve.png";
          break;
        }
        case 73: {
          image.src = "imagens/neve.png";
          break;
        }
        case 75: {
          image.src = "imagens/neve.png";
          break;
        }
        case 77: {
          image.src = "imagens/neve.png";
          break;
        }        
        default:
          image.src = "";
      }
}

function montaInformacoesTela(info) {
  const temperatura = document.querySelector(".clima-box .temperatura");
  const temperaturaMax = document.querySelector(".clima-box .temperaturaMax");
  const temperaturaMin = document.querySelector(".clima-box .temperaturaMin");
  const descricao = document.querySelector(".clima-box .descricao");
  const umidade = document.querySelector(".clima-detalhes .umidade span");
  const vento = document.querySelector(".clima-detalhes .vento span");

  temperatura.innerHTML = `${parseInt(info.current_weather.temperature)}<span>°C</span>`;
  temperaturaMax.innerHTML = `${parseInt(
    info.daily.temperature_2m_max[0]
  )}°C  <i class="fas fa-arrow-up"></i>`;
  temperaturaMin.innerHTML = `${parseInt(
    info.daily.temperature_2m_min[0]
  )}°C  <i class="fas fa-arrow-down"></i>`;
  // descricao.innerHTML = `${info.weather[0].description}`;
  umidade.innerHTML = `99%`;
  vento.innerHTML = `${parseFloat(info.current_weather.windspeed)} Km/h`;

  //getLocalizacaoByLatLong(info.coord.lat, info.coord.lon);

  climaBox.classList.remove("oculta-tela");
  climaDetalhes.classList.remove("oculta-tela");

  climaBox.style.display = "";
  climaDetalhes.style.display = "";
  climaBox.classList.add("fadeIn");
  climaDetalhes.classList.add("fadeIn");
  container.style.height = "590px";
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
}

function getLatLongByEndereço(cidade){
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

//carregou a pagina, ele chama essa funçao
window.onload = function() {
  campoBuscaInput.focus();
  getGeolocation();
  setaTemaByHour();
};
