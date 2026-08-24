# project1-2026b-FabricioDD
# Projeto: Remake de aplicação web simples
> 3. Substitua a imagem animada por um GIF/WEBP mostrando o resultado do seu projeto (o arquivo pode ser armazenado no repositório ou em URL externa). 
> 4. Remova todas as instruções de entrega.
> 6. Double-check: Certifique-se de que seu README.md não contenha instruções de entrega e seja visualizado corretamente ao abrir seu repositório!
> Opcional: você pode alterar a formatação deste README, mas mantenha todas as informações solicitadas.

![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")



## Acesso

Substitua este texto pela URL para acesso ao seu app publicado. Adicione a URL também na seção "About" do seu repositório no GitHub.


## Desenvolvedor(a)
Fabrício Thomas - Sistemas de Informação



## App original
Client-side-ai-demos
### Links

- Acesso: https://andreainfufsm.github.io/client-side-ai-demos/demos/efficientdet-lite0-benchmark  ;  https://andreainfufsm.github.io/client-side-ai-demos/demos/smolvlm-benchmark/
- Repositório: https://github.com/AndreaInfUFSM/client-side-ai-demos

### Descrição
Ferramenta para testar o modelos AI diretamente no navegador. Autoria por Andrea Schwertner Charão. As configurações utilizadas pelo modelo podem ser visualizadas e alteradas no campo JSON abaixo.

## Demanda do(a) cliente
### Cliente
GUILHERME SERAFINI DAPIEVE

### Demanda
- deixar o site em português
- criar um descrição abaixo do título do site com explicações mais detalhadas de como usar a ferramenta
- corrigir os links para exibir o site correto
- criar um botão para copiar/baixar o config JSON e o output
- criar uma opção para alterar o config JSON

## Desenvolvimento

### Processo

Aproveitei a necessidade de ler e entender o código para já ir traduzindo conforme explorava. Comecei pelo HTML e segui para o JavaScript. O único ponto que foi diferente foi o botão de seleção de imagem, que não podia ser traduzido diretamente no código. A solução que encontrei foi esconder o 'Browse...' com o atributo hidden e criar um label como botão.

Após isso, modifiquei a descrição dos sites e adicionei uma forma de selecionar o modelo usado com um select. Não unifiquei os arquivos index.html, apenas coloquei a ferramenta para ajudar a localizar os modelos sem precisar mexer na URL. Depois disso, comecei a criar um botão de copiar o output do modelo (nas demandas, também foi mencionado baixar, mas achei um pouco exagerado, então mantive apenas o copiar). Criar o botão foi fácil, mas passei mais tempo do que teria orgulho de admitir só para alinhar o botão na parte inferior direita, embaixo do output (no final, só precisava adicionar uma <div> e estava feito).

Feito isso, adicionei o botão de copiar nas configurações também e segui para o deploy no GitHub Pages. Ignorei completamente a demanda 'criar uma opção para alterar o config JSON' porque isso já estava disponível no site, não era preciso adicioná-la.

Também fiz com que um botão desabilitado fique borrado e levemente opaco. Quando eu estava traduzindo o botão de seleção de imagem, o efficientdet estava desabilitando o botão. Isso me deixou confuso, pois o código estava igual, mas no smolv estava funcionando. Usando o F12, notei o atributo disabled, fui atrás no código e achei a causa. Não modifiquei a lógica de negócios por trás disso, só deixei claro visualmente quando o botão está desativado.

### Trechos de código

- Deixar o botçao desabilitado óbvio:
   input#imageInput:disabled + label {
      cursor: not-allowed; /* Muda o cursor para aquele símbolo de "proibido" */
      opacity: 0.7;        /* Deixa o botão meio transparente */
      filter: blur(1px); /*  Deixa o botão borrado */
    }
  
- Foi só adicionar um maldito <div>:
    HTML:
      <div class="card">
        <h2>Output estruturado</h2>
        <pre id="output">{}</pre>
        <div class="flex">                             /* esse <div> que me refiro */
          <button id="copyOutputBtn" class="copy">    /* Estava tentando adicionar os atributos para a classe do botão, mas só consegui fazer funcionar com o <div> */
            Copiar output
          </button>
        </div>
      </div>
    CSS:
      .flex {
        display: flex;
        justify-content: flex-end;
        padding-top: 5px;
      }

- Escondi o botão em inglês e criei o label em português
    <input id="imageInput" type="file" accept="image/*" hidden>
        <label for="imageInput" class="button">
            Selecionar imagem
        </label>

## Tecnologias

### Linguagens e afins

- HTML
- CSS
- JavaScript

### Ambiente de desenvolvimento

Substitua este trecho por uma lista detalhada dos ambientes/ferramentas de desenvolvimento que você usou (por exemplo, VS Code + alguma extensão, agentes de IA, etc.)
- VS Code
- GPT
- Gemini

## Referências e créditos

- GPT
- Gemini
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
- https://developer.mozilla.org/en-US/docs/Glossary/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Box_alignment
- https://www.htmlgoodies.com/css/css-labels-buttons-forms/
- https://www.w3schools.com/cssref/css3_pr_filter.php




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
