const container = document.querySelector(".container");
const campoBuscaInput = document.querySelector(".campo-pesquisa input");
const campoBusca = document.querySelector(".campo-pesquisa button");
const climaBox = document.querySelector(".clima-box");
const climaDetalhes = document.querySelector(".clima-detalhes");
const error404 = document.querySelector(".nao-encontrado");

campoBusca.addEventListener("click", () => {
    chamadaApi();
});
campoBuscaInput.addEventListener("keydown", function(e) {
    if (e.code == "Enter"){
        chamadaApi();
    }
});
campoBuscaInput.addEventListener("keydown", () => {
    matchMunicipio();
});

function chamadaApi(){
    const APIKey = config.APIKey;
    const cidade = document.querySelector(".campo-pesquisa input").value;
  
    if (cidade === "") {
      return;
    }
  
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&lang=pt_br&APPID=${APIKey}`
    ).then(result => result.json()).then
    (json => {
  
      if (json.cod === "404"){
          container.style.height = "400px";
          climaBox.style.display = "none";
          climaDetalhes.style.display = "none";
          error404.style.display = "block";
          error404.classList.add("fadeIn");
          return;
      }
  
      error404.style.display = "none";
      error404.classList.remove("fadeIn");
  
      const image = document.querySelector(".clima-box img");
      const temperatura = document.querySelector(".clima-box .temperatura");
      const temperaturaMax = document.querySelector(".clima-box .temperaturaMax");
      const temperaturaMin = document.querySelector(".clima-box .temperaturaMin");
      const descricao = document.querySelector(".clima-box .descricao");
      const umidade = document.querySelector(".clima-detalhes .umidade span");
      const vento = document.querySelector(".clima-detalhes .vento span");
      
      console.log(json);

      switch (json.weather[0].main){
          case "Clear":{
              image.src = "imagens/limpo.png";
              break;
          }
          case "Rain":{
              image.src = "imagens/chuvoso.png";  
              break;
          }
          case "Snow":{
              image.src = "imagens/neve.png"; 
              break;
          }
          case "Clouds":{
              image.src = "imagens/nuvens.png";
              break;
          }
          case "Haze":{
              image.src = "imagens/nublado.png";
              break;
          }
          case "Fog":{
            image.src = "imagens/nublado.png";
            break;
        }
          default:
              image.src = "";
  
  
      }
  
      temperatura.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
      temperaturaMax.innerHTML = `${parseInt(json.main.temp_max)}°C  <i class="fas fa-arrow-up"></i>`;
      temperaturaMin.innerHTML = `${parseInt(json.main.temp_min)}°C  <i class="fas fa-arrow-down"></i>`;
      descricao.innerHTML = `${json.weather[0].description}`;
      umidade.innerHTML = `${json.main.humidity}%`;
      vento.innerHTML = `${parseFloat(json.wind.speed)} Km/h`;
  
      campoBuscaInput.value = campoBuscaInput.value + " - " + json.sys.country;
  
      climaBox.style.display = "";
      climaDetalhes.style.display = "";
      climaBox.classList.add("fadeIn");
      climaDetalhes.classList.add("fadeIn");
      container.style.height = "590px";
  
      //getMunicipios();
  
    });
}

function matchMunicipio(){
    // const filtrado = cidades.nomeCidades.filter(str => str.includes(campoBuscaInput.value));
    // console.log(filtrado);
    const primeirosResultados = [];
    let cont = 0;

    for (let i = 0; i < cidades.nomeCidades.length && cont < 5; i++) {
        if (cidades.nomeCidades[i].toLowerCase().includes(campoBuscaInput.value)) {
            primeirosResultados.push(cidades.nomeCidades[i]);
            cont++;
        }
    }
    console.log(primeirosResultados);
}

function getMunicipios(){
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`).then(result => result.json()).then
    (json => {
        for (let i = 0; i < json.length; i++) {
            console.log('"'+json[i].nome+'",');
        }
    });
}