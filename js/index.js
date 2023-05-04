const container = document.querySelector(".container");
const campoBusca = document.querySelector(".campo-pesquisa button");
const climaBox = document.querySelector(".clima-box");
const climaDetalhes = document.querySelector(".clima-detalhes");
const error404 = document.querySelector(".nao-encontrado");

campoBusca.addEventListener("click", () => {
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
    const descricao = document.querySelector(".clima-box .descricao");
    const umidade = document.querySelector(".clima-detalhes .umidade span");
    const vento = document.querySelector(".clima-detalhes .vento span");
    
    switch (json.weather[0].main){
        case "Clear":{
            image.src = "imagens/limpo.png";
            break;
        }
        case "Rain":{
            // image.src = "imagens/chuvoso.png";
            image.src = "imagens/limpo.png";

            break;
        }
        case "Snow":{
            // image.src = "imagens/neve.png";
            image.src = "imagens/limpo.png";

            break;
        }
        case "Clouds":{
            // image.src = "imagens/nuvens.png";
            image.src = "imagens/limpo.png";

            break;
        }
        case "Haze":{
            // image.src = "imagens/nublado.png";
            image.src = "imagens/limpo.png";

            break;
        }
        default:
            image.src = "";


    }

    temperatura.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    descricao.innerHTML = `${json.weather[0].description}`;
    umidade.innerHTML = `${json.main.humidity}`;
    vento.innerHTML = `${parseInt(json.wind.speed)}Km/h`;


    climaBox.style.display = "";
    climaDetalhes.style.display = "";
    climaBox.classList.add("fadeIn");
    climaDetalhes.classList.add("fadeIn");
    container.style.height = "590px";


  });
});
