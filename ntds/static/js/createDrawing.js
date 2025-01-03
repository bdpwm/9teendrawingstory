document.addEventListener('DOMContentLoaded', function() {
const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentTool = 'brush';
  let lastX = 0;
  let lastY = 0;
  
  const maxStates = 10;
  let states = [];
  let currentStateIndex = -1;
  
  function saveState() {
      currentStateIndex++;
      states = states.slice(0, currentStateIndex);
      states.push(canvas.toDataURL());
      
      if (states.length > maxStates) {
          states.shift();
          currentStateIndex--;
      }
      
      updateUndoRedoButtons();
  }
  
  function updateUndoRedoButtons() {
      document.getElementById('undo').disabled = currentStateIndex < 1;
      document.getElementById('redo').disabled = currentStateIndex >= states.length - 1;
  }
  
  function undo() {
      if (currentStateIndex > 0) {
          currentStateIndex--;
          loadState(states[currentStateIndex]);
          updateUndoRedoButtons();
      }
  }
  
  function redo() {
      if (currentStateIndex < states.length - 1) {
          currentStateIndex++;
          loadState(states[currentStateIndex]);
          updateUndoRedoButtons();
      }
  }

  document.addEventListener('keydown', function(e) {
    const isModalOpen = modal.classList.contains('show');

    if (!isModalOpen) {
        if ((e.ctrlKey && e.key === 'z') || e.code === 'KeyZ') {
            e.preventDefault();
            undo();
        } else if ((e.ctrlKey && e.key === 'y') || e.code === 'KeyY') {
            e.preventDefault();
            redo();
        } else if (e.key === 'g' || e.code === 'KeyG') {
            e.preventDefault();
            modeSwitch.checked = !modeSwitch.checked;
            isDrawingMode = !modeSwitch.checked;
        } else if (e.key === 'c' || e.code === 'KeyC') {
            e.preventDefault();
            clear();
        } else if (e.key === 's' || e.code === 'KeyS') {
            e.preventDefault();
            colorPicker.click();
        }
    }
    });
  
  function loadState(state) {
      const img = new Image();
      img.src = state;
      img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
      };
  }
  
  function resizeCanvas() {
      const toolbarHeight = window.innerWidth <= 768 ? 130 : 75;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - toolbarHeight;
      ctx.fillStyle = document.getElementById('bgColor').value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (states.length === 0) saveState();
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  function getCoordinates(e) {
      if (e.type.includes('touch')) {
          return {
              x: e.touches[0].clientX - canvas.offsetLeft,
              y: e.touches[0].clientY - canvas.offsetTop
          };
      }
      return {
          x: e.offsetX,
          y: e.offsetY
      };
  }
  
  function startDrawing(e) {
      isDrawing = true;
      const coords = getCoordinates(e);
      [lastX, lastY] = [coords.x, coords.y];
  }
  
  function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      
      const coords = getCoordinates(e);
      
      ctx.lineJoin = 'round';
      ctx.lineCap = currentTool === 'pencil' ? 'butt' : 'round';
      ctx.lineWidth = document.getElementById('sizePicker').value;
  
      if (currentTool === 'brush' || currentTool === 'pencil') {
          ctx.strokeStyle = document.getElementById('colorPicker').value;
          ctx.globalAlpha = currentTool === 'pencil' ? 0.8 : 1;
      } else if (currentTool === 'eraser') {
          ctx.strokeStyle = document.getElementById('bgColor').value;
          ctx.globalAlpha = 1;
      }
  
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
  
      [lastX, lastY] = [coords.x, coords.y];
  }
  
  function stopDrawing() {
      if (isDrawing) {
          isDrawing = false;
          saveState();
      }
  }
  
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);
  
  const brushPencilBtn = document.getElementById('brushPencil');
  brushPencilBtn.addEventListener('click', (e) => {
      currentTool = currentTool === 'brush' ? 'pencil' : 'brush';
      brushPencilBtn.textContent = currentTool === 'brush' ? '✏️ Brush' : '📝 Pencil';
      document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      showCursor();
  });
  
  document.getElementById('eraser').addEventListener('click', (e) => {
      currentTool = 'eraser';
      document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      showCursor();
  });
  
  document.getElementById('clear').addEventListener('click', () => {
      ctx.fillStyle = document.getElementById('bgColor').value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      states = [];
      currentStateIndex = -1;
      saveState();
  });
  
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);
  
  document.getElementById('bgColor').addEventListener('change', (e) => {
      ctx.fillStyle = e.target.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
  });
  
  document.body.addEventListener('touchstart', (e) => {
      if (e.target === canvas) {
          e.preventDefault();
      }
  }, { passive: false });
  
  document.body.addEventListener('touchmove', (e) => {
      if (e.target === canvas) {
          e.preventDefault();
      }
  }, { passive: false });
  
  canvas.addEventListener('dragstart', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => e.preventDefault());
  
  brushPencilBtn.click();
  
  let cursorTimeout;
  
  function updateBrushCursor(e) {
      const cursor = document.getElementById('brush-cursor');
      const size = parseInt(document.getElementById('sizePicker').value);
      const rect = canvas.getBoundingClientRect();
      
      cursor.style.width = size + 'px';
      cursor.style.height = size + 'px';
      
      let x, y;
      if (e.type.includes('touch')) {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
      } else {
          x = e.clientX;
          y = e.clientY;
      }
      
      cursor.style.left = (x - size/2) + 'px';
      cursor.style.top = (y - size/2) + 'px';
      cursor.style.transform = 'translate(0, 0)';
  }
  
  function showCursor() {
      const cursor = document.getElementById('brush-cursor');
      cursor.style.display = 'block';
      
      if (currentTool === 'eraser') {
          cursor.style.borderColor = 'rgba(0, 0, 0, 0.5)';
      } else {
          const color = document.getElementById('colorPicker').value;
          cursor.style.borderColor = color.replace(')', ', 0.5)').replace('rgb', 'rgba');
      }
  }
  
  document.getElementById('colorPicker').addEventListener('change', () => {
      if (currentTool !== 'eraser') {
          showCursor();
      }
  });
  
  canvas.addEventListener('mouseenter', showCursor);
  canvas.addEventListener('touchstart', showCursor);
  
  document.getElementById('sizePicker').addEventListener('input', (e) => {
      const cursor = document.getElementById('brush-cursor');
      const size = parseInt(e.target.value);
      cursor.style.width = size + 'px';
      cursor.style.height = size + 'px';
  });
  
  canvas.addEventListener('mousemove', updateBrushCursor);
  canvas.addEventListener('touchmove', updateBrushCursor);
  document.querySelector('.toolbar').addEventListener('mousemove', updateBrushCursor);
  document.querySelector('.toolbar').addEventListener('touchmove', updateBrushCursor);
  
  canvas.addEventListener('mouseleave', () => {
      const cursor = document.getElementById('brush-cursor');
      cursor.style.display = 'none';
  });
  

  canvas.addEventListener('touchend', () => {
      const cursor = document.getElementById('brush-cursor');
      cursor.style.display = 'none';
  });


  const saveModal = document.getElementById('save-modal');
  const loginPromptModal = document.getElementById('login-prompt-modal');
  const saveBtn = document.getElementById('save');
  const cancelSaveBtn = document.getElementById('cancel-save');
  const confirmSaveBtn = document.getElementById('confirm-save');
  
  saveBtn.addEventListener('click', () => {
      loginPromptModal.style.display = 'flex';
  });
  
  cancelSaveBtn.addEventListener('click', () => {
      saveModal.style.display = 'none';

      document.getElementById('drawing-title').value = '';
      document.getElementById('drawing-description').value = '';
  });
  
  document.getElementById('cancel-login-prompt').addEventListener('click', () => {
      loginPromptModal.style.display = 'none';
  });
  
  confirmSaveBtn.addEventListener('click', () => {
      const title = document.getElementById('drawing-title').value;
      const description = document.getElementById('drawing-description').value;
      
      console.log({
          title,
          description,
          imageData: canvas.toDataURL()
      });
      
      saveModal.style.display = 'none';
      document.getElementById('drawing-title').value = '';
      document.getElementById('drawing-description').value = '';
  });
  
  saveModal.addEventListener('click', (e) => {
      if (e.target === saveModal) {
          saveModal.style.display = 'none';
          document.getElementById('drawing-title').value = '';
          document.getElementById('drawing-description').value = '';
      }
  });

  function saveToLocalStorage() {
      localStorage.setItem('savedDrawing', canvas.toDataURL());
      localStorage.setItem('savedBackground', document.getElementById('bgColor').value);
  }
  
  function loadFromLocalStorage() {
      const savedDrawing = localStorage.getItem('savedDrawing');
      const savedBackground = localStorage.getItem('savedBackground');
      
      if (savedDrawing) {
          const img = new Image();
          img.src = savedDrawing;
          img.onload = () => {
              if (savedBackground) {
                  document.getElementById('bgColor').value = savedBackground;
                  ctx.fillStyle = savedBackground;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              ctx.drawImage(img, 0, 0);
              saveState();
          };
      }
  }
  
  const originalStopDrawing = stopDrawing;
  stopDrawing = function() {
      originalStopDrawing();
      saveToLocalStorage();
  };
  
  const originalClear = document.getElementById('clear').onclick;
  document.getElementById('clear').onclick = function() {
      originalClear();
      saveToLocalStorage();
  };
  
  document.getElementById('bgColor').addEventListener('change', (e) => {
      ctx.fillStyle = e.target.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
      saveToLocalStorage();
  });
  
  window.addEventListener('load', loadFromLocalStorage);
  
  loginPromptModal.addEventListener('click', (e) => {
      if (e.target === loginPromptModal) {
          loginPromptModal.style.display = 'none';
      }
  });
});