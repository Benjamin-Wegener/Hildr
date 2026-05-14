export class InputState {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.mouse = {
      isRotating: false,
      deltaX: 0,
      deltaY: 0,
      isPointerLocked: false,
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.domElement.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.domElement.addEventListener("contextmenu", this.onContextMenu);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.domElement.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    this.domElement.removeEventListener("contextmenu", this.onContextMenu);
  }

  consumeMouseDelta() {
    const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    return delta;
  }

  isPressed(code) {
    return this.keys.has(code);
  }

  onKeyDown(event) {
    this.keys.add(event.code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  onMouseDown(event) {
    if (event.button === 0 && document.pointerLockElement !== this.domElement) {
      this.domElement.requestPointerLock?.();
    }

    if (event.button === 2) {
      this.mouse.isRotating = true;
    }
  }

  onMouseUp(event) {
    if (event.button === 2) {
      this.mouse.isRotating = false;
    }
  }

  onMouseMove(event) {
    if (typeof event.buttons === "number") {
      this.mouse.isRotating = (event.buttons & 2) === 2;
    }

    if (!this.mouse.isPointerLocked && !this.mouse.isRotating) return;
    this.mouse.deltaX += event.movementX || 0;
    this.mouse.deltaY += event.movementY || 0;
  }

  onPointerLockChange() {
    this.mouse.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  onContextMenu(event) {
    event.preventDefault();
    this.mouse.isRotating = false;
  }
}
