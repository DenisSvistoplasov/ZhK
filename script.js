const SCALE = 0.76;

document.addEventListener('DOMContentLoaded', () => {
  const layout = document.querySelector('.layout');
  const img = document.querySelector('.img');
  const download = document.querySelector('.download');
  const fileInput = document.querySelector('#fileInput');
  const oldPrice = document.querySelector('.old-price');
  const oldPriceDescription = document.querySelector('.old-price__description');
  const addOldPriceCheckbox = document.querySelector('.add-old-price>input');
  const addOldPriceDescriptionLabel = document.querySelector('.add-old-price-description');
  const addOldPriceDescriptionCheckbox = document.querySelector('.add-old-price-description>input');
  const roomsValueEl = document.querySelector('#rooms');
  const projectValueEl = document.querySelector('#project');

  layout.style.setProperty('--scale', SCALE);

  // Download
  download.addEventListener('click', async () => {
    const canvas = await html2canvas(layout, {
      useCORS: true,
      logging: true,
      scale: 1 / SCALE,
    });

    const link = document.createElement('a');
    link.download = `${projectValueEl.textContent}, ${roomsValueEl.textContent}.png`;
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

  // DnD image file
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    const items = event.dataTransfer.items;
    const hasImage = [...items].some(item =>
      item.kind === 'file' && item.type.startsWith('image/')
    );

    img.classList.toggle('drag-over', hasImage);
  });

  document.addEventListener('dragleave', () => {
    img.classList.remove('drag-over');
  });

  document.addEventListener('drop', (event) => {
    event.preventDefault();
    img.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];

    if (!file || !file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    setImage(img, url);
  });


  // Add old price
  addOldPriceCheckbox.addEventListener('change', () => {
    oldPrice.classList.toggle('hidden', !addOldPriceCheckbox.checked);
    addOldPriceDescriptionLabel.classList.toggle('hidden', !addOldPriceCheckbox.checked);
  });
  addOldPriceDescriptionCheckbox.addEventListener('change', () => {
    oldPriceDescription.classList.toggle('hidden', !addOldPriceDescriptionCheckbox.checked);
  });

  // Auto select-all on focus
  document.querySelectorAll('[contenteditable]').forEach((el) => {
    el.addEventListener('focus', () => {
      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(el);

      selection.removeAllRanges();
      selection.addRange(range);
    });
  });

  // Paste price
  document.querySelectorAll('.main-price > [contenteditable], .old-price__value > [contenteditable]').forEach((el) => {
    el.addEventListener('paste', (event) => {
      event.preventDefault();
      let text = event.clipboardData.getData('text');
      if (text.endsWith('₽')) text = text.slice(0, -1).trim();
      document.execCommand('insertText', false, text);
    });
  });
});


const BASE_IMG_WIDTH = 956;
const BASE_IMG_HEIGHT = 720;
const MIN_IMG_SCALE = 2;

function resizeImage(img) {
  const {naturalWidth, naturalHeight} = img;

  let scale = Math.min(
    BASE_IMG_WIDTH / naturalWidth,
    BASE_IMG_HEIGHT / naturalHeight,
    MIN_IMG_SCALE
  );

  if (scale > 1) scale **= 0.8;

  const {newWidth, newHeight} = {
    newWidth: naturalWidth * scale,
    newHeight: naturalHeight * scale
  };

  img.style.width = `${newWidth}px`;
  img.style.height = `${newHeight}px`;
}

function setImage(img, url) {
  img.onload = () => {
    resizeImage(img);
  };

  img.src = url;
}