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

function validaCidade(){    
  campoBuscaInput.focus();
  ajustaTamanhoTexto();

  let cidade = document.querySelector(".campo-pesquisa input").value.split(",")[0];
  //let cidade = document.querySelector(".campo-pesquisa input").value.split(",")[0].normalize('NFD').replace(/[\u0300-\u036f]/g, ''); //tira acentos e deixa minusculo
  //cidade = cidade.replace(/[\W_]+/g, " "); 
  
  if (cidade === "") {
    return;
  }
  else{
    buscaDados(cidade);
  }
}

function buscaDados(cidade) {
  //const APIKey = config.APIKey;
  const APIKey = "c21d5353";

  mostraCarregando("Buscando informações, aguarde...");

  fetch( 
    `https://api.hgbrasil.com/weather?format=json-cors&key=${APIKey}&city_name=${cidade}`
  )
    .then((result) => result.json())
    .then((json) => {
      console.log(json);
      ocultaCarregando();         
      textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';

      if (json.by === "default") {
        climaBox.classList.add("oculta-tela");
        climaDetalhes.classList.add("oculta-tela");
        container.style.height = "430px"
        error404.classList.remove("oculta-tela");
        error404.style.display = "block";
        error404.classList.add("fadeIn");
        return;
      }
      error404.style.display = "none";
      error404.classList.remove("fadeIn");

      const image = document.querySelector(".clima-box img");      

      //console.log(json);

      switch (json.results.condition_slug) {
        case "clear_day": {
          image.src = "imagens/limpo.png";
          break;
        }
        case "clear_night": {
          image.src = "imagens/limpo.png";
          break;
        }
        case "rain": {
          image.src = "imagens/chuvoso.png";
          break;
        }
        case "snow": {
          image.src = "imagens/neve.png";
          break;
        }
        case "cloud": {
          image.src = "imagens/nublado.png";
          break;
        }
        case "cloudly_day": {
          image.src = "imagens/nublado.png";
          break;
        }
        case "cloudly_night": {
          image.src = "imagens/nublado.png";
          break;
        }
        case "fog": {
          image.src = "imagens/nublado.png";
          break;
        }
        case "storm": {
          image.src = "imagens/tempestade.png";
          break;
        }
        case "hail": {
          image.src = "imagens/granizo.png";
          break;
        }
        default:
          image.src = "";
      }

      //easter egg
      if (cidade === "abu dhabi") { image.src = "imagens/abudhabi.png"; }

      montaInformacoesTela(json.results);            
    });
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

function montaInformacoesTela(info) {
  const temperatura = document.querySelector(".clima-box .temperatura");
  const temperaturaMax = document.querySelector(".clima-box .temperaturaMax");
  const temperaturaMin = document.querySelector(".clima-box .temperaturaMin");
  const descricao = document.querySelector(".clima-box .descricao");
  const umidade = document.querySelector(".clima-detalhes .umidade span");
  const vento = document.querySelector(".clima-detalhes .vento span");

  temperatura.innerHTML = `${parseInt(info.temp)}<span>°C</span>`;
  temperaturaMax.innerHTML = `${parseInt(
    info.forecast[0].max
  )}°C  <i class="fas fa-arrow-up"></i>`;
  temperaturaMin.innerHTML = `${parseInt(
    info.forecast[0].min
  )}°C  <i class="fas fa-arrow-down"></i>`;
  descricao.innerHTML = `${info.description}`;
  umidade.innerHTML = `${info.humidity}%`;
  vento.innerHTML = `${parseFloat(info.wind_speedy)} Km/h`;

  // campoBuscaInput.value =
  //   campoBuscaInput.value.split(" - ")[0] + " - " + info.sys.country;
  
  campoBuscaInput.value = info.city;    
  textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';
  ajustaTamanhoTexto();

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
  getLocalizacaoByLatLong(posicao.coords.latitude, posicao.coords.longitude, true);
}

function getLocalizacaoByLatLong(latitude, longitude, geolocation = false) {
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt-BR`)
  .then(res => res.json())
  .then(data => {
    //buscaDados(data.city);
    campoBuscaInput.value = data.city + ", " + data.principalSubdivisionCode.split("-")[1] + " - " + data.principalSubdivisionCode.split("-")[0];    
    textoTooltipNomeCidade.innerHTML = campoBuscaInput.value + '<i class="fa-solid fa-sort-up"></i>';
    ajustaTamanhoTexto();

    if (geolocation){ validaCidade(); }
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
