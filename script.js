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


  // Img 1. Paste image
  document.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();

        reader.onload = () => {
          const imageData = reader.result;
          setImage(img, imageData);
          save();
        };
        reader.readAsDataURL(file);

        event.preventDefault();
        break;
      }
    }
  });


  // Img 2. Choose image file
  img.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      setImage(img, imageData);
      save();
    };
    reader.readAsDataURL(file);
  });

  // Img 3. DnD image file
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

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      setImage(img, imageData);
      save();
    };
    reader.readAsDataURL(file);
  });


  // Add old price
  addOldPriceCheckbox.addEventListener('change', () => {
    oldPrice.classList.toggle('hidden', !addOldPriceCheckbox.checked);
    addOldPriceDescriptionLabel.classList.toggle('hidden', !addOldPriceCheckbox.checked);
    if (!addOldPriceCheckbox.checked) {
      addOldPriceDescriptionCheckbox.checked = false;
      addOldPriceDescriptionCheckbox.dispatchEvent(new Event('change', {bubbles: true}));
    }
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

  document.addEventListener('input', save);

  function save() {
    const data = {
      title: document.querySelector('.title').textContent,
      img: img.src,
      price: document.querySelector('.main-price > [contenteditable]').textContent,
      isOldPrice: addOldPriceCheckbox.checked,
      oldPrice: document.querySelector('.old-price__value > [contenteditable]').textContent,
      isOldPriceDescription: addOldPriceDescriptionCheckbox.checked,
      oldPriceDescription: document.querySelector('.old-price__description').textContent,
      props: Array.from(document.querySelectorAll('.prop')).map(prop =>
      ({
        value: prop.querySelector('.prop__value').textContent,
        name: prop.querySelector('.prop__name').textContent
      }))
    };

    console.log('data: ', data);

    localStorage.setItem('data', JSON.stringify(data));
  }

  function load() {
    const data = JSON.parse(localStorage.getItem('data'));
    
    setImage(img, data?.img || './apartment1.webp');

    if (!data) return;

    document.querySelector('.title').textContent = data.title;
    document.querySelector('.main-price > [contenteditable]').textContent = data.price;
    addOldPriceCheckbox.checked = data.isOldPrice;
    addOldPriceCheckbox.dispatchEvent(new Event('change', {bubbles: true}));
    document.querySelector('.old-price__value > [contenteditable]').textContent = data.oldPrice;
    addOldPriceDescriptionCheckbox.checked = data.isOldPriceDescription;
    addOldPriceDescriptionCheckbox.dispatchEvent(new Event('change', {bubbles: true}));
    document.querySelector('.old-price__description').textContent = data.oldPriceDescription;
    data.props.forEach((prop, i) => {
      const propEl = document.querySelectorAll('.prop')[i];
      propEl.querySelector('.prop__value').textContent = prop.value;
      propEl.querySelector('.prop__name').textContent = prop.name;
    });
  }

  load();
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

