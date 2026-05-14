export function createHud() {
  const root = document.createElement("aside");
  root.className = "hud-panel";
  root.innerHTML = `
    <h1>HILDR</h1>
    <p class="hud-subtitle">Fjord Watch</p>
    <div class="hud-row"><span>Blessing</span><strong data-blessing>None</strong></div>
    <div class="hud-row"><span>Move</span><strong>WASD</strong></div>
    <div class="hud-row"><span>God Keys</span><strong>1 / 2 / 3</strong></div>
  `;
  document.body.appendChild(root);

  const blessingLabel = root.querySelector("[data-blessing]");

  return {
    setBlessing(text) {
      blessingLabel.textContent = text;
    },
  };
}
