import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver/FileSaver';

let paginas = 1;

document.onkeydown = evento => {
    try {
        // quando o usuário apertar a tecla 's', 
        // salvar a imagem e remover a borda
        if (evento.keyCode === 83) {
            salvarImagem(true);
        }
    } catch (e) {
        console.error(e);
    }
};

function formatarNumero(numero: number): string {
    return ('000000' + numero).slice(-3);
}

async function salvarImagem(remover_borda: boolean = false): Promise<void> {
    const node = document.querySelector('#aREP');
    const barra: HTMLElement|null = document.querySelector('#bMB1');
    const sombra: HTMLElement|null = document.querySelector('#bSHI');

    if (node === null || barra === null || sombra === null) {
        console.error('Erro ao buscar imagem!');
        return;
    }

    //esconde a barra de navegação
    barra.style.display = 'none';
    sombra.style.display = 'none';

    try {
        const blob_borda: Blob = await domtoimage.toBlob(node);

        if (!remover_borda) {
            saveAs(blob_borda, 'naruto.png');
            return;
        }

        let imagem_borda = new Image();
        imagem_borda.src = URL.createObjectURL(blob_borda);
        imagem_borda.onload = () => {
            // canvas da imagem com borda
            const canvas_borda = imagemParaCanvas(imagem_borda);
            const canvas_recortado = removerBorda(canvas_borda);
            canvas_recortado.toBlob(blob => {
                saveAs(blob, `${paginas}.png`);
                paginas += 1;
            });
        }
    }
    catch (e) {
        console.error(e);
    }

    //volta a mostrar a barra de navegação
    barra.style.display = 'initial';
    sombra.style.display = 'initial';
}

function imagemParaCanvas(imagem: HTMLImageElement): HTMLCanvasElement {
    let canvas = document.createElement('canvas');
    if (canvas === null) {
        throw new Error('Erro ao transformar imagem em canvas');
    }

	canvas.width = imagem.width;
	canvas.height = imagem.height;
    
    let ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('Erro ao transformar imagem em canvas');
    }

    ctx.drawImage(imagem, 0, 0);
	return canvas;
}

function removerBorda(c: HTMLCanvasElement): HTMLCanvasElement {
    let ctx = c.getContext('2d');
    if (ctx === null) {
        throw new Error('Erro ao buscar contexto do canvas');
    }

    let copia = document.createElement('canvas').getContext('2d');
    if (copia === null) {
        throw new Error('Erro ao criar copia do canvas');
    }

    let pixels = ctx.getImageData(0, 0, c.width, c.height);
    let l = pixels.data.length;
    let i;
    let fronteira = {
        cima: <number|null> null,
        esquerda: <number|null> null,
        direita: <number|null> null,
        baixo: <number|null> null,
    };
    let x = 0;
    let y = 0;
  
    for (i = 0; i < l; i += 4) {
        if (pixels.data[i+3] !== 0) {
            x = (i / 4) % c.width;
            y = ~~((i / 4) / c.width);
        
            if (fronteira.cima === null) {
                fronteira.cima = y;
            }
            
            if (fronteira.esquerda === null) {
                fronteira.esquerda = x; 
            } else if (x < fronteira.esquerda) {
                fronteira.esquerda = x;
            }
            
            if (fronteira.direita === null) {
                fronteira.direita = x; 
            } else if (fronteira.direita < x) {
                fronteira.direita = x;
            }
            
            if (fronteira.baixo === null) {
                fronteira.baixo = y;
            } else if (fronteira.baixo < y) {
                fronteira.baixo = y;
            }
        }
    }

    if (fronteira.baixo === null || fronteira.cima === null ||
        fronteira.direita === null || fronteira.esquerda === null) {
        throw new Error('Fronteira inválida');
    }
      
    let trimAltura = fronteira.baixo - fronteira.cima;
    let trimLargura = fronteira.direita - fronteira.esquerda;
    let trimmed = ctx.getImageData(fronteira.esquerda, fronteira.cima, trimLargura, trimAltura);
    
    copia.canvas.width = trimLargura;
    copia.canvas.height = trimAltura;
    copia.putImageData(trimmed, 0, 0);
    
    return copia.canvas;
}