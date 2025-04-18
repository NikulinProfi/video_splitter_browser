import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg/esm';

const ffmpeg = createFFmpeg({ log: true });

document.getElementById('file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('status');
  const downloadArea = document.getElementById('downloads');
  downloadArea.innerHTML = '';

  status.textContent = 'Загрузка FFmpeg...';
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  const fileName = 'input.mp4';
  ffmpeg.FS('writeFile', fileName, await fetchFile(file));

  status.textContent = 'Обработка видео...';

  await ffmpeg.run('-i', fileName, '-c', 'copy', '-map', '0', '-segment_time', '5', '-f', 'segment', 'output%03d.mp4');

  const files = ffmpeg.FS('readdir', '/').filter(f => f.startsWith('output') && f.endsWith('.mp4'));

  for (const name of files) {
    const data = ffmpeg.FS('readFile', name);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.textContent = `Скачать ${name}`;
    downloadArea.appendChild(a);
    downloadArea.appendChild(document.createElement('br'));
  }

  status.textContent = 'Готово!';
});