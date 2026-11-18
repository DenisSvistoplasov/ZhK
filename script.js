const SCALE = 0.76;
const LAST_DATA_KEY = 'LAST_DATA_KEY';
const HISTORY_KEY = 'HISTORY_KEY';

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
  const historyListEl = document.querySelector('.history-list');

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

    saveInHistory();
    drawHistoryList();
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
          saveLastData();
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
      saveLastData();
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
      saveLastData();
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

  // Paste square
  document.querySelector('.prop.square>.prop__value>[contenteditable]').addEventListener('paste', (event) => {
    event.preventDefault();
    let text = event.clipboardData.getData('text');
    if (text.endsWith('м2') || text.endsWith('м²')) text = text.slice(0, -2).trim();
    document.execCommand('insertText', false, text);
  });

  // Paste capitalize
  document.querySelectorAll('.capitalize[contenteditable]').forEach((el) => {
    el.addEventListener('paste', (event) => {
      event.preventDefault();
      let text = event.clipboardData.getData('text');
      if (/[a-zA-Zа-яА-Я]/.test(text[0])) {
        text = text[0].toUpperCase() + text.slice(1);
      }
      document.execCommand('insertText', false, text);
    });
  });

  // Paste Completion date
  document.querySelector('#completionDate').addEventListener('paste', (event) => {
    event.preventDefault();
    let text = event.clipboardData.getData('text');
    console.log('text: ', text);
    text = text.replace(/(\d{1,2}) кв/, (_, quarter) => {
      const quarterRoman = {
        1: 'I',
        2: 'II',
        3: 'III',
        4: 'IV',
      }[quarter] || quarter;
      return quarterRoman+ ' кв';
    });

    document.execCommand('insertText', false, text);
  });


  document.addEventListener('input', saveLastData);
  document.querySelectorAll('[contenteditable]').forEach((el) => el.addEventListener('blur', () => {
    if (el.textContent === '') el.textContent = '–';
  }));

  // History
  function drawHistoryList() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyListEl.innerHTML = '';
    history.forEach(data => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      historyItem.textContent = data.props[0].value + ',' + data.props[2].value;
      historyItem.addEventListener('click', () => {
        load(data);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        history.splice(history.indexOf(data), 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        historyItem.remove();
      });

      historyItem.appendChild(deleteBtn);
      historyListEl.appendChild(historyItem);
    });
  }

  drawHistoryList();

  function getCurrentData() {
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
        value: prop.classList.contains('square') ? prop.querySelector('.prop__value>span').textContent : prop.querySelector('.prop__value').textContent,
        name: prop.querySelector('.prop__name').textContent,
        isSquare: prop.classList.contains('square'),
      }))
    };

    return data;
  }
  function saveLastData() {
    const data = getCurrentData();
    localStorage.setItem(LAST_DATA_KEY, JSON.stringify(data));
  }

  function saveInHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history.unshift(getCurrentData());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function loadLastData() {
    const data = JSON.parse(localStorage.getItem(LAST_DATA_KEY));
    load(data);
  }

  function load(data) {
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
      if (prop.isSquare) {
        propEl.querySelector('.prop__value>span').textContent = prop.value;
      }
      else {
        propEl.querySelector('.prop__value').textContent = prop.value;
      }
      propEl.querySelector('.prop__name').textContent = prop.name;
    });
  }

  loadLastData();
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

