// El dibujo a pluma de la casa natal es el unico activo grafico autentico de la finca.
// Se trata como grabado: linea clara sobre fondo oscuro, sobre un campo bordo.
// Se mantiene a escala moderada (x4) porque el original mide 252 px: mas amplificacion
// lo deshace. El grano del papel se simula con ruido, que oculta el escalonado.
import sharp from 'sharp';

const ORIGEN = 'public/img/marca/header-user1.jpg';
const ANCHO = 1400, ALTO = 1050;

// 1. Linea de la casa, invertida a blanco sobre negro
const linea = await sharp(ORIGEN)
  .extract({ left: 752, top: 0, width: 252, height: 86 })
  .resize({ width: 1008, kernel: 'lanczos3' })     // x4
  .greyscale().normalise().linear(2.1, -120).negate()
  .blur(0.4)
  .toBuffer();

// 2. Campo: negro con brasa bordo abajo
const campo = Buffer.from(
  `<svg width="${ANCHO}" height="${ALTO}">
     <defs>
       <radialGradient id="b" cx="50%" cy="102%" r="78%">
         <stop offset="0%" stop-color="#6d1417" stop-opacity="0.85"/>
         <stop offset="100%" stop-color="#0a0707" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <rect width="100%" height="100%" fill="#0a0707"/>
     <rect width="100%" height="100%" fill="url(#b)"/>
   </svg>`
);

await sharp(campo)
  .composite([
    { input: linea, left: Math.round((ANCHO - 1008) / 2), top: Math.round(ALTO * 0.34), blend: 'screen' },
  ])
  .modulate({ brightness: 0.96 })
  .webp({ quality: 86 })
  .toFile('public/img/foto/casa-natal.webp');

const m = await sharp('public/img/foto/casa-natal.webp').metadata();
console.log(`casa-natal.webp: ${m.width}x${m.height}`);
