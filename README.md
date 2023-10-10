## Extrator de Dados de Vídeos do YouTube

Este projeto consiste em uma API desenvolvida com Node.js, dedicada à extração de dados de vídeos do YouTube. Desenvolvida como parte de um estudo da linguagem Node.js, a API tem como objetivo aprimorar o desempenho de um algoritmo desenvolvido para extrair e decifrar assinaturas em URLs de streaming do YouTube. Esta API foi projetada para funcionar em conjunto com [este projeto](https://github.com/yetzinn/extrator-audio-yt).

## Ferramentas Utilizadas

- Node.js
- Fastify
- Axios
- Algoritmo de Deciframento de Assinatura

## Endpoint da API

### A API fornece o seguinte endpoint:

* **URL**

  `https://danilomodz-youtube-data-extractor-api.onrender.com`

* **Método**

  `GET`

* **Parâmetros**

    | Atributo   | Tipo do dado   | Descrição                                  | Obrigatório     |
    |------------|----------------|------------------------------------------- |-----------------|
    | url        | string         | Url do vídeo do YouTube                    | sim             |

* **Retornos**
  
  **Status Code:** 200
  
    ```json
    {
        "videoDetails": {
            "title": "Título do vídeo",
            "thumbnail": "https://i.ytimg.com/vi/..."
        },
        "streamingDetails": [
            {
            "contentLength": "0.0 MB",
            "url": "https://rr3---sn-4g5e6nzl.googlevideo.com/videoplayback..."
            }
        ]
    }
    ```

  **Status Code:** 400
  
    ```json
    {
        "error": {
            "code": 400,
            "message": "Unable to download.",
            "status": "FAILED_PRECONDITION"
        }
    }
    ``` 
        
-----