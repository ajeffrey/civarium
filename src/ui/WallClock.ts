export default (parent: HTMLElement) => {
  const timeLabel = document.createElement('span');
  timeLabel.style.position = 'absolute';
  timeLabel.style.background = 'red';
  timeLabel.style.color = 'white';
  timeLabel.style.left = '0';
  timeLabel.style.top = '0';
  timeLabel.style.fontFamily = 'Arial';
  timeLabel.style.padding = '2px 4px';
  parent.appendChild(timeLabel);

  return {
    setTime: (clockTime: number) => {
      timeLabel.textContent = `Time: ${Math.floor(clockTime / 60)}:${Math.floor(clockTime % 60)}`;
    },
  };
}