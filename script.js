document.addEventListener('DOMContentLoaded', () => {

  const layout = document.querySelector('.layout');
  const img = document.querySelector('.img');
  const download = document.querySelector('.download');
  const fileInput = document.querySelector('#fileInput');

  // Download
  download.addEventListener('click', async () => {
    const canvas = await html2canvas(layout, {
      useCORS: true,
      logging: true,
      scale: 1 / 0.76
    });

    const link = document.createElement('a');
    link.download = 'result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

  });


  // Paste image
  document.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const url = URL.createObjectURL(file);

        setImage(img, url);

        event.preventDefault();
        break;
      }
    }
  });


  // Choose image file
  img.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];

    if (!file) return;

    setImage(img, URL.createObjectURL(file));
  });
});


const MAX_IMG_WIDTH = 956;
const MAX_IMG_HEIGHT = 720;
const MIN_IMG_SCALE = 2;

function resizeImage(img) {
  const {naturalWidth, naturalHeight} = img;
  console.log('{naturalWidth, naturalHeight} : ', {naturalWidth, naturalHeight});

  const scale = Math.min(
    MAX_IMG_WIDTH / naturalWidth,
    MAX_IMG_HEIGHT / naturalHeight,
    MIN_IMG_SCALE
  );

  const {newWidth, newHeight} = {
    newWidth: naturalWidth * scale,
    newHeight: naturalHeight * scale
  };
  console.log('{newWidth, newHeight}: ', {newWidth, newHeight});

  img.style.width = `${naturalWidth * scale}px`;
  img.style.height = `${naturalHeight * scale}px`;
}

function setImage(img, url) {
  img.onload = () => {
    resizeImage(img);
  };

  img.src = url;
}